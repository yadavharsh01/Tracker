import { useEffect, useState } from "react";
import { KeyRound, User, Download, AlertTriangle } from "lucide-react";
import Sidebar from "../components/layout/Sidebar";
import MobileNav from "../components/layout/MobileNav";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import PushNotifications from "../components/settings/PushNotifications";
import LeaderboardOptIn from "../components/settings/LeaderboardOptIn";
import {
  getProfile,
  updateProfile,
  changePassword,
  deleteAccount,
  exportData,
} from "../lib/api";

function ProfileSection() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { notify } = useToast();

  useEffect(() => {
    getProfile()
      .then((res) => {
        setName(res.data.name || "");
        setEmail(res.data.email || "");
        setPhone(res.data.phone || "");
      })
      .catch(() => notify("Couldn't load your profile.", "error"))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await updateProfile({ name, email, phone: phone || null });
      notify("Profile updated.");
    } catch (err) {
      notify(err.response?.data?.msg || "Couldn't update your profile.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card>
      <div className="flex items-center gap-2 mb-4">
        <User size={18} className="text-amber-500" />
        <h3 className="font-display font-semibold text-base">Profile</h3>
      </div>
      {loading ? (
        <p className="text-sm text-ink-900/50 dark:text-paper-50/50">Loading…</p>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input id="settings-name" label="Name" value={name} onChange={(e) => setName(e.target.value)} />
          <Input
            id="settings-email"
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            id="settings-phone"
            label="Phone (optional — enables code login by SMS)"
            placeholder="+919876543210"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <Button type="submit" loading={submitting} className="self-start">
            Save changes
          </Button>
        </form>
      )}
    </Card>
  );
}

function PasswordSection() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { notify } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("New passwords don't match");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      await changePassword(currentPassword, newPassword);
      notify("Password updated.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(err.response?.data?.msg || "Couldn't update your password.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card>
      <div className="flex items-center gap-2 mb-4">
        <KeyRound size={18} className="text-amber-500" />
        <h3 className="font-display font-semibold text-base">Password</h3>
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          id="current-password"
          label="Current password"
          type="password"
          autoComplete="current-password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
        />
        <Input
          id="settings-new-password"
          label="New password"
          type="password"
          autoComplete="new-password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
        <Input
          id="settings-confirm-password"
          label="Confirm new password"
          type="password"
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          error={error}
        />
        <Button type="submit" loading={submitting} className="self-start">
          Update password
        </Button>
      </form>
    </Card>
  );
}

function ExportSection() {
  const [exporting, setExporting] = useState(false);
  const { notify } = useToast();

  const handleExport = async () => {
    setExporting(true);
    try {
      const res = await exportData();
      const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `cat-tracker-export-${new Date().toISOString().slice(0, 10)}.json`;
      link.click();
      URL.revokeObjectURL(url);
      notify("Export downloaded.");
    } catch {
      notify("Couldn't export your data.", "error");
    } finally {
      setExporting(false);
    }
  };

  return (
    <Card>
      <div className="flex items-center gap-2 mb-3">
        <Download size={18} className="text-amber-500" />
        <h3 className="font-display font-semibold text-base">Export your data</h3>
      </div>
      <p className="text-sm text-ink-900/60 dark:text-paper-50/60 mb-4">
        Download everything you've logged — sessions, mock tests, sectional tests, topics,
        goals, and college targets — as a single JSON file.
      </p>
      <Button variant="secondary" onClick={handleExport} loading={exporting}>
        Download my data
      </Button>
    </Card>
  );
}

function DangerZone() {
  const [confirming, setConfirming] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { logout } = useAuth();
  const { notify } = useToast();

  const handleDelete = async (e) => {
    e.preventDefault();
    if (!password) {
      setError("Enter your password to confirm");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      await deleteAccount(password);
      notify("Account deleted.");
      logout();
      window.location.href = "/";
    } catch (err) {
      setError(err.response?.data?.msg || "Couldn't delete your account.");
      setSubmitting(false);
    }
  };

  return (
    <Card className="border-danger-500/30">
      <div className="flex items-center gap-2 mb-3">
        <AlertTriangle size={18} className="text-danger-500" />
        <h3 className="font-display font-semibold text-base text-danger-500">Danger zone</h3>
      </div>

      {!confirming ? (
        <>
          <p className="text-sm text-ink-900/60 dark:text-paper-50/60 mb-4">
            Permanently delete your account and everything in it. This can't be undone.
          </p>
          <Button variant="danger" onClick={() => setConfirming(true)}>
            Delete my account
          </Button>
        </>
      ) : (
        <form onSubmit={handleDelete} className="flex flex-col gap-4">
          <p className="text-sm text-danger-500 font-medium">
            This permanently deletes your account and all data. Enter your password to confirm.
          </p>
          <Input
            id="delete-password"
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={error}
          />
          <div className="flex items-center gap-2">
            <Button type="submit" variant="danger" loading={submitting}>
              Yes, permanently delete my account
            </Button>
            <Button type="button" variant="ghost" onClick={() => setConfirming(false)}>
              Cancel
            </Button>
          </div>
        </form>
      )}
    </Card>
  );
}

export default function Settings() {
  return (
    <div className="min-h-screen flex bg-paper-50 dark:bg-ink-950 text-ink-900 dark:text-paper-50">
      <Sidebar />

      <main className="flex-1 px-5 md:px-10 py-8 pb-24 md:pb-8 max-w-2xl mx-auto w-full">
        <h1 className="font-display text-2xl font-semibold mb-6">Settings</h1>

        <div className="flex flex-col gap-6">
          <ProfileSection />
          <PasswordSection />
          <PushNotifications />
          <LeaderboardOptIn />
          <ExportSection />
          <DangerZone />
        </div>
      </main>

      <MobileNav />
    </div>
  );
}
