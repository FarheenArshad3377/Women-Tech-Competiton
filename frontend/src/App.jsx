
import { useEffect, useState } from "react";
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import { authApi } from "./api/auth";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";

function AppRoutes() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function restoreSession() {
      try {
        const data = await authApi.me();
        if (active) setUser(data.user);
      } catch {
        try {
          const data = await authApi.refresh();
          if (active) setUser(data.user);
        } catch {
          if (active) setUser(null);
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    restoreSession();

    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return <p className="page-message">Loading your account...</p>;
  }

  return (
    <Routes>
      <Route
        path="/"
        element={
          <Navigate to={user ? "/dashboard" : "/login"} replace />
        }
      />

      <Route
        path="/login"
        element={
          user ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <Login onLogin={setUser} />
          )
        }
      />

      <Route
        path="/register"
        element={
          user ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <Register onLogin={setUser} />
          )
        }
      />

      <Route element={<ProtectedRoute user={user} loading={loading} />}>
        <Route
          path="/dashboard"
          element={<Dashboard user={user} onLogout={() => setUser(null)} />}
        />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}