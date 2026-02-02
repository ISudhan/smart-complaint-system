import { Link } from "react-router-dom";
import { Shield } from "lucide-react";

export function Header() {
  return (
    <header className="institution-header">
      <div className="container mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <Shield className="h-8 w-8" />
          <div>
            <h1 className="text-lg font-bold leading-tight">
              KEC Complaint Portal
            </h1>
            <p className="text-xs opacity-80">
              Confidential Complaint Management System
            </p>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-4">
          <Link to="/" className="text-sm hover:underline opacity-90 hover:opacity-100">
            Home
          </Link>
          <Link to="/track" className="text-sm hover:underline opacity-90 hover:opacity-100">
            Track Status
          </Link>
          <Link to="/admin/login" className="text-sm hover:underline opacity-90 hover:opacity-100">
            Admin Login
          </Link>
        </nav>
      </div>
    </header>
  );
}
