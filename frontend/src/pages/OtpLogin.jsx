import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GraduationCap, ShieldCheck, ArrowLeft } from "lucide-react";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { requestOtp } from "../lib/api";

export default function OtpLogin() {
  const [step, setStep] = useState("identifier"); // "identifier" | "code"
  const [identifier, setIdentifier] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { loginWithOtp } = useAuth();
  const { notify } = useToast();
  const navigate = useNavigate();

  const handleRequestCode = async (e) => {
    e.preventDefault();
    if (!identifier.trim()) {
      setError("Enter your email or phone number");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      await requestOtp(identifier.trim());
      setStep("code");
      notify("Code sent. Check your email or phone.");
    } catch (err) {
      setError(err.response?.data?.msg || "Couldn't send a code. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    if (code.length !== 6) {
      setError("Enter the 6-digit code");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      await loginWithOtp(identifier.trim(), code);
      notify("Welcome back.");
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.msg || "That code is invalid or has expired.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-paper-50 dark:bg-ink-950 flex items-center justify-center px-4">
      <Card className="w-full max-w-sm animate-fade-up">
        <div className="flex flex-col items-center mb-6">
          {step === "identifier" ? (
            <GraduationCap className="text-amber-500 mb-2" size={28} />
          ) : (
            <ShieldCheck className="text-amber-500 mb-2" size={28} />
          )}
          <h2 className="font-display font-semibold text-xl">
            {step === "identifier" ? "Log in with a code" : "Enter your code"}
          </h2>
          <p className="text-sm text-ink-900/50 dark:text-paper-50/50 mt-1 text-center">
            {step === "identifier"
              ? "We'll send a 6-digit code to your email or phone."
              : `Sent to ${identifier}. It expires in 10 minutes.`}
          </p>
        </div>

        {step === "identifier" ? (
          <form onSubmit={handleRequestCode} className="flex flex-col gap-4">
            <Input
              id="otp-identifier"
              label="Email or phone number"
              placeholder="you@example.com or +919876543210"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              error={error}
            />
            <Button type="submit" loading={submitting} className="w-full mt-1">
              Send code
            </Button>
          </form>
        ) : (
          <form onSubmit={handleVerify} className="flex flex-col gap-4">
            <Input
              id="otp-code"
              label="6-digit code"
              inputMode="numeric"
              maxLength={6}
              placeholder="000000"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              error={error}
              className="text-center tracking-[0.3em] text-lg"
            />
            <Button type="submit" loading={submitting} className="w-full mt-1">
              Verify and log in
            </Button>
            <button
              type="button"
              onClick={() => {
                setStep("identifier");
                setCode("");
                setError("");
              }}
              className="flex items-center justify-center gap-1.5 text-xs font-medium text-ink-900/50 dark:text-paper-50/50 hover:text-amber-500"
            >
              <ArrowLeft size={12} /> Use a different email or phone
            </button>
          </form>
        )}

        <p className="text-sm text-center text-ink-900/60 dark:text-paper-50/60 mt-6">
          <Link to="/login" className="font-medium text-amber-500 hover:underline">
            Log in with password instead
          </Link>
        </p>
      </Card>
    </div>
  );
}
