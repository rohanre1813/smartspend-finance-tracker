import { useContext, useState, useRef, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate, useLocation, Link } from "react-router-dom";
import {
  LogOut, TrendingUp, LayoutDashboard,
  Plus, User as UserIcon, ChevronDown
} from "lucide-react";
import { Button } from "@/components/ui/button";

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  // Don't show full navbar on landing/login/register pages
  const isAuthPage = ["/", "/login", "/register"].includes(location.pathname);

  if (isAuthPage) return null;

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">

        {/* Logo */}
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => navigate("/dashboard")}
        >
          <div className="bg-primary p-1.5 rounded-lg">
            <TrendingUp size={18} className="text-primary-foreground" />
          </div>
          <span className="text-lg font-bold text-foreground">
            Smart<span className="text-muted-foreground">Spend</span>
          </span>
        </div>

        {/* Center nav links */}
        {user && (
          <div className="hidden sm:flex items-center gap-1">
            <Link
              to="/dashboard"
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition
                ${isActive("/dashboard")
                  ? "bg-secondary text-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                }`}
            >
              <LayoutDashboard size={15} />
              Dashboard
            </Link>
          </div>
        )}

        {/* Right side */}
        <div className="flex items-center gap-3">
          {user ? (
            <>
              {/* Add Transaction button */}
              <Button
                size="sm"
                className="gap-2 hidden sm:flex"
                onClick={() => navigate("/transaction/create")}
              >
                <Plus size={15} />
                Add Transaction
              </Button>

              {/* User dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen((p) => !p)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-background hover:bg-secondary transition text-sm"
                >
                  {/* Avatar circle */}
                  <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold">
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden sm:block text-foreground font-medium max-w-25 truncate">
                    {user.name}
                  </span>
                  <ChevronDown
                    size={14}
                    className={`text-muted-foreground transition-transform ${dropdownOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {/* Dropdown menu */}
                {dropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-52 bg-card border border-border rounded-xl shadow-lg overflow-hidden z-50">
                    {/* User info */}
                    <div className="px-4 py-3 border-b border-border">
                      <p className="text-sm font-semibold text-foreground truncate">
                        {user.name}
                      </p>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">
                        {user.email}
                      </p>
                    </div>

                    {/* Menu items */}
                    <div className="p-1.5">
                      <button
                        onClick={() => {
                          setDropdownOpen(false);
                          navigate("/dashboard");
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-foreground hover:bg-secondary transition text-left"
                      >
                        <LayoutDashboard size={15} className="text-muted-foreground" />
                        Dashboard
                      </button>
                      <button
                        onClick={() => {
                          setDropdownOpen(false);
                          navigate("/transaction/create");
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-foreground hover:bg-secondary transition text-left"
                      >
                        <Plus size={15} className="text-muted-foreground" />
                        Add Transaction
                      </button>
                    </div>

                    {/* Logout */}
                    <div className="p-1.5 border-t border-border">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition text-left"
                      >
                        <LogOut size={15} />
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => navigate("/login")}>
                Sign In
              </Button>
              <Button size="sm" onClick={() => navigate("/register")}>
                Get Started
              </Button>
            </div>
          )}
        </div>

      </div>
    </nav>
  );
};

export default Navbar;