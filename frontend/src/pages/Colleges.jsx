import { useCallback, useEffect, useState } from "react";
import { Plus } from "lucide-react";
import Sidebar from "../components/layout/Sidebar";
import MobileNav from "../components/layout/MobileNav";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Skeleton from "../components/ui/Skeleton";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import CollegeForm from "../components/colleges/CollegeForm";
import CollegeCard from "../components/colleges/CollegeCard";
import { listColleges, addCollege, updateCollege, deleteCollege } from "../lib/api";
import { useToast } from "../context/ToastContext";

export default function Colleges() {
  const [colleges, setColleges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const { notify } = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await listColleges();
      setColleges(res.data);
    } catch {
      notify("Couldn't load your college targets.", "error");
    } finally {
      setLoading(false);
    }
  }, [notify]);

  useEffect(() => {
    load();
  }, [load]);

  const openAdd = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (college) => {
    setEditing(college);
    setFormOpen(true);
  };

  const handleSubmit = async (data) => {
    setSubmitting(true);
    try {
      if (editing) {
        await updateCollege(editing._id, data);
        notify("College updated.");
      } else {
        await addCollege(data);
        notify("College added.");
      }
      setFormOpen(false);
      setEditing(null);
      load();
    } catch (err) {
      notify(err.response?.data?.msg || "Couldn't save that college.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    try {
      await deleteCollege(pendingDelete._id);
      notify("College removed.");
      setPendingDelete(null);
      load();
    } catch {
      notify("Couldn't remove that college.", "error");
    }
  };

  return (
    <div className="min-h-screen flex bg-paper-50 dark:bg-ink-950 text-ink-900 dark:text-paper-50">
      <Sidebar />

      <main className="flex-1 px-5 md:px-10 py-8 pb-24 md:pb-8 max-w-5xl mx-auto w-full">
        <div className="flex items-center justify-between mb-2 flex-wrap gap-3">
          <h1 className="font-display text-2xl font-semibold">Colleges</h1>
          {!formOpen && (
            <Button onClick={openAdd}>
              <Plus size={16} /> Add college
            </Button>
          )}
        </div>
        <p className="text-sm text-ink-900/60 dark:text-paper-50/60 mb-6">
          The exam is step one — track your shortlist and WAT-PI rounds here.
        </p>

        {formOpen && (
          <Card className="mb-6 animate-fade-up">
            <h3 className="font-display font-semibold text-base mb-4">
              {editing ? "Edit college" : "Add a college"}
            </h3>
            <CollegeForm
              initialData={editing}
              submitting={submitting}
              onSubmit={handleSubmit}
              onCancel={() => {
                setFormOpen(false);
                setEditing(null);
              }}
            />
          </Card>
        )}

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
        ) : colleges.length === 0 ? (
          <Card className="text-center py-10">
            <p className="text-sm font-medium text-ink-900/70 dark:text-paper-50/70">
              No colleges added yet
            </p>
            <p className="text-xs text-ink-900/45 dark:text-paper-50/45 mt-1">
              Add your target B-schools to track shortlists and WAT-PI dates.
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {colleges.map((c) => (
              <CollegeCard key={c._id} college={c} onEdit={openEdit} onDelete={setPendingDelete} />
            ))}
          </div>
        )}
      </main>

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Remove this college?"
        description={`"${pendingDelete?.collegeName}" will be removed from your tracker.`}
        confirmLabel="Remove"
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />

      <MobileNav />
    </div>
  );
}
