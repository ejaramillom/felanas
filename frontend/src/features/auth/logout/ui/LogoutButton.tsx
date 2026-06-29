import { LogOut } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export function LogoutButton() {
  const { logout } = useAuth();
  return (
    <button onClick={logout} className="flex items-center gap-2 px-3 py-2 rounded-md text-sm w-full hover:bg-white/10 transition-colors"
      style={{ color: "hsl(var(--sidebar-text-muted))" }}>
      <LogOut className="h-4 w-4" />
      Sign out
    </button>
  );
}
