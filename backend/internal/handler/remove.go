package handler

import (
	"net/http"

	"github.com/labstack/echo/v4"

	"github.com/ngrok/ngrok-docker-extension/internal/session"
)

func (h *Handler) RemoveTunnel(ctx echo.Context) error {
	ctr := ctx.Param("container")
	if ctr == "" {
		return ctx.String(http.StatusBadRequest, "container is required")
	}
	h.logger.Info("Removing tunnel for container", "container", ctr)

	session.Cache.Lock()
	defer session.Cache.Unlock()

	session.Cache.Tunnels[ctr].Endpoint.Close()

	delete(session.Cache.Tunnels, ctr)

	return ctx.JSON(http.StatusOK, session.Cache.Tunnels)
}
