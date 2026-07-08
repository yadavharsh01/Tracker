import { useState } from "react";
import Input from "../ui/Input";
import Button from "../ui/Button";

const SECTIONS = ["VARC", "DILR", "QA"];

const emptySection = () => ({ questionsAttempted: "", correct: "", timeTaken: "", score: "" });

function toSectionState(section) {
  if (!section) return emptySection();
  return {
    questionsAttempted: section.questionsAttempted ?? "",
    correct: section.correct ?? "",
    timeTaken: section.timeTaken ?? "",
    score: section.score ?? "",
  };
}

export default function MockTestForm({ initialData, onSubmit, onCancel, submitting }) {
  const [name, setName] = useState(initialData?.name || "");
  const [date, setDate] = useState(
    initialData?.date ? new Date(initialData.date).toISOString().slice(0, 10) : ""
  );
  const [percentile, setPercentile] = useState(initialData?.percentile ?? "");
  const [totalScore, setTotalScore] = useState(initialData?.totalScore ?? "");
  const [notes, setNotes] = useState(initialData?.notes || "");
  const [sections, setSections] = useState({
    VARC: toSectionState(initialData?.sections?.VARC),
    DILR: toSectionState(initialData?.sections?.DILR),
    QA: toSectionState(initialData?.sections?.QA),
  });
  const [error, setError] = useState("");

  const updateSection = (key, field, value) => {
    setSections((prev) => ({ ...prev, [key]: { ...prev[key], [field]: value } }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Give this mock test a name");
      return;
    }

    for (const key of SECTIONS) {
      const s = sections[key];
      const attempted = Number(s.questionsAttempted) || 0;
      const correct = Number(s.correct) || 0;
      if (correct > attempted) {
        setError(`${key}: correct answers can't exceed questions attempted`);
        return;
      }
    }

    setError("");
    onSubmit({
      name: name.trim(),
      date: date || undefined,
      percentile: percentile === "" ? undefined : Number(percentile),
      totalScore: totalScore === "" ? undefined : Number(totalScore),
      notes: notes.trim(),
      sections: Object.fromEntries(
        SECTIONS.map((key) => [
          key,
          {
            questionsAttempted: Number(sections[key].questionsAttempted) || 0,
            correct: Number(sections[key].correct) || 0,
            timeTaken: Number(sections[key].timeTaken) || 0,
            score: Number(sections[key].score) || 0,
          },
        ])
      ),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input id="mt-name" label="Mock test name" placeholder="e.g. SimCAT 5" value={name} onChange={(e) => setName(e.target.value)} />
        <Input id="mt-date" label="Date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        <Input id="mt-percentile" label="Overall percentile" type="number" step="0.01" min="0" max="100" value={percentile} onChange={(e) => setPercentile(e.target.value)} />
        <Input id="mt-score" label="Total score" type="number" value={totalScore} onChange={(e) => setTotalScore(e.target.value)} />
      </div>

      <div className="flex flex-col gap-4">
        {SECTIONS.map((key) => (
          <div key={key} className="rounded-xl border border-ink-900/8 dark:border-paper-50/8 p-4">
            <p className="text-sm font-semibold mb-3">{key}</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Input
                id={`${key}-attempted`}
                label="Attempted"
                type="number"
                min="0"
                value={sections[key].questionsAttempted}
                onChange={(e) => updateSection(key, "questionsAttempted", e.target.value)}
              />
              <Input
                id={`${key}-correct`}
                label="Correct"
                type="number"
                min="0"
                value={sections[key].correct}
                onChange={(e) => updateSection(key, "correct", e.target.value)}
              />
              <Input
                id={`${key}-time`}
                label="Time (min)"
                type="number"
                min="0"
                value={sections[key].timeTaken}
                onChange={(e) => updateSection(key, "timeTaken", e.target.value)}
              />
              <Input
                id={`${key}-score`}
                label="Score"
                type="number"
                value={sections[key].score}
                onChange={(e) => updateSection(key, "score", e.target.value)}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="mt-notes" className="text-sm font-medium text-ink-900/80 dark:text-paper-50/80">
          Notes — what went wrong, what to review
        </label>
        <textarea
          id="mt-notes"
          rows={3}
          placeholder="e.g. Ran out of time on DILR set 3, rushed the last 5 VARC questions..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="rounded-xl border border-ink-900/10 dark:border-paper-50/10 bg-paper-100 dark:bg-ink-900 px-3.5 py-2.5 text-sm resize-none"
        />
      </div>

      {error && <p className="text-sm font-medium text-danger-500">{error}</p>}

      <div className="flex items-center gap-2">
        <Button type="submit" loading={submitting}>
          {initialData ? "Save changes" : "Add mock test"}
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
