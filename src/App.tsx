import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/Login";
import RegisterPage from "./pages/Register";
import auth from "./services/auth";

function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div>
        <h1 className="text-3xl font-bold">Welcome</h1>
        <p className="mt-4">You're logged in (demo)</p>
        <button onClick={() => { auth.clearToken(); window.location.reload(); }} className="mt-4 px-4 py-2 bg-red-500 text-white rounded">Sign out</button>
      </div>
    </div>
  );
}

function ProtectedRoute({ children }: { children: JSX.Element }) {
  const token = auth.getToken();
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  // Set demo mode (true = localStorage fallback). For production, set to false (call server).
  auth.setDemoMode(true);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/" element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
}