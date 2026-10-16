import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./Login.tsx";

import "./index.css";
// Loaded last so the shared theme applies to every page.
import "./styles/theme.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>

    <BrowserRouter>
      <App />
    </BrowserRouter>

  </React.StrictMode>
);