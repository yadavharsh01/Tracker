import Card from "../ui/Card";
import Skeleton from "../ui/Skeleton";

export default function Heatmap({ activeDates, loading }) {
  const days = Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (29 - i));
    const key = date.toLocaleDateString();
    return { key, active: activeDates?.has(key) };
  });

  return (
    <Card>
      <h3 className="font-display font-semibold text-base mb-4">Last 30 days</h3>
      {loading ? (
        <Skeleton className="h-32 w-full" />
      ) : (
        <div className="grid grid-cols-10 gap-1.5">
          {days.map((day) => (
            <div
              key={day.key}
              title={day.key}
              className={`aspect-square rounded-md ${
                day.active
                  ? "bg-teal-500"
                  : "bg-ink-900/8 dark:bg-paper-50/8"
              }`}
            />
          ))}
        </div>
      )}
    </Card>
  );
}
