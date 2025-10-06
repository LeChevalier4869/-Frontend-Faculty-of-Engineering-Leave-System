import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { AuthContextProvider } from "./contexts/AuthContext.jsx";
import ReactDOM from "react-dom/client";
import React from "react";
import './index.css'
import App from "./App.jsx";
import { LeaveRequestContextProvider } from "./contexts/LeaveRequestContext.jsx";


ReactDOM.createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthContextProvider>
      <LeaveRequestContextProvider>
        <App />
      </LeaveRequestContextProvider>
    </AuthContextProvider>
  </StrictMode>
);

