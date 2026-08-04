import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  BarChart3,
  User as UserIcon,
  LogOut,
  Shield,
  Info,
} from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/contracts", icon: FileText, label: "Contracts" },
  { to: "/evaluations", icon: BarChart3, label: "Evaluations" },
  { to: "/about", icon: Info, label: "About" },
];

export function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/8 bg-[#0b0f19]/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Left: Brand Logo */}
        <NavLink to="/" className="flex items-center gap-3 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
            <Shield className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-bold tracking-tight gradient-text">
            ClauseLens
          </span>
        </NavLink>

        {/* Right: Navigation Items & User Menu */}
        <div className="flex items-center gap-1 sm:gap-4">
          <nav className="flex items-center gap-1 sm:gap-2">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-2 rounded-xl px-3 py-2 text-xs sm:text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-white/10 text-white shadow-sm"
                      : "text-slate-400 hover:bg-white/5 hover:text-slate-200",
                  )
                }
              >
                <item.icon className="h-4 w-4 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>

          <div className="h-5 w-px bg-white/10 mx-1 hidden sm:block" />

          {/* User badge & Logout */}
          {user && (
            <div className="flex items-center gap-2">
              <div className="hidden md:flex items-center gap-2 rounded-xl bg-white/5 px-3 py-1.5 border border-white/8">
                <UserIcon className="h-3.5 w-3.5 text-indigo-400" />
                <span className="text-xs font-medium text-slate-200 max-w-[120px] truncate">
                  {user.full_name || user.email.split("@")[0]}
                </span>
              </div>

              <button
                onClick={handleLogout}
                title="Sign out"
                className="flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs sm:text-sm text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Sign out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
