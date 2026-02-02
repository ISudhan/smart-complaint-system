import { useEffect, useState } from "react";
import { useNavigate, Link, Outlet, useLocation } from "react-router-dom";
import {
  Shield,
  LayoutDashboard,
  FileText,
  LogOut,
  Menu,
  X,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { authService } from "@/services/authService";

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [admin, setAdmin] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const currentAdmin = await authService.getCurrentAdmin();
    if (!currentAdmin) {
      navigate("/admin/login");
    } else {
      setAdmin(currentAdmin);
    }
    setIsLoading(false);
  };

  const handleLogout = async () => {
    await authService.logout();
    navigate("/admin/login");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  const navItems = [
    { path: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { path: "/admin/complaints", label: "Complaints", icon: FileText },
    { path: "/admin/staff", label: "Staff", icon: Users },
  ];

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside
        className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-sidebar transform transition-transform duration-200
        lg:relative lg:translate-x-0
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
      `}
      >
        <div className="h-full flex flex-col">
          {/* Logo */}
          <div className="p-4 border-b border-sidebar-border">
            <Link
              to="/admin/dashboard"
              className="flex items-center gap-3 text-sidebar-foreground"
            >
              <Shield className="h-8 w-8 text-sidebar-primary" />
              <div>
                <h1 className="font-bold leading-tight">KEC Complaint Portal</h1>
                <p className="text-xs text-sidebar-foreground/60">Admin Panel</p>
              </div>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1">
            {navItems.map((item) => {
              const isActive =
                location.pathname === item.path ||
                (item.path === "/admin/complaints" &&
                  location.pathname.startsWith("/admin/complaints")) ||
                (item.path === "/admin/staff" &&
                  location.pathname.startsWith("/admin/staff"));

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                    ${isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                    }
                  `}
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* User Info & Logout */}
          <div className="p-4 border-t border-sidebar-border">
            {admin && (
              <div className="mb-3 px-3">
                <p className="text-sm font-medium text-sidebar-foreground">
                  {admin.name}
                </p>
                <p className="text-xs text-sidebar-foreground/60 capitalize">
                  {admin.role}
                </p>
              </div>
            )}
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="w-full justify-start gap-3 text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
            >
              <LogOut className="h-5 w-5" />
              Sign Out
            </Button>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top Bar */}
        <header className="bg-card border-b px-4 py-3 flex items-center justify-between lg:justify-end">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>

          <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">
            View Public Site →
          </Link>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
