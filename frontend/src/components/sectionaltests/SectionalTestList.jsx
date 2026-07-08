import { Pencil, Trash2 } from "lucide-react";
import Card from "../ui/Card";
import Button from "../ui/Button";

function accuracyOf(t) {
  return t.questionsAttempted > 0 ? Math.round((t.correct / t.questionsAttempted) * 1000) / 10 : 0;
}

export default function SectionalTestList({ tests, onEdit, onDelete }) {
  if (tests.length === 0) {
    return (
      <Card className="text-center py-10">
        <p className="text-sm font-medium text-ink-900/70 dark:text-paper-50/70">
          No sectional tests logged yet
        </p>
        <p className="text-xs text-ink-900/45 dark:text-paper-50/45 mt-1">
          Add a single-section practice test to track it separately from your full mocks.
        </p>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {tests.map((t) => (
        <Card key={t._id} className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="tabular text-[11px] font-semibold px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-600 dark:text-amber-400">
                {t.section}
              </span>
              <h4 className="font-display font-semibold text-sm">{t.testName}</h4>
              <span className="text-xs text-ink-900/45 dark:text-paper-50/45">
                {new Date(t.date).toLocaleDateString()}
              </span>
            </div>
            <p className="tabular text-xs text-ink-900/50 dark:text-paper-50/50 mt-2">
              {t.correct}/{t.questionsAttempted} correct · {accuracyOf(t)}% accuracy · {t.timeTaken} min
            </p>
          </div>

          <div className="flex items-center gap-4">
            <p className="tabular text-lg font-semibold">{t.score ?? "—"}</p>
            <div className="flex items-center gap-1">
              <Button variant="ghost" className="p-2" onClick={() => onEdit(t)} aria-label="Edit sectional test">
                <Pencil size={16} />
              </Button>
              <Button
                variant="ghost"
                className="p-2 text-danger-500"
                onClick={() => onDelete(t)}
                aria-label="Delete sectional test"
              >
                <Trash2 size={16} />
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
