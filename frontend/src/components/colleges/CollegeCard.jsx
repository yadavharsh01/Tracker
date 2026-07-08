import { Pencil, Trash2, Calendar } from "lucide-react";
import Card from "../ui/Card";
import Button from "../ui/Button";

const STATUS_META = {
  targeting: { label: "Targeting", className: "bg-ink-900/8 dark:bg-paper-50/10 text-ink-900/60 dark:text-paper-50/60" },
  shortlisted: { label: "Shortlisted", className: "bg-teal-500/15 text-teal-600 dark:text-teal-400" },
  wat_pi_scheduled: { label: "WAT-PI scheduled", className: "bg-amber-500/15 text-amber-600 dark:text-amber-400" },
  selected: { label: "Selected", className: "bg-teal-500 text-white" },
  waitlisted: { label: "Waitlisted", className: "bg-amber-500/15 text-amber-600 dark:text-amber-400" },
  rejected: { label: "Not selected", className: "bg-danger-500/12 text-danger-500" },
};

function daysUntil(dateStr) {
  const diff = new Date(dateStr).setHours(0, 0, 0, 0) - new Date().setHours(0, 0, 0, 0);
  return Math.round(diff / (1000 * 60 * 60 * 24));
}

export default function CollegeCard({ college, onEdit, onDelete }) {
  const meta = STATUS_META[college.status] || STATUS_META.targeting;
  const watPiDays = college.watPiDate ? daysUntil(college.watPiDate) : null;

  return (
    <Card className="flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h4 className="font-display font-semibold text-base">{college.collegeName}</h4>
          <span className={`inline-block mt-1.5 text-[11px] font-semibold px-2 py-0.5 rounded-md ${meta.className}`}>
            {meta.label}
          </span>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <Button variant="ghost" className="p-2" onClick={() => onEdit(college)} aria-label="Edit college">
            <Pencil size={14} />
          </Button>
          <Button
            variant="ghost"
            className="p-2 text-danger-500"
            onClick={() => onDelete(college)}
            aria-label="Delete college"
          >
            <Trash2 size={14} />
          </Button>
        </div>
      </div>

      {college.cutoffPercentile != null && (
        <p className="tabular text-xs text-ink-900/50 dark:text-paper-50/50">
          Typical cutoff: {college.cutoffPercentile} percentile
        </p>
      )}

      {watPiDays !== null && (
        <div className="flex items-center gap-1.5 text-sm font-medium text-amber-600 dark:text-amber-400">
          <Calendar size={14} />
          {watPiDays > 0
            ? `WAT-PI in ${watPiDays} day${watPiDays === 1 ? "" : "s"}`
            : watPiDays === 0
            ? "WAT-PI is today"
            : "WAT-PI date has passed"}
        </div>
      )}

      {college.notes && (
        <p className="text-sm text-ink-900/70 dark:text-paper-50/70 whitespace-pre-line border-t border-ink-900/8 dark:border-paper-50/8 pt-3">
          {college.notes}
        </p>
      )}
    </Card>
  );
}
