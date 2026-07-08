import { useState } from "react";
import Input from "../ui/Input";
import Button from "../ui/Button";

const STATUSES = [
  { value: "targeting", label: "Targeting" },
  { value: "shortlisted", label: "Shortlisted" },
  { value: "wat_pi_scheduled", label: "WAT-PI scheduled" },
  { value: "selected", label: "Selected" },
  { value: "waitlisted", label: "Waitlisted" },
  { value: "rejected", label: "Not selected" },
];

export default function CollegeForm({ initialData, onSubmit, onCancel, submitting }) {
  const [collegeName, setCollegeName] = useState(initialData?.collegeName || "");
  const [status, setStatus] = useState(initialData?.status || "targeting");
  const [cutoffPercentile, setCutoffPercentile] = useState(initialData?.cutoffPercentile ?? "");
  const [watPiDate, setWatPiDate] = useState(
    initialData?.watPiDate ? new Date(initialData.watPiDate).toISOString().slice(0, 10) : ""
  );
  const [notes, setNotes] = useState(initialData?.notes || "");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!collegeName.trim()) {
      setError("Enter a college name");
      return;
    }
    setError("");
    onSubmit({
      collegeName: collegeName.trim(),
      status,
      cutoffPercentile: cutoffPercentile === "" ? null : Number(cutoffPercentile),
      watPiDate: watPiDate || null,
      notes: notes.trim(),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input
        id="college-name"
        label="College name"
        placeholder="e.g. IIM Bangalore"
        value={collegeName}
        onChange={(e) => setCollegeName(e.target.value)}
        error={error}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="college-status" className="text-sm font-medium text-ink-900/80 dark:text-paper-50/80">
            Status
          </label>
          <select
            id="college-status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="rounded-xl border border-ink-900/10 dark:border-paper-50/10 bg-paper-100 dark:bg-ink-900 px-3.5 py-2.5 text-sm"
          >
            {STATUSES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
        <Input
          id="college-cutoff"
          label="Typical cutoff percentile"
          type="number"
          min="0"
          max="100"
          placeholder="e.g. 99"
          value={cutoffPercentile}
          onChange={(e) => setCutoffPercentile(e.target.value)}
        />
      </div>

      <Input
        id="college-watpi-date"
        label="WAT-PI date (if scheduled)"
        type="date"
        value={watPiDate}
        onChange={(e) => setWatPiDate(e.target.value)}
      />

      <div className="flex flex-col gap-1.5">
        <label htmlFor="college-notes" className="text-sm font-medium text-ink-900/80 dark:text-paper-50/80">
          Notes
        </label>
        <textarea
          id="college-notes"
          rows={3}
          placeholder="Prep notes, GD topics to review, interview experiences you've read..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="rounded-xl border border-ink-900/10 dark:border-paper-50/10 bg-paper-100 dark:bg-ink-900 px-3.5 py-2.5 text-sm resize-none"
        />
      </div>

      <div className="flex items-center gap-2">
        <Button type="submit" loading={submitting}>
          {initialData ? "Save changes" : "Add college"}
        </Button>
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
