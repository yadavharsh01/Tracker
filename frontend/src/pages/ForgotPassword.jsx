import { useState } from "react";
import { Link } from "react-router-dom";
import { GraduationCap, Mail } from "lucide-react";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import { forgotPassword } from "../lib/api";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setError("Enter your email");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      await forgotPassword(email);
      setSent(true);
    } catch (err) {
      setError(err.response?.data?.msg || "Something went wrong. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-paper-50 dark:bg-ink-950 flex items-center justify-center px-4">
      <Card className="w-full max-w-sm animate-fade-up">
        <div className="flex flex-col items-center mb-6">
          <GraduationCap className="text-amber-500 mb-2" size={28} />
          <h2 className="font-display font-semibold text-xl">Reset your password</h2>
          <p className="text-sm text-ink-900/50 dark:text-paper-50/50 mt-1 text-center">
            Enter your email and we'll send a reset link.
          </p>
        </div>

        {sent ? (
          <div className="flex flex-col items-center gap-3 text-center py-4">
            <Mail className="text-teal-500" size={28} />
            <p className="text-sm text-ink-900/80 dark:text-paper-50/80">
              If that email is registered, a reset link is on its way. Check your inbox
              (and spam folder) — it expires in 1 hour.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              id="email"
              label="Email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={error}
            />
            <Button type="submit" loading={submitting} className="w-full mt-1">
              Send reset link
            </Button>
          </form>
        )}

        <p className="text-sm text-center text-ink-900/60 dark:text-paper-50/60 mt-6">
          <Link to="/login" className="font-medium text-amber-500 hover:underline">
            Back to log in
          </Link>
        </p>
      </Card>
    </div>
  );
}
