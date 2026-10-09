
import { Navigate, Outlet } from "react-router-dom";

export default function ProtectedRoute({ user, loading }) {
  if (loading) {
    return <p className="page-message">Checking your session...</p>;
  }

  return user ? <Outlet /> : <Navigate to="/login" replace />;
}