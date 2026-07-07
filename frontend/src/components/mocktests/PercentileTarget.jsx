import { useState } from "react";
import { Target } from "lucide-react";
import Card from "../ui/Card";
import Input from "../ui/Input";
import Button from "../ui/Button";
import { setTargetPercentile as saveTargetPercentile } from "../../lib/api";
import { useToast } from "../../context/ToastContext";

export default function PercentileTarget({ targetPercentile, latestPercentile, onSaved }) {
  const [input, setInput] = useState("");
  const [saving, setSaving] = useState(false);
  const { notify } = useToast();

  const handleSave = async (e) => {
    e.preventDefault();
    const value = Number(input);
    if (!input || Number.isNaN(value) || value < 0 || value > 100) {
      notify("Enter a percentile between 0 and 100", "error");
      return;
    }
    setSaving(true);
    try {
      await saveTargetPercentile(value);
      notify("Target saved.");
      onSaved?.(value);
    } catch (err) {
      notify(err.response?.data?.msg || "Couldn't save that target.", "error");
    } finally {
      setSaving(false);
    }
  };

  if (targetPercentile === null || targetPercentile === undefined) {
    return (
      <Card className="flex flex-col gap-3">
        <h3 className="font-display font-semibold text-base">Set a target percentile</h3>
        <p className="text-sm text-ink-900/60 dark:text-paper-50/60">
          Pick the percentile you're aiming for, and track how your mocks compare.
        </p>
        <form onSubmit={handleSave} className="flex items-end gap-2">
          <div className="flex-1">
            <Input
              id="target-percentile"
              type="number"
              min="0"
              max="100"
              placeholder="e.g. 95"
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
          </div>
          <Button type="submit" loading={saving}>
            Save
          </Button>
        </form>
      </Card>
    );
  }

  const gap = latestPercentile != null ? Number((targetPercentile - latestPercentile).toFixed(1)) : null;

  return (
    <Card>
      <div className="flex items-center gap-2 mb-3">
        <Target size={18} className="text-amber-500" />
        <h3 className="font-display font-semibold text-base">Percentile target</h3>
      </div>

      <div className="flex items-end justify-between">
        <div>
          <p className="text-xs text-ink-900/50 dark:text-paper-50/50">Target</p>
          <p className="tabular text-2xl font-semibold">{targetPercentile}</p>
        </div>
        {latestPercentile != null && (
          <div className="text-right">
            <p className="text-xs text-ink-900/50 dark:text-paper-50/50">Latest mock</p>
            <p className="tabular text-2xl font-semibold">{latestPercentile}</p>
          </div>
        )}
      </div>

      {gap !== null && (
        <p
          className={`text-sm font-medium mt-3 ${
            gap <= 0 ? "text-teal-600 dark:text-teal-400" : "text-ink-900/70 dark:text-paper-50/70"
          }`}
        >
          {gap <= 0
            ? `You're at or above target. Keep it up.`
            : `${gap} percentile points to go.`}
        </p>
      )}

      {latestPercentile == null && (
        <p className="text-sm text-ink-900/50 dark:text-paper-50/50 mt-3">
          Log a mock test to see how you compare.
        </p>
      )}
    </Card>
  );
}
