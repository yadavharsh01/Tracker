import { useState } from "react";
import { GraduationCap } from "lucide-react";
import Card from "../ui/Card";
import Input from "../ui/Input";
import Button from "../ui/Button";
import { setExamDate, setTargetPercentile } from "../../lib/api";
import { useToast } from "../../context/ToastContext";

const DISMISSED_KEY = "onboarding_dismissed";

export function shouldShowOnboarding(profile) {
  if (!profile) return false;
  if (localStorage.getItem(DISMISSED_KEY)) return false;
  return !profile.examDate && !profile.targetPercentile;
}

export default function OnboardingModal({ onComplete }) {
  const [examDate, setExamDateInput] = useState("");
  const [targetPercentile, setTargetPercentileInput] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { notify } = useToast();

  const dismiss = () => {
    localStorage.setItem(DISMISSED_KEY, "1");
    onComplete({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const updates = {};
    try {
      if (examDate) {
        await setExamDate(examDate);
        updates.examDate = examDate;
      }
      if (targetPercentile) {
        await setTargetPercentile(Number(targetPercentile));
        updates.targetPercentile = Number(targetPercentile);
      }
      localStorage.setItem(DISMISSED_KEY, "1");
      notify("You're all set.");
      onComplete(updates);
    } catch (err) {
      notify(err.response?.data?.msg || "Couldn't save that. You can set it later from the dashboard.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink-950/50 backdrop-blur-sm px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-title"
    >
      <Card className="w-full max-w-sm animate-fade-up">
        <div className="flex flex-col items-center mb-5 text-center">
          <GraduationCap className="text-amber-500 mb-2" size={28} />
          <h2 id="onboarding-title" className="font-display font-semibold text-xl">
            Welcome. Let's set the basics.
          </h2>
          <p className="text-sm text-ink-900/50 dark:text-paper-50/50 mt-1">
            Both optional — you can always change these later from the dashboard.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            id="onboarding-exam-date"
            label="Your CAT exam date"
            type="date"
            value={examDate}
            onChange={(e) => setExamDateInput(e.target.value)}
          />
          <Input
            id="onboarding-target"
            label="Target percentile"
            type="number"
            min="0"
            max="100"
            placeholder="e.g. 95"
            value={targetPercentile}
            onChange={(e) => setTargetPercentileInput(e.target.value)}
          />

          <div className="flex items-center gap-2 mt-1">
            <Button type="submit" loading={submitting}>
              Save and continue
            </Button>
            <Button type="button" variant="ghost" onClick={dismiss}>
              Skip for now
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
