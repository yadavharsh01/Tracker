import { useEffect, useState } from "react";
import { Trophy } from "lucide-react";
import Card from "../ui/Card";
import Button from "../ui/Button";
import { getProfile, setLeaderboardOptIn } from "../../lib/api";
import { useToast } from "../../context/ToastContext";

export default function LeaderboardOptIn() {
  const [optedIn, setOptedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);
  const { notify } = useToast();

  useEffect(() => {
    getProfile()
      .then((res) => setOptedIn(Boolean(res.data.leaderboardOptIn)))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const toggle = async () => {
    setWorking(true);
    const next = !optedIn;
    try {
      await setLeaderboardOptIn(next);
      setOptedIn(next);
      notify(next ? "You're on the leaderboard." : "Removed from the leaderboard.");
    } catch {
      notify("Couldn't update that.", "error");
    } finally {
      setWorking(false);
    }
  };

  return (
    <Card>
      <div className="flex items-center gap-2 mb-3">
        <Trophy size={18} className="text-amber-500" />
        <h3 className="font-display font-semibold text-base">Leaderboard</h3>
      </div>
      <p className="text-sm text-ink-900/60 dark:text-paper-50/60 mb-4">
        {optedIn
          ? "Your name, streak, level, and total hours are visible on the public leaderboard."
          : "Opt in to appear on the leaderboard, ranked by streak and hours studied. Your email is never shown."}
      </p>
      {loading ? (
        <p className="text-sm text-ink-900/50 dark:text-paper-50/50">Loading…</p>
      ) : (
        <Button variant={optedIn ? "ghost" : "primary"} onClick={toggle} loading={working}>
          {optedIn ? "Leave leaderboard" : "Join leaderboard"}
        </Button>
      )}
    </Card>
  );
}
