import { useState } from "react";
import { CalendarClock } from "lucide-react";
import AdmitCardStat from "../ui/AdmitCardStat";
import Card from "../ui/Card";
import Input from "../ui/Input";
import Button from "../ui/Button";
import { setExamDate as saveExamDate } from "../../lib/api";
import { useToast } from "../../context/ToastContext";

function daysUntil(dateStr) {
  const target = new Date(dateStr);
  target.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((target - today) / (1000 * 60 * 60 * 24));
}

export default function ExamCountdown({ examDate, onExamDateSet }) {
  const [dateInput, setDateInput] = useState("");
  const [saving, setSaving] = useState(false);
  const { notify } = useToast();

  const handleSave = async (e) => {
    e.preventDefault();
    if (!dateInput) return;
    setSaving(true);
    try {
      await saveExamDate(dateInput);
      notify("Exam date set. The countdown is live.");
      onExamDateSet?.(dateInput);
    } catch (err) {
      notify(err.response?.data?.msg || "Couldn't save that date.", "error");
    } finally {
      setSaving(false);
    }
  };

  if (!examDate) {
    return (
      <Card className="flex flex-col gap-3">
        <h3 className="font-display font-semibold text-base">When's your CAT?</h3>
        <p className="text-sm text-ink-900/60 dark:text-paper-50/60">
          Set your exam date to start the countdown.
        </p>
        <form onSubmit={handleSave} className="flex items-end gap-2">
          <div className="flex-1">
            <Input
              id="exam-date"
              type="date"
              value={dateInput}
              onChange={(e) => setDateInput(e.target.value)}
            />
          </div>
          <Button type="submit" loading={saving}>
            Save
          </Button>
        </form>
      </Card>
    );
  }

  const days = daysUntil(examDate);

  return (
    <AdmitCardStat
      label={days >= 0 ? "Days to CAT" : "Exam day has passed"}
      value={Math.max(days, 0)}
      unit={days >= 0 ? "days" : ""}
      icon={CalendarClock}
    />
  );
}
