import { useCallback, useEffect, useState } from "react";
import Sidebar from "../components/layout/Sidebar";
import MobileNav from "../components/layout/MobileNav";
import Card from "../components/ui/Card";
import Skeleton from "../components/ui/Skeleton";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import TopicSection from "../components/planner/TopicSection";
import AddTopicForm from "../components/planner/AddTopicForm";
import RevisionDue from "../components/planner/RevisionDue";
import {
  listTopics,
  seedTopics,
  addTopic,
  updateTopicMastery,
  deleteTopic,
  getTopicsDue,
  markTopicRevised,
} from "../lib/api";
import { useToast } from "../context/ToastContext";

const SECTION_ORDER = ["QA", "VARC", "DILR"];

export default function Planner() {
  const [topics, setTopics] = useState([]);
  const [dueTopics, setDueTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingDue, setLoadingDue] = useState(true);
  const [adding, setAdding] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(null);
  const { notify } = useToast();

  const loadDue = useCallback(async () => {
    setLoadingDue(true);
    try {
      const res = await getTopicsDue();
      setDueTopics(res.data);
    } catch {
      notify("Couldn't load revision reminders.", "error");
    } finally {
      setLoadingDue(false);
    }
  }, [notify]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await listTopics();
      if (res.data.length === 0) {
        // First visit — seed a sensible default topic list so the page
        // isn't a blank void the user has to populate from scratch.
        const seeded = await seedTopics();
        setTopics(seeded.data);
      } else {
        setTopics(res.data);
      }
    } catch {
      notify("Couldn't load your topics.", "error");
    } finally {
      setLoading(false);
    }
  }, [notify]);

  useEffect(() => {
    load();
    loadDue();
  }, [load, loadDue]);

  const handleAdd = async (section, name) => {
    setAdding(true);
    try {
      const res = await addTopic(section, name);
      setTopics((prev) => [...prev, res.data]);
      notify("Topic added.");
    } catch (err) {
      notify(err.response?.data?.msg || "Couldn't add that topic.", "error");
    } finally {
      setAdding(false);
    }
  };

  const handleMasteryChange = async (id, mastery) => {
    // Optimistic update — mastery cycling should feel instant.
    setTopics((prev) => prev.map((t) => (t._id === id ? { ...t, mastery } : t)));
    try {
      await updateTopicMastery(id, mastery);
      loadDue();
    } catch {
      notify("Couldn't save that change. Reloading.", "error");
      load();
    }
  };

  const handleRevise = async (id) => {
    try {
      await markTopicRevised(id);
      setDueTopics((prev) => prev.filter((t) => t._id !== id));
      notify("Marked as revised.");
    } catch {
      notify("Couldn't mark that as revised.", "error");
    }
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    try {
      await deleteTopic(pendingDelete._id);
      setTopics((prev) => prev.filter((t) => t._id !== pendingDelete._id));
      notify("Topic removed.");
    } catch {
      notify("Couldn't remove that topic.", "error");
    } finally {
      setPendingDelete(null);
    }
  };

  const grouped = SECTION_ORDER.map((section) => ({
    section,
    items: topics.filter((t) => t.section === section),
  })).filter((g) => g.items.length > 0);

  return (
    <div className="min-h-screen flex bg-paper-50 dark:bg-ink-950 text-ink-900 dark:text-paper-50">
      <Sidebar />

      <main className="flex-1 px-5 md:px-10 py-8 pb-24 md:pb-8 max-w-5xl mx-auto w-full">
        <h1 className="font-display text-2xl font-semibold mb-2">Topic tracker</h1>
        <p className="text-sm text-ink-900/60 dark:text-paper-50/60 mb-6">
          Tap a topic's status to cycle through not started → learning → mastered.
        </p>

        <Card className="mb-6">
          <AddTopicForm onAdd={handleAdd} submitting={adding} />
        </Card>

        <div className="mb-6">
          <RevisionDue topics={dueTopics} loading={loadingDue} onRevise={handleRevise} />
        </div>

        {loading ? (
          <div className="flex flex-col gap-4">
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {grouped.map(({ section, items }) => (
              <TopicSection
                key={section}
                section={section}
                topics={items}
                onMasteryChange={handleMasteryChange}
                onDelete={setPendingDelete}
              />
            ))}
          </div>
        )}
      </main>

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Remove this topic?"
        description={`"${pendingDelete?.name}" will be removed from your tracker.`}
        confirmLabel="Remove"
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />

      <MobileNav />
    </div>
  );
}
