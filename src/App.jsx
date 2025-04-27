import { useState } from "react";
import "./App.css";
import useAuth from "./hooks/useAuth";
import AppRouter from "./routes/AppRouter";

function App() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900 text-white font-kanit">
        <p className="text-4xl font-bold">Loading...</p>
      </div>
    );
  }

  return <AppRouter />;
}

export default App;
