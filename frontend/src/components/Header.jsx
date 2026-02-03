import { Link, useLocation } from "react-router-dom";
import { Menu, X, Home, Search, UserCog, Users } from "lucide-react";
import { useState } from "react";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 backdrop-blur-lg bg-white/5 border-b border-white/10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">

          {/* Brand */}
          <Link to="/" className="group flex flex-col leading-tight">
            <span className="text-lg font-semibold tracking-tight group-hover:opacity-90 transition">
              KEC Complaint Portal
            </span>
            <span className="text-xs text-black">
              Secure & Confidential Reporting
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            <Link
              to="/"
              className={`nav-link ${isActive("/") && "nav-active"}`}
            >
              <Home className="h-4 w-4" />
              Home
            </Link>

            <Link
              to="/track"
              className={`nav-link ${isActive("/track") && "nav-active"}`}
            >
              <Search className="h-4 w-4" />
              Track Status
            </Link>

            <Link
              to="/staff/login"
              className="ml-3 inline-flex items-center gap-2 rounded-full bg-blue-500/20 px-5 py-2 text-sm font-medium backdrop-blur hover:bg-blue-500/30 transition"
            >
              <Users className="h-4 w-4" />
              Staff Login
            </Link>

            <Link
              to="/admin/login"
              className="ml-2 inline-flex items-center gap-2 rounded-full bg-white/20 px-5 py-2 text-sm font-medium backdrop-blur hover:bg-white/30 transition"
            >
              <UserCog className="h-4 w-4" />
              Admin Login
            </Link>
          </nav>

          {/* Mobile Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden rounded-lg p-2 hover:bg-white/10 transition"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-3 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-lg p-3 shadow-lg">
            <nav className="flex flex-col gap-2">
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className="mobile-link"
              >
                <Home className="h-4 w-4" />
                Home
              </Link>

              <Link
                to="/track"
                onClick={() => setMobileMenuOpen(false)}
                className="mobile-link"
              >
                <Search className="h-4 w-4" />
                Track Status
              </Link>

              <Link
                to="/staff/login"
                onClick={() => setMobileMenuOpen(false)}
                className="mt-1 rounded-xl bg-blue-500/20 px-4 py-2 text-center text-sm font-medium hover:bg-blue-500/30 transition flex items-center justify-center gap-2"
              >
                <Users className="h-4 w-4" />
                Staff Login
              </Link>

              <Link
                to="/admin/login"
                onClick={() => setMobileMenuOpen(false)}
                className="mt-1 rounded-xl bg-white/20 px-4 py-2 text-center text-sm font-medium hover:bg-white/30 transition flex items-center justify-center gap-2"
              >
                <UserCog className="h-4 w-4" />
                Admin Login
              </Link>
            </nav>
          </div>
        )}
      </div>

      {/* Tailwind utility classes */}
      <style>
        {`
          .nav-link {
            display: inline-flex;
            align-items: center;
            gap: 0.4rem;
            padding: 0.5rem 1rem;
            font-size: 0.875rem;
            border-radius: 9999px;
            opacity: 0.85;
            transition: all 0.2s ease;
          }
          .nav-link:hover {
            opacity: 1;
            background: rgba(255,255,255,0.12);
          }
          .nav-active {
            background: rgba(255,255,255,0.18);
            opacity: 1;
          }
          .mobile-link {
            display: flex;
            align-items: center;
            gap: 0.6rem;
            padding: 0.6rem 0.8rem;
            border-radius: 0.75rem;
            font-size: 0.875rem;
            transition: background 0.2s ease;
          }
          .mobile-link:hover {
            background: rgba(255,255,255,0.12);
          }
        `}
      </style>
    </header>
  );
}
