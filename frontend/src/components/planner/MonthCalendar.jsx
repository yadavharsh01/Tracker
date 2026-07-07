import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Card from "../ui/Card";
import Skeleton from "../ui/Skeleton";

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];

function intensityClass(minutes) {
  if (!minutes) return "bg-ink-900/5 dark:bg-paper-50/6";
  if (minutes < 30) return "bg-teal-500/25";
  if (minutes < 60) return "bg-teal-500/50";
  if (minutes < 120) return "bg-teal-500/75";
  return "bg-teal-500";
}

export default function MonthCalendar({ dailyMinutes, loading }) {
  const [cursor, setCursor] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });

  const { year, month } = cursor;
  const firstOfMonth = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startWeekday = firstOfMonth.getDay();
  const monthLabel = firstOfMonth.toLocaleDateString(undefined, { month: "long", year: "numeric" });

  const goPrev = () => {
    setCursor((c) => (c.month === 0 ? { year: c.year - 1, month: 11 } : { year: c.year, month: c.month - 1 }));
  };
  const goNext = () => {
    setCursor((c) => (c.month === 11 ? { year: c.year + 1, month: 0 } : { year: c.year, month: c.month + 1 }));
  };

  const today = new Date();
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;

  const cells = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let day = 1; day <= daysInMonth; day++) cells.push(day);

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display font-semibold text-base">{monthLabel}</h3>
        <div className="flex gap-1">
          <button
            onClick={goPrev}
            aria-label="Previous month"
            className="p-1.5 rounded-lg hover:bg-ink-900/6 dark:hover:bg-paper-50/8"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={goNext}
            aria-label="Next month"
            className="p-1.5 rounded-lg hover:bg-ink-900/6 dark:hover:bg-paper-50/8"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {loading ? (
        <Skeleton className="h-64 w-full" />
      ) : (
        <>
          <div className="grid grid-cols-7 gap-1.5 mb-1.5">
            {WEEKDAYS.map((d, i) => (
              <div
                key={i}
                className="text-center text-[11px] font-medium text-ink-900/40 dark:text-paper-50/40"
              >
                {d}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1.5">
            {cells.map((day, i) => {
              if (day === null) return <div key={`empty-${i}`} />;

              const dateKey = new Date(year, month, day).toLocaleDateString();
              const minutes = dailyMinutes.get(dateKey) || 0;
              const isToday = isCurrentMonth && today.getDate() === day;

              return (
                <div
                  key={day}
                  title={minutes > 0 ? `${minutes} min studied` : "No sessions"}
                  className={`aspect-square rounded-lg flex items-center justify-center text-xs font-medium
                    ${intensityClass(minutes)}
                    ${minutes >= 60 ? "text-white" : "text-ink-900/70 dark:text-paper-50/70"}
                    ${isToday ? "ring-2 ring-amber-500" : ""}`}
                >
                  {day}
                </div>
              );
            })}
          </div>
        </>
      )}
    </Card>
  );
}
