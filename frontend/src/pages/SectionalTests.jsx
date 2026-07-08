import { useCallback, useEffect, useState } from "react";
import { Plus, Trophy } from "lucide-react";
import Sidebar from "../components/layout/Sidebar";
import MobileNav from "../components/layout/MobileNav";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Skeleton from "../components/ui/Skeleton";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import SectionalTestForm from "../components/sectionaltests/SectionalTestForm";
import SectionalTestList from "../components/sectionaltests/SectionalTestList";
import SectionTrendChart from "../components/sectionaltests/SectionTrendChart";
import {
  listSectionalTests,
  createSectionalTest,
  updateSectionalTest,
  deleteSectionalTest,
  getSectionalAnalysis,
} from "../lib/api";
import { useToast } from "../context/ToastContext";

const SECTIONS = ["VARC", "DILR", "QA"];

export default function SectionalTests() {
  const [activeSection, setActiveSection] = useState("VARC");
  const [tests, setTests] = useState([]);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingTest, setEditingTest] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const { notify } = useToast();

  const load = useCallback(
    async (section = activeSection) => {
      setLoading(true);
      try {
        const [listRes, analysisRes] = await Promise.all([
          listSectionalTests(section),
          getSectionalAnalysis(),
        ]);
        setTests(listRes.data);
        setAnalysis(analysisRes.data);
      } catch {
        notify("Couldn't load your sectional tests.", "error");
      } finally {
        setLoading(false);
      }
    },
    [notify, activeSection]
  );

  useEffect(() => {
    load(activeSection);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSection]);

  const handleTabChange = (section) => {
    setActiveSection(section);
    setFormOpen(false);
    setEditingTest(null);
  };

  const openAddForm = () => {
    setEditingTest(null);
    setFormOpen(true);
  };

  const openEditForm = (test) => {
    setEditingTest(test);
    setFormOpen(true);
  };

  const handleSubmit = async (data) => {
    setSubmitting(true);
    try {
      if (editingTest) {
        await updateSectionalTest(editingTest._id, data);
        notify("Sectional test updated.");
      } else {
        await createSectionalTest(data);
        notify("Sectional test added.");
      }
      setFormOpen(false);
      setEditingTest(null);
      load(activeSection);
    } catch (err) {
      notify(err.response?.data?.msg || "Couldn't save that test.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    try {
      await deleteSectionalTest(pendingDelete._id);
      notify("Sectional test deleted.");
      setPendingDelete(null);
      load(activeSection);
    } catch {
      notify("Couldn't delete that test.", "error");
    }
  };

  const sectionAnalysis = analysis?.[activeSection];

  return (
    <div className="min-h-screen flex bg-paper-50 dark:bg-ink-950 text-ink-900 dark:text-paper-50">
      <Sidebar />

      <main className="flex-1 px-5 md:px-10 py-8 pb-24 md:pb-8 max-w-5xl mx-auto w-full">
        <div className="flex items-center justify-between mb-2 flex-wrap gap-3">
          <h1 className="font-display text-2xl font-semibold">Sectional scores</h1>
          {!formOpen && (
            <Button onClick={openAddForm}>
              <Plus size={16} /> Add sectional test
            </Button>
          )}
        </div>
        <p className="text-sm text-ink-900/60 dark:text-paper-50/60 mb-6">
          Track VARC, DILR, and QA practice tests separately from your full mocks.
        </p>

        <div className="flex gap-1 mb-6">
          {SECTIONS.map((s) => (
            <button
              key={s}
              onClick={() => handleTabChange(s)}
              className={`text-sm font-medium px-4 py-2 rounded-xl transition-colors ${
                activeSection === s
                  ? "bg-amber-500 text-ink-950"
                  : "bg-ink-900/6 dark:bg-paper-50/8 text-ink-900/60 dark:text-paper-50/60"
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2">
            <SectionTrendChart section={activeSection} trend={sectionAnalysis?.trend} loading={loading} />
          </div>
          <Card className="flex flex-col justify-center gap-4">
            <div className="flex items-center gap-2">
              <Trophy size={18} className="text-amber-500" />
              <h3 className="font-display font-semibold text-base">{activeSection} summary</h3>
            </div>
            <div>
              <p className="text-xs text-ink-900/50 dark:text-paper-50/50">Best score</p>
              <p className="tabular text-2xl font-semibold">{sectionAnalysis?.best ?? "—"}</p>
            </div>
            <div>
              <p className="text-xs text-ink-900/50 dark:text-paper-50/50">Overall accuracy</p>
              <p className="tabular text-2xl font-semibold">
                {sectionAnalysis?.overallAccuracy != null ? `${sectionAnalysis.overallAccuracy}%` : "—"}
              </p>
            </div>
          </Card>
        </div>

        {formOpen && (
          <Card className="mb-6 animate-fade-up">
            <h3 className="font-display font-semibold text-base mb-4">
              {editingTest ? "Edit sectional test" : `Add a ${activeSection} sectional test`}
            </h3>
            <SectionalTestForm
              initialData={editingTest}
              defaultSection={activeSection}
              submitting={submitting}
              onSubmit={handleSubmit}
              onCancel={() => {
                setFormOpen(false);
                setEditingTest(null);
              }}
            />
          </Card>
        )}

        {loading ? (
          <div className="flex flex-col gap-3">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : (
          <SectionalTestList tests={tests} onEdit={openEditForm} onDelete={setPendingDelete} />
        )}
      </main>

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Delete this sectional test?"
        description={`"${pendingDelete?.testName}" will be permanently removed. This can't be undone.`}
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />

      <MobileNav />
    </div>
  );
}
