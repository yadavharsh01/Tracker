import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Users, ShieldCheck, Flame, Clock } from "lucide-react";
import Sidebar from "../components/layout/Sidebar";
import MobileNav from "../components/layout/MobileNav";
import Card from "../components/ui/Card";
import Skeleton from "../components/ui/Skeleton";
import { adminListUsers } from "../lib/api";
import { useToast } from "../context/ToastContext";

function timeAgo(dateStr) {
  if (!dateStr) return "Never";
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  return `${days} days ago`;
}

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { notify } = useToast();

  useEffect(() => {
    adminListUsers()
      .then((res) => setUsers(res.data))
      .catch(() => notify("Couldn't load users.", "error"))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen flex bg-paper-50 dark:bg-ink-950 text-ink-900 dark:text-paper-50">
      <Sidebar />

      <main className="flex-1 px-5 md:px-10 py-8 pb-24 md:pb-8 max-w-5xl mx-auto w-full">
        <div className="flex items-center gap-2 mb-2">
          <ShieldCheck size={22} className="text-amber-500" />
          <h1 className="font-display text-2xl font-semibold">Admin — Users</h1>
        </div>
        <p className="text-sm text-ink-900/60 dark:text-paper-50/60 mb-6">
          {loading ? "Loading…" : `${users.length} registered user${users.length === 1 ? "" : "s"}`}
        </p>

        {loading ? (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : users.length === 0 ? (
          <Card className="text-center py-10">
            <Users className="mx-auto text-ink-900/30 dark:text-paper-50/30 mb-2" size={28} />
            <p className="text-sm font-medium text-ink-900/70 dark:text-paper-50/70">No users yet</p>
          </Card>
        ) : (
          <div className="flex flex-col gap-2">
            {users.map((u) => (
              <Link key={u._id} to={`/admin/users/${u._id}`}>
                <Card className="flex items-center justify-between gap-4 hover:shadow-soft-lg transition-shadow">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-display font-semibold text-sm truncate">{u.name}</h4>
                      {u.isAdmin && (
                        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-amber-500/15 text-amber-600 dark:text-amber-400">
                          ADMIN
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-ink-900/50 dark:text-paper-50/50 truncate">{u.email}</p>
                  </div>

                  <div className="hidden sm:flex items-center gap-5 shrink-0">
                    <div className="flex items-center gap-1.5 text-sm">
                      <Flame size={14} className="text-amber-500" />
                      <span className="tabular">{u.streak}d</span>
                    </div>
                    <div className="text-sm tabular text-ink-900/60 dark:text-paper-50/60">
                      Lvl {u.level}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-ink-900/50 dark:text-paper-50/50 w-24">
                      <Clock size={12} />
                      {timeAgo(u.lastLogin)}
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </main>

      <MobileNav />
    </div>
  );
}
