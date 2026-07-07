import { useState } from "react";
import { Plus } from "lucide-react";
import Input from "../ui/Input";
import Button from "../ui/Button";

const SECTIONS = ["QA", "VARC", "DILR"];

export default function AddTopicForm({ onAdd, submitting }) {
  const [section, setSection] = useState("QA");
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Give the topic a name");
      return;
    }
    setError("");
    onAdd(section, name.trim());
    setName("");
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-start sm:items-end gap-3">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="topic-section" className="text-sm font-medium text-ink-900/80 dark:text-paper-50/80">
          Section
        </label>
        <select
          id="topic-section"
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
      <div className="flex-1 w-full">
        <Input
          id="topic-name"
          label="Topic name"
          placeholder="e.g. Time, Speed & Distance"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={error}
        />
      </div>
      <Button type="submit" loading={submitting}>
        <Plus size={16} /> Add topic
      </Button>
    </form>
  );
}
