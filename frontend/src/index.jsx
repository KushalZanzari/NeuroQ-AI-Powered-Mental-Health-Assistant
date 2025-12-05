import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";   // <- THIS MUST EXIST
import App from "./App.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

