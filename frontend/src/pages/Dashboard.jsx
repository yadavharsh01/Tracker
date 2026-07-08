import { useCallback, useEffect, useState } from "react";
import { Flame, Trophy, Clock, Zap } from "lucide-react";
import Sidebar from "../components/layout/Sidebar";
import MobileNav from "../components/layout/MobileNav";
import AdmitCardStat from "../components/ui/AdmitCardStat";
import Card from "../components/ui/Card";
import Skeleton from "../components/ui/Skeleton";
import SessionForm from "../components/dashboard/SessionForm";
import PomodoroTimer from "../components/dashboard/PomodoroTimer";
import StudyChart from "../components/dashboard/StudyChart";
import Heatmap from "../components/dashboard/Heatmap";
import ExamCountdown from "../components/dashboard/ExamCountdown";
import GoalsWidget from "../components/dashboard/GoalsWidget";
import TimeUtilizationChart from "../components/dashboard/TimeUtilizationChart";
import BadgesWidget from "../components/badges/BadgesWidget";
import StreakRiskBanner from "../components/dashboard/StreakRiskBanner";
import SessionHistory from "../components/dashboard/SessionHistory";
import ShareCard from "../components/dashboard/ShareCard";
import AICoach from "../components/dashboard/AICoach";
import OnboardingModal, { shouldShowOnboarding } from "../components/dashboard/OnboardingModal";
import { getProfile, getSessionStats, getTimeBySubject, listBadges, listSessions } from "../lib/api";
import { useToast } from "../context/ToastContext";

export default function Dashboard() {
  const [profile, setProfile] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [activeDates, setActiveDates] = useState(new Set());
  const [subjectData, setSubjectData] = useState([]);
  const [badges, setBadges] = useState([]);
  const [historySessions, setHistorySessions] = useState([]);
  const [historyRange, setHistoryRange] = useState("week");
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingSubjects, setLoadingSubjects] = useState(true);
  const [loadingBadges, setLoadingBadges] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const { notify } = useToast();

  const loadProfile = useCallback(async () => {
    setLoadingProfile(true);
    try {
      const res = await getProfile();
      setProfile(res.data);
      if (shouldShowOnboarding(res.data)) setShowOnboarding(true);
    } catch {
      notify("Couldn't load your profile.", "error");
    } finally {
      setLoadingProfile(false);
    }
  }, [notify]);

  const loadStats = useCallback(async () => {
    setLoadingStats(true);
    try {
      const res = await getSessionStats();
      const entries = Object.entries(res.data);
      setChartData(
        entries
          .map(([date, minutes]) => ({ date, minutes }))
          .slice(-14) // last 14 days keeps the chart legible
      );
      setActiveDates(new Set(entries.map(([date]) => date)));
    } catch {
      notify("Couldn't load your study stats.", "error");
    } finally {
      setLoadingStats(false);
    }
  }, [notify]);

  const loadSubjects = useCallback(async () => {
    setLoadingSubjects(true);
    try {
      const res = await getTimeBySubject();
      setSubjectData(res.data);
    } catch {
      notify("Couldn't load your time breakdown.", "error");
    } finally {
      setLoadingSubjects(false);
    }
  }, [notify]);

  const loadBadges = useCallback(async () => {
    setLoadingBadges(true);
    try {
      const res = await listBadges();
      setBadges(res.data);
    } catch {
      notify("Couldn't load your achievements.", "error");
    } finally {
      setLoadingBadges(false);
    }
  }, [notify]);

  const loadHistory = useCallback(
    async (range = historyRange) => {
      setLoadingHistory(true);
      try {
        const res = await listSessions(range === "all" ? undefined : range);
        setHistorySessions(res.data);
      } catch {
        notify("Couldn't load session history.", "error");
      } finally {
        setLoadingHistory(false);
      }
    },
    [notify, historyRange]
  );

  const handleRangeChange = (range) => {
    setHistoryRange(range);
    loadHistory(range);
  };

  useEffect(() => {
    loadProfile();
    loadStats();
    loadSubjects();
    loadBadges();
    loadHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadProfile, loadStats, loadSubjects, loadBadges]);

  const handleSessionAdded = () => {
    loadProfile();
    loadStats();
    loadSubjects();
    loadBadges();
    loadHistory();
  };

  return (
    <div className="min-h-screen flex bg-paper-50 dark:bg-ink-950 text-ink-900 dark:text-paper-50">
      <Sidebar />

      <main className="flex-1 px-5 md:px-10 py-8 pb-24 md:pb-8 max-w-6xl mx-auto w-full">
        <h1 className="font-display text-2xl font-semibold mb-6">Dashboard</h1>

        <StreakRiskBanner streak={profile?.streak} lastActiveDate={profile?.lastActiveDate} />

        {/* HERO STATS — the signature admit-card element, used once per view */}
        <div className="flex flex-wrap gap-4 mb-8 animate-fade-up">
          {loadingProfile ? (
            <>
              <Skeleton className="h-24 w-56" />
              <Skeleton className="h-24 w-56" />
            </>
          ) : (
            <>
              <AdmitCardStat
                label="Study streak"
                value={profile?.streak ?? 0}
                unit="days"
                icon={Flame}
              />
              <AdmitCardStat label="Level" value={profile?.level ?? 1} icon={Trophy} accent="teal" />
              <ExamCountdown
                examDate={profile?.examDate}
                onExamDateSet={(examDate) => setProfile((prev) => ({ ...prev, examDate }))}
              />
            </>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="flex items-center gap-3">
            <Clock className="text-amber-500" size={20} />
            <div>
              <p className="text-xs text-ink-900/50 dark:text-paper-50/50">Total hours</p>
              {loadingProfile ? (
                <Skeleton className="h-5 w-12 mt-1" />
              ) : (
                <p className="tabular font-semibold text-lg">
                  {profile?.totalHours?.toFixed(1) ?? "0.0"}
                </p>
              )}
            </div>
          </Card>
          <Card className="flex items-center gap-3">
            <Zap className="text-teal-500" size={20} />
            <div>
              <p className="text-xs text-ink-900/50 dark:text-paper-50/50">XP</p>
              {loadingProfile ? (
                <Skeleton className="h-5 w-12 mt-1" />
              ) : (
                <p className="tabular font-semibold text-lg">{profile?.xp ?? 0}</p>
              )}
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <StudyChart data={chartData} loading={loadingStats} />
          <Heatmap activeDates={activeDates} loading={loadingStats} />
          <TimeUtilizationChart data={subjectData} loading={loadingSubjects} />
        </div>

        <div className="mb-6">
          <BadgesWidget badges={badges} loading={loadingBadges} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <SessionForm onSessionAdded={handleSessionAdded} />
          <PomodoroTimer />
          <GoalsWidget />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 flex flex-col gap-6">
            <SessionHistory
              sessions={historySessions}
              loading={loadingHistory}
              range={historyRange}
              onRangeChange={handleRangeChange}
            />
            <AICoach />
          </div>
          <ShareCard
            streak={profile?.streak ?? 0}
            level={profile?.level ?? 1}
            totalHours={profile?.totalHours ?? 0}
          />
        </div>
      </main>

      <MobileNav />

      {showOnboarding && (
        <OnboardingModal
          onComplete={(updates) => {
            setShowOnboarding(false);
            if (Object.keys(updates).length > 0) {
              setProfile((prev) => ({ ...prev, ...updates }));
            }
          }}
        />
      )}
    </div>
  );
}
