import { useState } from "react";
import Input from "../ui/Input";
import Button from "../ui/Button";

const SECTIONS = ["VARC", "DILR", "QA"];

export default function SectionalTestForm({ initialData, defaultSection, onSubmit, onCancel, submitting }) {
  const [section, setSection] = useState(initialData?.section || defaultSection || "VARC");
  const [testName, setTestName] = useState(initialData?.testName || "");
  const [date, setDate] = useState(
    initialData?.date ? new Date(initialData.date).toISOString().slice(0, 10) : ""
  );
  const [questionsAttempted, setQuestionsAttempted] = useState(initialData?.questionsAttempted ?? "");
  const [correct, setCorrect] = useState(initialData?.correct ?? "");
  const [timeTaken, setTimeTaken] = useState(initialData?.timeTaken ?? "");
  const [score, setScore] = useState(initialData?.score ?? "");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!testName.trim()) {
      setError("Give this test a name");
      return;
    }
    const attempted = Number(questionsAttempted) || 0;
    const correctNum = Number(correct) || 0;
    if (correctNum > attempted) {
      setError("Correct answers can't exceed questions attempted");
      return;
    }

    setError("");
    onSubmit({
      section,
      testName: testName.trim(),
      date: date || undefined,
      questionsAttempted: attempted,
      correct: correctNum,
      timeTaken: Number(timeTaken) || 0,
      score: Number(score) || 0,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="sec-section" className="text-sm font-medium text-ink-900/80 dark:text-paper-50/80">
          Section
        </label>
        <select
          id="sec-section"
          value={section}
          onChange={(e) => setSection(e.target.value)}
          className="rounded-xl border border-ink-900/10 dark:border-paper-50/10 bg-paper-100 dark:bg-ink-900 px-3.5 py-2.5 text-sm"
        >
          {SECTIONS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          id="sec-name"
          label="Test name"
          placeholder="e.g. VARC Sectional 12"
          value={testName}
          onChange={(e) => setTestName(e.target.value)}
        />
        <Input id="sec-date" label="Date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Input
          id="sec-attempted"
          label="Attempted"
          type="number"
          min="0"
          value={questionsAttempted}
          onChange={(e) => setQuestionsAttempted(e.target.value)}
        />
        <Input
          id="sec-correct"
          label="Correct"
          type="number"
          min="0"
          value={correct}
          onChange={(e) => setCorrect(e.target.value)}
        />
        <Input
          id="sec-time"
          label="Time (min)"
          type="number"
          min="0"
          value={timeTaken}
          onChange={(e) => setTimeTaken(e.target.value)}
        />
        <Input id="sec-score" label="Score" type="number" value={score} onChange={(e) => setScore(e.target.value)} />
      </div>

      {error && <p className="text-sm font-medium text-danger-500">{error}</p>}

      <div className="flex items-center gap-2">
        <Button type="submit" loading={submitting}>
          {initialData ? "Save changes" : "Add sectional test"}
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
