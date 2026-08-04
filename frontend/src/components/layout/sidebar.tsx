import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  BarChart3,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Shield,
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/contracts", icon: FileText, label: "Contracts" },
  { to: "/evaluations", icon: BarChart3, label: "Evaluations" },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <aside
      className={cn(
        "flex flex-col h-screen sticky top-0 border-r border-white/8 bg-surface/80 backdrop-blur-xl transition-all duration-300",
        collapsed ? "w-[72px]" : "w-[260px]",
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 h-16 border-b border-white/8">
        <div className="flex items-center justify-center h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shrink-0">
          <Shield className="h-5 w-5 text-white" />
        </div>
        {!collapsed && (
          <span className="font-bold text-lg tracking-tight gradient-text">
            ClauseLens
          </span>
        )}
      </div>

      {/* Nav links */}
      <nav className="flex-1 py-4 px-3 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 group",
                isActive
                  ? "bg-white/10 text-white shadow-sm"
                  : "text-slate-400 hover:bg-white/5 hover:text-slate-200",
              )
            }
          >
            <item.icon
              className={cn(
                "h-5 w-5 shrink-0 transition-colors",
              )}
            />
            {!collapsed && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* User + collapse */}
      <div className="border-t border-white/8 p-3 space-y-2">
        {!collapsed && user && (
          <div className="rounded-xl bg-white/5 px-3 py-2.5">
            <p className="text-sm font-medium text-slate-200 truncate">
              {user.full_name}
            </p>
            <p className="text-xs text-slate-500 truncate">{user.email}</p>
          </div>
        )}
        <div className="flex items-center gap-2">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-colors flex-1"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            {!collapsed && <span>Sign out</span>}
          </button>
          <button
            onClick={() => setCollapsed((c) => !c)}
            className="rounded-xl p-2.5 text-slate-500 hover:bg-white/5 hover:text-slate-300 transition-colors"
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>
    </aside>
  );
}
