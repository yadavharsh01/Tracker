import { LayoutDashboard, ClipboardList, ListChecks, BookOpen, Moon, Sun, LogOut } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";

const NAV_ITEMS = [
  { to: "/dashboard", label: "Home", icon: LayoutDashboard },
  { to: "/mock-tests", label: "Mocks", icon: ClipboardList },
  { to: "/sectional-tests", label: "Sections", icon: ListChecks },
  { to: "/planner", label: "Planner", icon: BookOpen },
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
        border-t border-ink-900/8 dark:border-paper-50/8 bg-white dark:bg-ink-900 px-1 py-1.5
        pb-[max(0.375rem,env(safe-area-inset-bottom))]"
      aria-label="Primary"
    >
      {NAV_ITEMS.map(({ to, label, icon: Icon }) => {
        const isActive = location.pathname === to;
        return (
          <Link
            key={to}
            to={to}
            className={`flex flex-1 flex-col items-center gap-0.5 px-0.5 py-1 rounded-lg text-[10px] font-medium whitespace-nowrap ${
              isActive
                ? "text-amber-500"
                : "text-ink-900/60 dark:text-paper-50/60"
            }`}
          >
            <Icon size={18} />
            {label}
          </Link>
        );
      })}

      <button
        onClick={toggleTheme}
        aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
        className="flex flex-1 flex-col items-center gap-0.5 px-0.5 py-1 rounded-lg text-[10px] font-medium text-ink-900/60 dark:text-paper-50/60"
      >
        {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
        Theme
      </button>

      <button
        onClick={handleLogout}
        aria-label="Log out"
        className="flex flex-1 flex-col items-center gap-0.5 px-0.5 py-1 rounded-lg text-[10px] font-medium text-danger-500"
      >
        <LogOut size={18} />
        Log out
      </button>
    </nav>
  );
}
