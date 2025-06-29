import React from "react";
import ReactDOM from "react-dom/client";
import CssBaseline from "@mui/material/CssBaseline";
import { DockerMuiV6ThemeProvider } from "@docker/docker-mui-theme";

import { App } from "./App";
import { NgrokContextProvider } from "./components/NgrokContext";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    {/*
      If you eject from MUI (which we don't recommend!), you should add
      the `dockerDesktopTheme` class to your root <html> element to get
      some minimal Docker theming.
    */}
    <DockerMuiV6ThemeProvider>
      <CssBaseline />
      <NgrokContextProvider>
        <App />
      </NgrokContextProvider>
    </DockerMuiV6ThemeProvider>
  </React.StrictMode>
);
