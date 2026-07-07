import { Pencil, Trash2 } from "lucide-react";
import Card from "../ui/Card";
import Button from "../ui/Button";

const SECTIONS = ["VARC", "DILR", "QA"];

function SectionBadge({ label, accuracy }) {
  return (
    <span className="tabular inline-flex items-center gap-1.5 rounded-lg bg-ink-900/5 dark:bg-paper-50/8 px-2.5 py-1 text-xs font-medium">
      {label}
      <span className="text-ink-900/50 dark:text-paper-50/50">{accuracy}%</span>
    </span>
  );
}

export default function MockTestList({ mockTests, onEdit, onDelete }) {
  if (mockTests.length === 0) {
    return (
      <Card className="text-center py-10">
        <p className="text-sm font-medium text-ink-900/70 dark:text-paper-50/70">
          No mock tests logged yet
        </p>
        <p className="text-xs text-ink-900/45 dark:text-paper-50/45 mt-1">
          Add your first SimCAT or mock score to start tracking sectional accuracy.
        </p>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {mockTests.map((mt) => (
        <Card key={mt._id} className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="font-display font-semibold text-sm">{mt.name}</h4>
              <span className="text-xs text-ink-900/45 dark:text-paper-50/45">
                {new Date(mt.date).toLocaleDateString()}
              </span>
            </div>
            <div className="flex items-center gap-2 flex-wrap mt-2">
              {SECTIONS.map((key) => (
                <SectionBadge key={key} label={key} accuracy={mt.sections?.[key]?.accuracy ?? 0} />
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="tabular text-lg font-semibold">{mt.totalScore ?? "—"}</p>
              {mt.percentile !== undefined && mt.percentile !== null && (
                <p className="tabular text-xs text-ink-900/50 dark:text-paper-50/50">
                  {mt.percentile}%ile
                </p>
              )}
            </div>
            <div className="flex items-center gap-1">
              <Button variant="ghost" className="p-2" onClick={() => onEdit(mt)} aria-label="Edit mock test">
                <Pencil size={16} />
              </Button>
              <Button variant="ghost" className="p-2 text-danger-500" onClick={() => onDelete(mt)} aria-label="Delete mock test">
                <Trash2 size={16} />
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
