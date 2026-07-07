import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import Card from "../ui/Card";
import Skeleton from "../ui/Skeleton";

export default function StudyChart({ data, loading }) {
  const hasData = data && data.length > 0;

  return (
    <Card>
      <h3 className="font-display font-semibold text-base mb-4">Study minutes by day</h3>

      {loading ? (
        <Skeleton className="h-56 w-full" />
      ) : !hasData ? (
        <div className="h-56 flex flex-col items-center justify-center text-center gap-1">
          <p className="text-sm font-medium text-ink-900/70 dark:text-paper-50/70">
            No sessions logged yet
          </p>
          <p className="text-xs text-ink-900/45 dark:text-paper-50/45">
            Log your first study session to see it charted here.
          </p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={224}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.08} />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12, fill: "currentColor", opacity: 0.6 }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              tick={{ fontSize: 12, fill: "currentColor", opacity: 0.6 }}
              tickLine={false}
              axisLine={false}
              width={32}
            />
            <Tooltip
              contentStyle={{
                borderRadius: 12,
                border: "none",
                fontSize: 13,
              }}
            />
            <Bar dataKey="minutes" fill="#E8A33D" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </Card>
  );
}
