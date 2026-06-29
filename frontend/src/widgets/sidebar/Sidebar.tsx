import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Users, DollarSign, Calendar, Settings, LogOut } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/shared/lib/utils";
import logo from "@/assets/logo.png";

const navItems = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard", enabled: true },
  { to: "/employees", icon: Users, label: "Employees", enabled: false },
  { to: "/payroll", icon: DollarSign, label: "Payroll", enabled: false },
  { to: "/schedule", icon: Calendar, label: "Schedule", enabled: false },
  { to: "/settings", icon: Settings, label: "Settings", enabled: false },
];

export function Sidebar() {
  const { company, logout } = useAuth();
  const { pathname } = useLocation();

  return (
    <aside
      data-testid="sidebar"
      className="w-64 min-h-screen flex flex-col"
      style={{ backgroundColor: "hsl(var(--sidebar-bg))", color: "hsl(var(--sidebar-text))" }}
    >
      <div className="p-6 border-b" style={{ borderColor: "hsl(var(--sidebar-border))" }}>
        <img src={logo} alt="Felanas" className="h-10 w-auto mb-2" />
        {company && <p className="text-xs truncate" style={{ color: "hsl(var(--sidebar-text-muted))" }}>{company.name}</p>}
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(({ to, icon: Icon, label, enabled }) => (
          <Link
            key={to}
            to={enabled ? to : "#"}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
              !enabled && "opacity-40 cursor-not-allowed pointer-events-none",
              enabled && pathname === to
                ? "font-medium"
                : "hover:bg-white/10"
            )}
            style={enabled && pathname === to ? { color: "hsl(var(--sidebar-active))", backgroundColor: "hsl(var(--sidebar-active) / 0.1)" } : {}}
          >
            <Icon className="h-4 w-4 flex-shrink-0" />
            {label}
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t" style={{ borderColor: "hsl(var(--sidebar-border))" }}>
        <button
          onClick={logout}
          className="flex items-center gap-2 px-3 py-2 rounded-md text-sm w-full hover:bg-white/10 transition-colors"
          style={{ color: "hsl(var(--sidebar-text-muted))" }}
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
