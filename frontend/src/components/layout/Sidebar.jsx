import { LayoutDashboard, LogOut, Moon, Sun, GraduationCap, ClipboardList, ListChecks, BookOpen } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { useNavigate, useLocation, Link } from "react-router-dom";

const NAV_ITEMS = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/mock-tests", label: "Mock tests", icon: ClipboardList },
  { to: "/sectional-tests", label: "Sectional scores", icon: ListChecks },
  { to: "/planner", label: "Planner", icon: BookOpen },
];

export default function Sidebar() {
  const { logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <aside className="hidden md:flex w-60 flex-col justify-between border-r border-ink-900/8 dark:border-paper-50/8 bg-white dark:bg-ink-900 px-4 py-6">
      <div>
        <div className="flex items-center gap-2 px-2 mb-8">
          <GraduationCap className="text-amber-500" size={22} />
          <span className="font-display font-semibold text-lg">CAT Tracker</span>
        </div>

        <nav className="flex flex-col gap-1">
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => {
            const isActive = location.pathname === to;
            return (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-ink-900/5 dark:bg-paper-50/8 text-ink-900 dark:text-paper-50"
                    : "text-ink-900/60 dark:text-paper-50/60 hover:bg-ink-900/5 dark:hover:bg-paper-50/8"
                }`}
              >
                <Icon size={18} />
                {label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="flex flex-col gap-1">
        <button
          onClick={toggleTheme}
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-ink-900/70 dark:text-paper-50/70 hover:bg-ink-900/5 dark:hover:bg-paper-50/8"
        >
          {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          {theme === "dark" ? "Light mode" : "Dark mode"}
        </button>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-danger-500 hover:bg-danger-500/8"
        >
          <LogOut size={18} />
          Log out
        </button>
      </div>
    </aside>
  );
}
