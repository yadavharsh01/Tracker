import { useEffect, useState } from "react";
import Card from "../ui/Card";
import Input from "../ui/Input";
import Button from "../ui/Button";
import Skeleton from "../ui/Skeleton";
import { listGoalProgress, setGoal } from "../../lib/api";
import { useToast } from "../../context/ToastContext";

const PERIODS = [
  { key: "daily", label: "Daily" },
  { key: "weekly", label: "Weekly" },
  { key: "monthly", label: "Monthly" },
];

export default function GoalsWidget() {
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingPeriod, setEditingPeriod] = useState(null);
  const [targetInput, setTargetInput] = useState("");
  const [saving, setSaving] = useState(false);
  const { notify } = useToast();

  const load = async () => {
    setLoading(true);
    try {
      const res = await listGoalProgress();
      setProgress(res.data);
    } catch {
      notify("Couldn't load your goals.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const progressFor = (period) => progress.find((p) => p.period === period);

  const startEditing = (period, current) => {
    setEditingPeriod(period);
    setTargetInput(current ? String(current.targetMinutes) : "");
  };

  const handleSave = async (period) => {
    const minutes = Number(targetInput);
    if (!minutes || minutes <= 0) {
      notify("Enter a positive number of minutes", "error");
      return;
    }
    setSaving(true);
    try {
      await setGoal(period, minutes);
      notify("Goal updated.");
      setEditingPeriod(null);
      load();
    } catch (err) {
      notify(err.response?.data?.msg || "Couldn't save that goal.", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <h3 className="font-display font-semibold text-base mb-4">Study goals</h3>

      {loading ? (
        <div className="flex flex-col gap-3">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {PERIODS.map(({ key, label }) => {
            const current = progressFor(key);
            const isEditing = editingPeriod === key;

            return (
              <div key={key}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-medium">{label}</span>
                  {current && !isEditing && (
                    <span className="tabular text-xs text-ink-900/50 dark:text-paper-50/50">
                      {current.achievedMinutes} / {current.targetMinutes} min
                    </span>
                  )}
                </div>

                {isEditing ? (
                  <div className="flex items-center gap-2">
                    <Input
                      id={`goal-${key}`}
                      type="number"
                      min="1"
                      placeholder="Target minutes"
                      value={targetInput}
                      onChange={(e) => setTargetInput(e.target.value)}
                      className="py-2"
                    />
                    <Button
                      variant="secondary"
                      className="px-3 py-2"
                      loading={saving}
                      onClick={() => handleSave(key)}
                    >
                      Save
                    </Button>
                  </div>
                ) : current ? (
                  <button
                    onClick={() => startEditing(key, current)}
                    className="w-full text-left"
                    aria-label={`Edit ${label.toLowerCase()} goal`}
                  >
                    <div className="h-2 rounded-full bg-ink-900/8 dark:bg-paper-50/8 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-amber-500 transition-all"
                        style={{ width: `${current.completionPercent}%` }}
                      />
                    </div>
                  </button>
                ) : (
                  <Button variant="ghost" className="text-xs px-2 py-1" onClick={() => startEditing(key, null)}>
                    Set a {label.toLowerCase()} goal
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
