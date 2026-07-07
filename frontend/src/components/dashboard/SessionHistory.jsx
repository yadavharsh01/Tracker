import { useState } from "react";
import Card from "../ui/Card";
import Skeleton from "../ui/Skeleton";

const RANGES = [
  { key: "week", label: "This week" },
  { key: "month", label: "This month" },
  { key: "all", label: "All time" },
];

export default function SessionHistory({ sessions, loading, range, onRangeChange }) {
  return (
    <Card>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h3 className="font-display font-semibold text-base">Session history</h3>
        <div className="flex gap-1">
          {RANGES.map((r) => (
            <button
              key={r.key}
              onClick={() => onRangeChange(r.key)}
              className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${
                range === r.key
                  ? "bg-amber-500 text-ink-950"
                  : "bg-ink-900/6 dark:bg-paper-50/8 text-ink-900/60 dark:text-paper-50/60"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      ) : sessions.length === 0 ? (
        <p className="text-sm text-ink-900/50 dark:text-paper-50/50 text-center py-8">
          No sessions logged in this range.
        </p>
      ) : (
        <div className="flex flex-col gap-1 max-h-80 overflow-y-auto">
          {sessions.map((s) => (
            <div
              key={s._id}
              className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg hover:bg-ink-900/3 dark:hover:bg-paper-50/5"
            >
              <div>
                <p className="text-sm font-medium">{s.subject}</p>
                <p className="text-xs text-ink-900/50 dark:text-paper-50/50">
                  {new Date(s.date).toLocaleDateString(undefined, {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                  })}
                </p>
              </div>
              <p className="tabular text-sm font-medium text-ink-900/70 dark:text-paper-50/70">
                {s.duration} min
              </p>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
