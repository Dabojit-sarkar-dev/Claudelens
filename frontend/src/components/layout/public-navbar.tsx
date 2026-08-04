import { Link, NavLink } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";

export function PublicNavbar() {
  const { isAuthenticated } = useAuth();

  return (
    <>
      {/* Top Banner Ticker */}
      <div className="bg-gradient-to-r from-indigo-900/60 via-violet-900/60 to-purple-900/60 border-b border-white/10 py-1.5 px-4 text-center text-xs font-medium text-indigo-200">
        <span className="inline-flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
          <span>ClauseLens v1.0: Real-time LLM Contract Risk Intelligence Engine is Live</span>
          <span className="text-white font-semibold underline underline-offset-2 ml-1 cursor-pointer">
            Explore Features &rarr;
          </span>
        </span>
      </div>

      {/* Main Public Navbar */}
      <header className="sticky top-0 z-40 w-full border-b border-white/8 bg-[#0b0f19]/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <img
              src="/clauselens.png"
              alt="ClauseLens"
              className="h-11 w-11 sm:h-12 sm:w-12 object-contain scale-110 group-hover:scale-125 transition-transform"
            />
            <span className="text-lg font-bold tracking-tight gradient-text">
              ClauseLens
            </span>
          </Link>

          {/* Center: Public Navigation Links */}
          <nav className="hidden md:flex items-center gap-6">
            <a
              href="#features"
              className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
            >
              Features
            </a>
            <NavLink
              to="/docs"
              className={({ isActive }) =>
                `text-sm font-medium transition-colors ${
                  isActive ? "text-indigo-400 font-semibold" : "text-slate-300 hover:text-white"
                }`
              }
            >
              Docs
            </NavLink>
            <NavLink
              to="/about"
              className={({ isActive }) =>
                `text-sm font-medium transition-colors ${
                  isActive ? "text-indigo-400 font-semibold" : "text-slate-300 hover:text-white"
                }`
              }
            >
              About
            </NavLink>
          </nav>

          {/* Right: Auth Action CTAs */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <Link to="/dashboard" className="btn-primary py-2 px-4 text-xs sm:text-sm">
                Go to Dashboard &rarr;
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-xs sm:text-sm font-medium text-slate-300 hover:text-white px-3 py-2 rounded-xl hover:bg-white/5 transition-colors"
                >
                  Log in
                </Link>
                <Link
                  to="/signup"
                  className="btn-primary py-2 px-4 text-xs sm:text-sm"
                >
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      </header>
    </>
  );
}
