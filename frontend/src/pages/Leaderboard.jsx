import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Trophy, Flame, Medal } from "lucide-react";
import Sidebar from "../components/layout/Sidebar";
import MobileNav from "../components/layout/MobileNav";
import Card from "../components/ui/Card";
import Skeleton from "../components/ui/Skeleton";
import { getLeaderboard } from "../lib/api";
import { useToast } from "../context/ToastContext";

const MEDAL_COLORS = ["text-amber-500", "text-ink-900/40 dark:text-paper-50/40", "text-amber-700"];

export default function Leaderboard() {
  const [board, setBoard] = useState([]);
  const [loading, setLoading] = useState(true);
  const { notify } = useToast();

  useEffect(() => {
    getLeaderboard()
      .then((res) => setBoard(res.data))
      .catch(() => notify("Couldn't load the leaderboard.", "error"))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen flex bg-paper-50 dark:bg-ink-950 text-ink-900 dark:text-paper-50">
      <Sidebar />

      <main className="flex-1 px-5 md:px-10 py-8 pb-24 md:pb-8 max-w-2xl mx-auto w-full">
        <div className="flex items-center gap-2 mb-2">
          <Trophy size={22} className="text-amber-500" />
          <h1 className="font-display text-2xl font-semibold">Leaderboard</h1>
        </div>
        <p className="text-sm text-ink-900/60 dark:text-paper-50/60 mb-6">
          Ranked by streak, then total hours. Only opted-in users appear here —{" "}
          <Link to="/settings" className="text-amber-500 hover:underline font-medium">
            join from Settings
          </Link>
          .
        </p>

        {loading ? (
          <div className="flex flex-col gap-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full" />
            ))}
          </div>
        ) : board.length === 0 ? (
          <Card className="text-center py-10">
            <Trophy className="mx-auto text-ink-900/30 dark:text-paper-50/30 mb-2" size={28} />
            <p className="text-sm font-medium text-ink-900/70 dark:text-paper-50/70">
              No one's on the leaderboard yet
            </p>
            <p className="text-xs text-ink-900/45 dark:text-paper-50/45 mt-1">
              Be the first — opt in from Settings.
            </p>
          </Card>
        ) : (
          <div className="flex flex-col gap-2">
            {board.map((entry) => (
              <Card
                key={entry.rank}
                className={`flex items-center gap-4 ${
                  entry.isMe ? "border-amber-500/40 bg-amber-500/5" : ""
                }`}
              >
                <div className="w-8 flex items-center justify-center shrink-0">
                  {entry.rank <= 3 ? (
                    <Medal size={20} className={MEDAL_COLORS[entry.rank - 1]} />
                  ) : (
                    <span className="tabular text-sm font-semibold text-ink-900/40 dark:text-paper-50/40">
                      {entry.rank}
                    </span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">
                    {entry.name} {entry.isMe && <span className="text-amber-500">(you)</span>}
                  </p>
                  <p className="text-xs text-ink-900/50 dark:text-paper-50/50">Level {entry.level}</p>
                </div>

                <div className="flex items-center gap-1.5 text-sm font-semibold shrink-0">
                  <Flame size={14} className="text-amber-500" />
                  <span className="tabular">{entry.streak}d</span>
                </div>

                <p className="tabular text-sm text-ink-900/60 dark:text-paper-50/60 w-16 text-right shrink-0">
                  {entry.totalHours.toFixed(0)}h
                </p>
              </Card>
            ))}
          </div>
        )}
      </main>

      <MobileNav />
    </div>
  );
}
