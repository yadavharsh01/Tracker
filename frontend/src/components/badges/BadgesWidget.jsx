import Card from "../ui/Card";
import Skeleton from "../ui/Skeleton";
import BadgeIcon from "./BadgeIcon";

export default function BadgesWidget({ badges, loading }) {
  const earnedCount = badges?.filter((b) => b.earned).length ?? 0;

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display font-semibold text-base">Achievements</h3>
        {!loading && (
          <span className="tabular text-xs text-ink-900/50 dark:text-paper-50/50">
            {earnedCount}/{badges.length}
          </span>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
          {Array.from({ length: 10 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
          {badges.map((badge) => (
            <div
              key={badge.id}
              title={badge.description}
              className={`flex flex-col items-center justify-center gap-1.5 rounded-xl p-3 text-center transition-opacity ${
                badge.earned
                  ? "bg-amber-500/12 text-amber-600 dark:text-amber-400"
                  : "bg-ink-900/5 dark:bg-paper-50/6 text-ink-900/30 dark:text-paper-50/25"
              }`}
            >
              <BadgeIcon id={badge.id} size={20} />
              <p className="text-[11px] font-medium leading-tight">{badge.name}</p>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
