import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export function PublicRoute() {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex justify-center items-center min-h-screen"><div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--color-brand)] border-t-transparent" /></div>;
  return user ? <Navigate to="/" replace /> : <Outlet />;
}
