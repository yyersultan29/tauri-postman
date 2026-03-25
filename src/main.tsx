import React from "react";
import ReactDOM from "react-dom/client";
import "@fontsource/manrope/latin-500.css";
import "@fontsource/manrope/cyrillic-500.css";
import "@fontsource/manrope/latin-700.css";
import "@fontsource/manrope/cyrillic-700.css";
import "@fontsource/jetbrains-mono/latin-400.css";
import "@fontsource/jetbrains-mono/cyrillic-400.css";
import App from "./App";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
