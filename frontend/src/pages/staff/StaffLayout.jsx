import { useEffect, useState } from "react";
import { useNavigate, Link, Outlet, useLocation } from "react-router-dom";
import {
    Users,
    LayoutDashboard,
    FileText,
    LogOut,
    Menu,
    X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { authService } from "@/services/authService";

export default function StaffLayout() {
    const navigate = useNavigate();
    const location = useLocation();
    const [staff, setStaff] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        const currentUser = await authService.getCurrentUser();
        const userRole = authService.getUserRole();

        if (!currentUser || userRole !== "staff") {
            navigate("/staff/login");
        } else {
            setStaff(currentUser);
        }
        setIsLoading(false);
    };

    const handleLogout = async () => {
        await authService.logout();
        navigate("/staff/login");
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="animate-pulse text-muted-foreground">Loading...</div>
            </div>
        );
    }

    const navItems = [
        { path: "/staff/dashboard", label: "Dashboard", icon: LayoutDashboard },
        { path: "/staff/complaints", label: "My Complaints", icon: FileText },
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
                            to="/staff/dashboard"
                            className="flex items-center gap-3 text-sidebar-foreground"
                        >
                            <Users className="h-8 w-8 text-blue-500" />
                            <div>
                                <h1 className="font-bold leading-tight">KEC Complaint Portal</h1>
                                <p className="text-xs text-sidebar-foreground/60">Staff Panel</p>
                            </div>
                        </Link>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 p-4 space-y-1">
                        {navItems.map((item) => {
                            const isActive =
                                location.pathname === item.path ||
                                (item.path === "/staff/complaints" &&
                                    location.pathname.startsWith("/staff/complaints"));

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
                                    <item.icon className="h-4 w-4 flex-shrink-0" />
                                    <span>{item.label}</span>
                                </Link>
                            );
                        })}
                    </nav>

                    {/* User Info & Logout */}
                    <div className="p-4 border-t border-sidebar-border">
                        <div className="mb-3 px-3 py-2 bg-sidebar-accent/30 rounded-lg">
                            <p className="text-xs text-sidebar-foreground/60 mb-0.5">Logged in as</p>
                            <p className="text-sm font-semibold text-sidebar-foreground truncate">
                                {staff?.name}
                            </p>
                            <p className="text-xs text-sidebar-foreground/70 truncate">
                                {staff?.email}
                            </p>
                            {staff?.specializations && staff.specializations.length > 0 && (
                                <div className="mt-2 flex flex-wrap gap-1">
                                    {staff.specializations.slice(0, 2).map((spec) => (
                                        <span
                                            key={spec}
                                            className="text-xs px-2 py-0.5 bg-blue-500/20 text-blue-600 rounded"
                                        >
                                            {spec}
                                        </span>
                                    ))}
                                    {staff.specializations.length > 2 && (
                                        <span className="text-xs px-2 py-0.5 bg-sidebar-accent text-sidebar-foreground/60 rounded">
                                            +{staff.specializations.length - 2}
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>
                        <Button
                            onClick={handleLogout}
                            variant="outline"
                            className="w-full justify-start gap-2 text-sm border-sidebar-border hover:bg-sidebar-accent"
                        >
                            <LogOut className="h-4 w-4" />
                            Logout
                        </Button>
                    </div>
                </div>
            </aside>

            {/* Mobile Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-h-screen">
                {/* Top Bar */}
                <header className="sticky top-0 z-30 bg-card border-b border-border px-4 py-3 lg:px-6">
                    <div className="flex items-center justify-between">
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="lg:hidden p-2 hover:bg-accent rounded-lg transition-colors"
                        >
                            {sidebarOpen ? (
                                <X className="h-5 w-5" />
                            ) : (
                                <Menu className="h-5 w-5" />
                            )}
                        </button>

                        <div className="flex-1 lg:flex-none">
                            <h2 className="text-lg font-semibold text-foreground">
                                Staff Dashboard
                            </h2>
                        </div>

                        <div className="hidden lg:flex items-center gap-3">
                            <div className="text-right text-sm">
                                <p className="font-medium text-foreground">{staff?.name}</p>
                                <p className="text-xs text-muted-foreground">Staff Member</p>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 p-4 lg:p-6 bg-background">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
