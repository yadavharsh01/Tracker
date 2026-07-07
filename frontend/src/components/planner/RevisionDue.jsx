import { RotateCw, CheckCircle2 } from "lucide-react";
import Card from "../ui/Card";
import Button from "../ui/Button";
import Skeleton from "../ui/Skeleton";

function daysAgo(dateStr) {
  if (!dateStr) return null;
  const diff = Date.now() - new Date(dateStr).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

export default function RevisionDue({ topics, loading, onRevise }) {
  return (
    <Card>
      <div className="flex items-center gap-2 mb-4">
        <RotateCw size={18} className="text-amber-500" />
        <h3 className="font-display font-semibold text-base">Due for revision</h3>
      </div>

      {loading ? (
        <div className="flex flex-col gap-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      ) : topics.length === 0 ? (
        <div className="flex flex-col items-center text-center gap-2 py-6">
          <CheckCircle2 className="text-teal-500" size={24} />
          <p className="text-sm font-medium text-ink-900/70 dark:text-paper-50/70">
            Nothing due — you're all caught up.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {topics.map((topic) => {
            const age = daysAgo(topic.lastRevisedAt);
            return (
              <div
                key={topic._id}
                className="flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 bg-amber-500/6"
              >
                <div>
                  <p className="text-sm font-medium">{topic.name}</p>
                  <p className="text-xs text-ink-900/50 dark:text-paper-50/50">
                    {topic.section} · {age === null ? "Never revised" : `${age} days ago`}
                  </p>
                </div>
                <Button variant="secondary" className="px-3 py-2 text-xs" onClick={() => onRevise(topic._id)}>
                  Mark revised
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
