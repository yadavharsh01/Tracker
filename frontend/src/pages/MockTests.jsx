import { useCallback, useEffect, useState } from "react";
import { Plus, TrendingDown, TrendingUp } from "lucide-react";
import Sidebar from "../components/layout/Sidebar";
import MobileNav from "../components/layout/MobileNav";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Skeleton from "../components/ui/Skeleton";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import MockTestForm from "../components/mocktests/MockTestForm";
import MockTestList from "../components/mocktests/MockTestList";
import ScoreTrendChart from "../components/mocktests/ScoreTrendChart";
import PercentileTarget from "../components/mocktests/PercentileTarget";
import {
  listMockTests,
  createMockTest,
  updateMockTest,
  deleteMockTest,
  getMockTestAnalysis,
  getProfile,
} from "../lib/api";
import { useToast } from "../context/ToastContext";

export default function MockTests() {
  const [mockTests, setMockTests] = useState([]);
  const [analysis, setAnalysis] = useState(null);
  const [targetPercentile, setTargetPercentile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingTest, setEditingTest] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const { notify } = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [listRes, analysisRes, profileRes] = await Promise.all([
        listMockTests(),
        getMockTestAnalysis(),
        getProfile(),
      ]);
      setMockTests(listRes.data);
      setAnalysis(analysisRes.data);
      setTargetPercentile(profileRes.data.targetPercentile);
    } catch {
      notify("Couldn't load your mock tests.", "error");
    } finally {
      setLoading(false);
    }
  }, [notify]);

  useEffect(() => {
    load();
  }, [load]);

  const openAddForm = () => {
    setEditingTest(null);
    setFormOpen(true);
  };

  const openEditForm = (mockTest) => {
    setEditingTest(mockTest);
    setFormOpen(true);
  };

  const handleSubmit = async (data) => {
    setSubmitting(true);
    try {
      if (editingTest) {
        await updateMockTest(editingTest._id, data);
        notify("Mock test updated.");
      } else {
        await createMockTest(data);
        notify("Mock test added.");
      }
      setFormOpen(false);
      setEditingTest(null);
      load();
    } catch (err) {
      notify(err.response?.data?.msg || "Couldn't save that mock test.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    try {
      await deleteMockTest(pendingDelete._id);
      notify("Mock test deleted.");
      setPendingDelete(null);
      load();
    } catch {
      notify("Couldn't delete that mock test.", "error");
    }
  };

  return (
    <div className="min-h-screen flex bg-paper-50 dark:bg-ink-950 text-ink-900 dark:text-paper-50">
      <Sidebar />

      <main className="flex-1 px-5 md:px-10 py-8 pb-24 md:pb-8 max-w-5xl mx-auto w-full">
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-display text-2xl font-semibold">Mock tests</h1>
          {!formOpen && (
            <Button onClick={openAddForm}>
              <Plus size={16} /> Add mock test
            </Button>
          )}
        </div>

        {analysis && (analysis.weakestSection || analysis.strongestSection) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            {analysis.weakestSection && (
              <Card className="flex items-center gap-3">
                <TrendingDown className="text-danger-500" size={20} />
                <div>
                  <p className="text-xs text-ink-900/50 dark:text-paper-50/50">Weakest section</p>
                  <p className="font-semibold">
                    {analysis.weakestSection.section}{" "}
                    <span className="tabular text-ink-900/50 dark:text-paper-50/50 text-sm">
                      {analysis.weakestSection.accuracy}% accuracy
                    </span>
                  </p>
                </div>
              </Card>
            )}
            {analysis.strongestSection && (
              <Card className="flex items-center gap-3">
                <TrendingUp className="text-teal-500" size={20} />
                <div>
                  <p className="text-xs text-ink-900/50 dark:text-paper-50/50">Strongest section</p>
                  <p className="font-semibold">
                    {analysis.strongestSection.section}{" "}
                    <span className="tabular text-ink-900/50 dark:text-paper-50/50 text-sm">
                      {analysis.strongestSection.accuracy}% accuracy
                    </span>
                  </p>
                </div>
              </Card>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2">
            <ScoreTrendChart trend={analysis?.trend} loading={loading} />
          </div>
          <PercentileTarget
            targetPercentile={targetPercentile}
            latestPercentile={analysis?.trend?.at(-1)?.percentile}
            onSaved={setTargetPercentile}
          />
        </div>

        {formOpen && (
          <Card className="mb-6 animate-fade-up">
            <h3 className="font-display font-semibold text-base mb-4">
              {editingTest ? "Edit mock test" : "Add a mock test"}
            </h3>
            <MockTestForm
              initialData={editingTest}
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
          <MockTestList mockTests={mockTests} onEdit={openEditForm} onDelete={setPendingDelete} />
        )}
      </main>

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Delete this mock test?"
        description={`"${pendingDelete?.name}" will be permanently removed. This can't be undone.`}
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />

      <MobileNav />
    </div>
  );
}
