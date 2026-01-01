import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  MessageSquareWarning, 
  LayoutDashboard, 
  PlusCircle, 
  LogIn,
  Menu,
  X
} from "lucide-react";
import { useState } from "react";

interface HeaderProps {
  isAuthenticated?: boolean;
  userRole?: string;
  userName?: string;
  onLogout?: () => void;
}

export function Header({ isAuthenticated, userRole, userName, onLogout }: HeaderProps) {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = isAuthenticated ? [
    { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { path: "/submit", label: "Submit Grievance", icon: PlusCircle },
  ] : [];

  if (isAuthenticated && userRole === 'admin') {
    navItems.push({ path: "/admin", label: "Admin Panel", icon: LayoutDashboard });
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <MessageSquareWarning className="h-5 w-5" />
          </div>
          <span className="font-display text-xl font-bold">GrievEase</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link key={item.path} to={item.path}>
                <Button 
                  variant={isActive ? "secondary" : "ghost"} 
                  size="sm"
                  className="gap-2"
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Button>
              </Link>
            );
          })}
        </nav>

        {/* Auth Section */}
        <div className="hidden items-center gap-3 md:flex">
          {isAuthenticated ? (
            <>
              <span className="text-sm text-muted-foreground">
                Welcome, <span className="font-medium text-foreground">{userName}</span>
              </span>
              <Button variant="outline" size="sm" onClick={onLogout}>
                Logout
              </Button>
            </>
          ) : (
            <Link to="/auth">
              <Button variant="default" size="sm" className="gap-2">
                <LogIn className="h-4 w-4" />
                Sign In
              </Button>
            </Link>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="border-t border-border bg-background p-4 md:hidden animate-fade-in">
          <nav className="flex flex-col gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link 
                  key={item.path} 
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Button variant="ghost" className="w-full justify-start gap-2">
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Button>
                </Link>
              );
            })}
            {isAuthenticated ? (
              <Button variant="outline" className="mt-2" onClick={onLogout}>
                Logout
              </Button>
            ) : (
              <Link to="/auth" onClick={() => setMobileMenuOpen(false)}>
                <Button className="w-full gap-2">
                  <LogIn className="h-4 w-4" />
                  Sign In
                </Button>
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
