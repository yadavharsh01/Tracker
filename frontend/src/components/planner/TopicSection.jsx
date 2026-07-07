import { Trash2 } from "lucide-react";
import Card from "../ui/Card";
import MasteryChip from "./MasteryChip";
import Button from "../ui/Button";

export default function TopicSection({ section, topics, onMasteryChange, onDelete }) {
  const masteredCount = topics.filter((t) => t.mastery === "mastered").length;

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display font-semibold text-base">{section}</h3>
        <span className="tabular text-xs text-ink-900/50 dark:text-paper-50/50">
          {masteredCount}/{topics.length} mastered
        </span>
      </div>

      <div className="flex flex-col gap-2">
        {topics.map((topic) => (
          <div
            key={topic._id}
            className="flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 hover:bg-ink-900/3 dark:hover:bg-paper-50/5"
          >
            <p className="text-sm flex-1">{topic.name}</p>
            <div className="flex items-center gap-1.5">
              <MasteryChip
                value={topic.mastery}
                onChange={(mastery) => onMasteryChange(topic._id, mastery)}
              />
              <Button
                variant="ghost"
                className="p-2 text-danger-500"
                onClick={() => onDelete(topic)}
                aria-label={`Delete ${topic.name}`}
              >
                <Trash2 size={14} />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
