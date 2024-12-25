import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { AuthContextProvider } from "./contexts/AuthContext.jsx";
import ReactDOM from "react-dom/client";
import React from "react";
import './index.css'
import App from "./App.jsx";


ReactDOM.createRoot(document.getElementById("root")).render(
  <AuthContextProvider>
    <App />
  </AuthContextProvider>
);

