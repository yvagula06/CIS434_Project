import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate, Link } from "react-router-dom";
import LoginPage from "./pages/Login";
import RegisterPage from "./pages/Register";
import auth from "./services/auth";

function Landing() {
  // Public landing page — user will NOT be automatically redirected to login.
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 p-6">
      <div className="w-full max-w-2xl text-center bg-white p-8 rounded shadow text-gray-900">
        <h1 className="text-4xl font-bold mb-4">My App</h1>
        <p className="mb-6">Welcome. You can browse public pages here. Sign in to access your dashboard.</p>
        <div className="space-x-3">
          <Link to="/login" className="px-4 py-2 bg-blue-600 text-white rounded">Sign in</Link>
          <Link to="/register" className="px-4 py-2 bg-gray-200 text-gray-900 rounded">Create account</Link>
        </div>
      </div>
    </div>
  );
}

function Dashboard({ user }: { user: any }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="bg-white p-6 rounded shadow text-gray-900">
        <h1 className="text-3xl font-bold">Welcome{user?.name ? `, ${user.name}` : ""}</h1>
        <p className="mt-4">You're logged into the protected area.</p>
        <button onClick={() => { window.location.href = "/"; }} className="mt-4 px-4 py-2 bg-red-500 text-white rounded">Sign out (reload)</button>
      </div>
    </div>
  );
}

function ProtectedRoute({ children }: { children: JSX.Element }) {
  const [loading, setLoading] = useState(true);
  const [authed, setAuthed] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const meRes = await auth.me();
        if (!mounted) return;
        if (meRes && meRes.user) {
          setUser(meRes.user);
          setAuthed(true);
        } else {
          setAuthed(false);
        }
      } catch {
        setAuthed(false);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Checking authentication…</div>;
  if (!authed) return <Navigate to="/login" replace />;
  // Pass user via React context or props — for simplicity we render children
  return children;
}

export default function App() {
  // Use server mode. Ensure frontend/.env has VITE_API_BASE set to your backend.
  auth.setDemoMode(false);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/app" element={
          <ProtectedRoute>
            <Dashboard user={null} />
          </ProtectedRoute>
        } />
        {/* Any unknown path -> landing */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}