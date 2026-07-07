import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";
import Card from "../ui/Card";
import Skeleton from "../ui/Skeleton";

export default function ScoreTrendChart({ trend, loading }) {
  const hasData = trend && trend.length > 1;

  const data = (trend || []).map((t) => ({
    name: new Date(t.date).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
    Score: t.totalScore ?? null,
    Percentile: t.percentile ?? null,
  }));

  return (
    <Card>
      <h3 className="font-display font-semibold text-base mb-4">Score &amp; percentile trend</h3>

      {loading ? (
        <Skeleton className="h-56 w-full" />
      ) : !hasData ? (
        <div className="h-56 flex flex-col items-center justify-center text-center gap-1">
          <p className="text-sm font-medium text-ink-900/70 dark:text-paper-50/70">
            Not enough data yet
          </p>
          <p className="text-xs text-ink-900/45 dark:text-paper-50/45">
            Log at least two mock tests to see your trend line.
          </p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={224}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.08} />
            <XAxis
              dataKey="name"
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
            <Tooltip contentStyle={{ borderRadius: 12, border: "none", fontSize: 13 }} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Line type="monotone" dataKey="Score" stroke="#E8A33D" strokeWidth={2} dot={{ r: 3 }} connectNulls />
            <Line type="monotone" dataKey="Percentile" stroke="#0F766E" strokeWidth={2} dot={{ r: 3 }} connectNulls />
          </LineChart>
        </ResponsiveContainer>
      )}
    </Card>
  );
}
