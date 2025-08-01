package main

import (
	"context"
	"fmt"
	"log/slog"
	"net"
	"net/http"
	"os"
	"path/filepath"
	"time"

	"github.com/docker/docker/client"
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"

	"github.com/ngrok/ngrok-docker-extension/internal/detectproto"
	"github.com/ngrok/ngrok-docker-extension/internal/handler"
	"github.com/ngrok/ngrok-docker-extension/internal/manager"
	"github.com/ngrok/ngrok-docker-extension/internal/store"
)

// ngrokExtension encapsulates all the state and functionality of the ngrok Docker extension
type ngrokExtension struct {
	// Configuration
	socketPath string
	logger     *slog.Logger

	// HTTP server components
	router  *echo.Echo
	handler *handler.Handler

	// State management components
	store   store.Store
	manager manager.Manager
}

// newNgrokExtension creates and initializes a new ngrok extension instance
func newNgrokExtension(socketPath string, logger *slog.Logger) (*ngrokExtension, error) {
	ext := &ngrokExtension{
		socketPath: socketPath,
		logger:     logger,
	}

	// Initialize store from volume-mounted path
	if err := ext.initStore(); err != nil {
		return nil, fmt.Errorf("failed to initialize store: %w", err)
	}

	// Create manager with store dependency
	if err := ext.initManager(); err != nil {
		return nil, fmt.Errorf("failed to initialize manager: %w", err)
	}

	// Initialize router
	if err := ext.initRouter(); err != nil {
		return nil, fmt.Errorf("failed to initialize router: %w", err)
	}

	// Initialize handler with all dependencies
	ext.initHandler()

	return ext, nil
}

// initRouter sets up the Echo router with middleware and error handling
func (ext *ngrokExtension) initRouter() error {
	ext.router = echo.New()
	ext.router.HTTPErrorHandler = func(err error, c echo.Context) {
		ext.logger.Error("HTTP error", "error", err)
		c.JSON(http.StatusInternalServerError, err.Error())
	}
	ext.router.HideBanner = true

	logMiddleware := middleware.LoggerWithConfig(middleware.LoggerConfig{
		Skipper: middleware.DefaultSkipper,
		Format: `{"time":"${time_rfc3339_nano}","id":"${id}",` +
			`"host":"${host}","method":"${method}","uri":"${uri}","user_agent":"${user_agent}",` +
			`"status":${status},"error":"${error}","latency":${latency},"latency_human":"${latency_human}"` +
			`,"bytes_in":${bytes_in},"bytes_out":${bytes_out}}` + "\n",
		CustomTimeFormat: "2006-01-02 15:04:05.00000",
		Output:           os.Stdout,
	})
	ext.router.Use(logMiddleware)

	return nil
}

// initStore initializes the file store from environment variable
func (ext *ngrokExtension) initStore() error {
	// Get state directory from environment variable
	stateDir := os.Getenv("NGROK_EXT_STATE_DIR")
	if stateDir == "" {
		stateDir = "/tmp" // fallback for development
	}

	statePath := filepath.Join(stateDir, "state.json")
	ext.store = store.NewFileStoreWithLogger(statePath, ext.logger)

	return nil
}

// initManager initializes the manager with store and Docker client
func (ext *ngrokExtension) initManager() error {
	// Create Docker client
	dockerClient, err := client.NewClientWithOpts(client.FromEnv, client.WithAPIVersionNegotiation())
	if err != nil {
		return fmt.Errorf("failed to create Docker client: %w", err)
	}

	// Create ngrok SDK wrapper
	ngrokSDK := &ngrokWrapper{}

	// Get extension version from environment
	extensionVersion := os.Getenv("EXTENSION_VERSION")
	if extensionVersion == "" {
		extensionVersion = "unknown"
	}

	// Create protocol detector
	protocolDetector := detectproto.NewDetector()

	// Create manager with extension version and 5 second converge interval
	convergeInterval := 5 * time.Second
	ext.manager = manager.NewManager(ext.store, ngrokSDK, &dockerWrapper{dockerClient}, protocolDetector, ext.logger, extensionVersion, convergeInterval)

	return nil
}

// initHandler creates the HTTP handler with all dependencies
func (ext *ngrokExtension) initHandler() {
	ext.handler = handler.New(ext.router, ext.manager, ext.store, ext.logger)
}

// Run starts the extension and runs until the context is cancelled
func (ext *ngrokExtension) Run(ctx context.Context) error {
	// Remove any existing socket file
	_ = os.RemoveAll(ext.socketPath)

	ext.logger.Info("Starting listening", "socketPath", ext.socketPath)
	ln, err := net.Listen("unix", ext.socketPath)
	if err != nil {
		return fmt.Errorf("failed to listen on socket: %w", err)
	}
	ext.router.Listener = ln

	// Start server in goroutine
	serverErrChan := make(chan error, 1)
	go func() {
		server := &http.Server{
			Addr: "",
		}

		if err := ext.router.StartServer(server); err != nil && err != http.ErrServerClosed {
			serverErrChan <- fmt.Errorf("failed to start server: %w", err)
		}
		close(serverErrChan)
	}()

	// Run initial convergence after server starts
	go func() {
		// Add timeout to convergence
		convergeCtx, cancel := context.WithTimeout(ctx, 5*time.Second)
		defer cancel()

		ext.logger.Info("Starting initial convergence")
		if err := ext.manager.Converge(convergeCtx); err != nil {
			ext.logger.Error("Initial convergence failed", "error", err)
		} else {
			ext.logger.Info("Initial convergence completed successfully")
		}
	}()

	// Wait for context cancellation or server error
	select {
	case <-ctx.Done():
		ext.logger.Info("Shutting down due to context cancellation")
		return ext.shutdown()
	case err := <-serverErrChan:
		if err != nil {
			return err
		}
		return nil
	}
}

// shutdown gracefully shuts down the extension
func (ext *ngrokExtension) shutdown() error {
	shutdownCtx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Shutdown manager gracefully
	if err := ext.manager.Shutdown(shutdownCtx); err != nil {
		ext.logger.Warn("Error shutting down manager", "error", err)
	}

	if err := ext.router.Shutdown(shutdownCtx); err != nil {
		return fmt.Errorf("failed to shutdown server gracefully: %w", err)
	}

	return nil
}
