import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import Card from "../ui/Card";
import Skeleton from "../ui/Skeleton";

// Palette drawn from the design tokens, cycled if there are more subjects than colors.
const COLORS = ["#E8A33D", "#0F766E", "#DC4C3F", "#6B7CA6", "#B98A2F", "#14958A"];

export default function TimeUtilizationChart({ data, loading }) {
  const hasData = data && data.length > 0;

  return (
    <Card>
      <h3 className="font-display font-semibold text-base mb-4">Time by subject</h3>

      {loading ? (
        <Skeleton className="h-56 w-full" />
      ) : !hasData ? (
        <div className="h-56 flex flex-col items-center justify-center text-center gap-1">
          <p className="text-sm font-medium text-ink-900/70 dark:text-paper-50/70">
            No sessions logged yet
          </p>
          <p className="text-xs text-ink-900/45 dark:text-paper-50/45">
            Log a session with a subject to see where your time goes.
          </p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={224}>
          <PieChart>
            <Pie
              data={data}
              dataKey="minutes"
              nameKey="subject"
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={80}
              paddingAngle={2}
            >
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="none" />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ borderRadius: 12, border: "none", fontSize: 13 }}
              formatter={(value) => [`${value} min`, "Time"]}
            />
            <Legend wrapperStyle={{ fontSize: 12 }} />
          </PieChart>
        </ResponsiveContainer>
      )}
    </Card>
  );
}
