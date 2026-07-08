import { useState } from "react";
import {
  LayoutDashboard,
  ClipboardList,
  ListChecks,
  BookOpen,
  MoreHorizontal,
  GraduationCap,
  Settings as SettingsIcon,
  Moon,
  Sun,
  LogOut,
  X,
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";

const PRIMARY_ITEMS = [
  { to: "/dashboard", label: "Home", icon: LayoutDashboard },
  { to: "/mock-tests", label: "Mocks", icon: ClipboardList },
  { to: "/sectional-tests", label: "Sections", icon: ListChecks },
  { to: "/planner", label: "Planner", icon: BookOpen },
];

const MORE_LINKS = [
  { to: "/colleges", label: "Colleges", icon: GraduationCap },
  { to: "/settings", label: "Settings", icon: SettingsIcon },
];

export default function MobileNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [moreOpen, setMoreOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isMoreActive = MORE_LINKS.some((l) => l.to === location.pathname);

  return (
    <>
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around
          border-t border-ink-900/8 dark:border-paper-50/8 bg-white dark:bg-ink-900 px-1 py-1.5
          pb-[max(0.375rem,env(safe-area-inset-bottom))]"
        aria-label="Primary"
      >
        {PRIMARY_ITEMS.map(({ to, label, icon: Icon }) => {
          const isActive = location.pathname === to;
          return (
            <Link
              key={to}
              to={to}
              className={`flex flex-1 flex-col items-center gap-0.5 px-0.5 py-1 rounded-lg text-[10px] font-medium whitespace-nowrap ${
                isActive ? "text-amber-500" : "text-ink-900/60 dark:text-paper-50/60"
              }`}
            >
              <Icon size={18} />
              {label}
            </Link>
          );
        })}

        <button
          onClick={() => setMoreOpen(true)}
          aria-label="More"
          className={`flex flex-1 flex-col items-center gap-0.5 px-0.5 py-1 rounded-lg text-[10px] font-medium whitespace-nowrap ${
            isMoreActive ? "text-amber-500" : "text-ink-900/60 dark:text-paper-50/60"
          }`}
        >
          <MoreHorizontal size={18} />
          More
        </button>
      </nav>

      {moreOpen && (
        <div
          className="md:hidden fixed inset-0 z-50 flex items-end bg-ink-950/50 backdrop-blur-sm"
          onClick={() => setMoreOpen(false)}
        >
          <div
            className="w-full bg-white dark:bg-ink-900 rounded-t-2xl p-4 pb-[max(1rem,env(safe-area-inset-bottom))] animate-fade-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-ink-900/60 dark:text-paper-50/60">More</p>
              <button onClick={() => setMoreOpen(false)} aria-label="Close" className="p-1">
                <X size={18} />
              </button>
            </div>

            <div className="flex flex-col gap-1">
              {MORE_LINKS.map(({ to, label, icon: Icon }) => (
                <Link
                  key={to}
                  to={to}
                  onClick={() => setMoreOpen(false)}
                  className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium hover:bg-ink-900/5 dark:hover:bg-paper-50/8"
                >
                  <Icon size={18} />
                  {label}
                </Link>
              ))}

              <button
                onClick={() => {
                  toggleTheme();
                  setMoreOpen(false);
                }}
                className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium hover:bg-ink-900/5 dark:hover:bg-paper-50/8"
              >
                {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
                {theme === "dark" ? "Light mode" : "Dark mode"}
              </button>

              <button
                onClick={handleLogout}
                className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-danger-500 hover:bg-danger-500/8"
              >
                <LogOut size={18} />
                Log out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
