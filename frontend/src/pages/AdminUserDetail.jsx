import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Flame, Trophy, Clock, LogIn } from "lucide-react";
import Sidebar from "../components/layout/Sidebar";
import MobileNav from "../components/layout/MobileNav";
import Card from "../components/ui/Card";
import Skeleton from "../components/ui/Skeleton";
import AdmitCardStat from "../components/ui/AdmitCardStat";
import StudyChart from "../components/dashboard/StudyChart";
import { adminGetUser } from "../lib/api";
import { useToast } from "../context/ToastContext";

export default function AdminUserDetail() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { notify } = useToast();

  useEffect(() => {
    setLoading(true);
    adminGetUser(id)
      .then((res) => setData(res.data))
      .catch(() => notify("Couldn't load this user.", "error"))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const chartData = data
    ? Object.entries(data.dailyMinutes)
        .map(([date, minutes]) => ({ date, minutes }))
        .slice(-14)
    : [];

  return (
    <div className="min-h-screen flex bg-paper-50 dark:bg-ink-950 text-ink-900 dark:text-paper-50">
      <Sidebar />

      <main className="flex-1 px-5 md:px-10 py-8 pb-24 md:pb-8 max-w-5xl mx-auto w-full">
        <Link
          to="/admin/users"
          className="inline-flex items-center gap-1.5 text-sm text-ink-900/50 dark:text-paper-50/50 hover:text-amber-500 mb-4"
        >
          <ArrowLeft size={14} /> All users
        </Link>

        {loading ? (
          <Skeleton className="h-10 w-64 mb-6" />
        ) : (
          <div className="mb-6">
            <h1 className="font-display text-2xl font-semibold">{data?.profile.name}</h1>
            <p className="text-sm text-ink-900/50 dark:text-paper-50/50">{data?.profile.email}</p>
          </div>
        )}

        <div className="flex flex-wrap gap-4 mb-6">
          {loading ? (
            <>
              <Skeleton className="h-24 w-56" />
              <Skeleton className="h-24 w-56" />
            </>
          ) : (
            <>
              <AdmitCardStat label="Study streak" value={data.profile.streak} unit="days" icon={Flame} />
              <AdmitCardStat label="Level" value={data.profile.level} icon={Trophy} accent="teal" />
            </>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[
            { label: "Total hours", value: data?.profile.totalHours?.toFixed(1) },
            { label: "Mock tests", value: data?.mockTestCount },
            { label: "Sectional tests", value: data?.sectionalCount },
            { label: "Topics mastered", value: data ? `${data.masteredTopics}/${data.topicCount}` : null },
          ].map((stat) => (
            <Card key={stat.label}>
              <p className="text-xs text-ink-900/50 dark:text-paper-50/50">{stat.label}</p>
              {loading ? (
                <Skeleton className="h-6 w-12 mt-1" />
              ) : (
                <p className="tabular font-semibold text-lg mt-1">{stat.value ?? "—"}</p>
              )}
            </Card>
          ))}
        </div>

        <div className="mb-6">
          <StudyChart data={chartData} loading={loading} />
        </div>

        <Card>
          <div className="flex items-center gap-2 mb-4">
            <LogIn size={18} className="text-amber-500" />
            <h3 className="font-display font-semibold text-base">Recent logins</h3>
          </div>
          {loading ? (
            <Skeleton className="h-32 w-full" />
          ) : data.recentLogins.length === 0 ? (
            <p className="text-sm text-ink-900/50 dark:text-paper-50/50">No login history recorded.</p>
          ) : (
            <div className="flex flex-col gap-1 max-h-72 overflow-y-auto">
              {data.recentLogins.map((login) => (
                <div
                  key={login._id}
                  className="flex items-center justify-between gap-3 px-3 py-2 rounded-lg hover:bg-ink-900/3 dark:hover:bg-paper-50/5 text-sm"
                >
                  <div className="flex items-center gap-2">
                    <Clock size={13} className="text-ink-900/40 dark:text-paper-50/40" />
                    {new Date(login.timestamp).toLocaleString()}
                  </div>
                  <span className="tabular text-xs text-ink-900/45 dark:text-paper-50/45">
                    {login.ipAddress || "unknown IP"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </main>

      <MobileNav />
    </div>
  );
}
