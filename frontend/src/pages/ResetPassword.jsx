import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { GraduationCap, CheckCircle2 } from "lucide-react";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import { resetPassword } from "../lib/api";
import { useToast } from "../context/ToastContext";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email") || "";
  const token = searchParams.get("token") || "";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const { notify } = useToast();
  const navigate = useNavigate();

  const missingParams = !email || !token;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      await resetPassword(email, token, newPassword);
      setDone(true);
      notify("Password reset. You can log in now.");
    } catch (err) {
      setError(err.response?.data?.msg || "That link may have expired. Request a new one.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-paper-50 dark:bg-ink-950 flex items-center justify-center px-4">
      <Card className="w-full max-w-sm animate-fade-up">
        <div className="flex flex-col items-center mb-6">
          <GraduationCap className="text-amber-500 mb-2" size={28} />
          <h2 className="font-display font-semibold text-xl">Set a new password</h2>
        </div>

        {missingParams ? (
          <p className="text-sm text-center text-danger-500 font-medium">
            This link is missing information. Request a new reset link.
          </p>
        ) : done ? (
          <div className="flex flex-col items-center gap-3 text-center py-4">
            <CheckCircle2 className="text-teal-500" size={28} />
            <p className="text-sm text-ink-900/80 dark:text-paper-50/80">Your password has been updated.</p>
            <Button onClick={() => navigate("/login")} className="mt-2">
              Go to login
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              id="new-password"
              label="New password"
              type="password"
              autoComplete="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <Input
              id="confirm-password"
              label="Confirm new password"
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              error={error}
            />
            <Button type="submit" loading={submitting} className="w-full mt-1">
              Reset password
            </Button>
          </form>
        )}

        <p className="text-sm text-center text-ink-900/60 dark:text-paper-50/60 mt-6">
          <Link to="/forgot-password" className="font-medium text-amber-500 hover:underline">
            Request a new link
          </Link>
        </p>
      </Card>
    </div>
  );
}
