import { Flame } from "lucide-react";

function isToday(dateStr) {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  const today = new Date();
  return (
    d.getFullYear() === today.getFullYear() &&
    d.getMonth() === today.getMonth() &&
    d.getDate() === today.getDate()
  );
}

export default function StreakRiskBanner({ streak, lastActiveDate }) {
  const studiedToday = isToday(lastActiveDate);

  // Nothing to protect yet, or already safe today — stay out of the way.
  if (!streak || streak < 1 || studiedToday) return null;

  return (
    <div className="flex items-center gap-3 rounded-xl border border-danger-500/25 bg-danger-500/8 px-4 py-3 mb-6 animate-fade-up">
      <Flame className="text-danger-500 shrink-0" size={20} />
      <p className="text-sm font-medium text-ink-900 dark:text-paper-50">
        You haven't logged a session today — your {streak}-day streak is on the line.
      </p>
    </div>
  );
}
