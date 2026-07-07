import { LayoutDashboard, ClipboardList, BookOpen, Moon, Sun, LogOut } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";

const NAV_ITEMS = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/mock-tests", label: "Mocks", icon: ClipboardList },
  { to: "/planner", label: "Topics", icon: BookOpen },
];

export default function MobileNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around
        border-t border-ink-900/8 dark:border-paper-50/8 bg-white dark:bg-ink-900 px-2 py-2
        pb-[max(0.5rem,env(safe-area-inset-bottom))]"
      aria-label="Primary"
    >
      {NAV_ITEMS.map(({ to, label, icon: Icon }) => {
        const isActive = location.pathname === to;
        return (
          <Link
            key={to}
            to={to}
            className={`flex flex-1 flex-col items-center gap-0.5 px-1 py-1.5 rounded-lg text-[11px] font-medium ${
              isActive
                ? "text-amber-500"
                : "text-ink-900/60 dark:text-paper-50/60"
            }`}
          >
            <Icon size={19} />
            {label}
          </Link>
        );
      })}

      <button
        onClick={toggleTheme}
        aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
        className="flex flex-1 flex-col items-center gap-0.5 px-1 py-1.5 rounded-lg text-[11px] font-medium text-ink-900/60 dark:text-paper-50/60"
      >
        {theme === "dark" ? <Sun size={19} /> : <Moon size={19} />}
        Theme
      </button>

      <button
        onClick={handleLogout}
        aria-label="Log out"
        className="flex flex-1 flex-col items-center gap-0.5 px-1 py-1.5 rounded-lg text-[11px] font-medium text-danger-500"
      >
        <LogOut size={19} />
        Log out
      </button>
    </nav>
  );
}
