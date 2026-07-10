import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GraduationCap } from "lucide-react";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const { notify } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Enter both your email and password");
      return;
    }

    setSubmitting(true);
    try {
      await login(email, password);
      notify("Welcome back.");
      navigate("/dashboard");
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
          <h2 className="font-display font-semibold text-xl">Welcome back</h2>
          <p className="text-sm text-ink-900/50 dark:text-paper-50/50 mt-1">
            Pick up where you left off.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            id="email"
            label="Email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            id="password"
            label="Password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={error}
          />
          <div className="flex justify-end -mt-2">
            <Link to="/forgot-password" className="text-xs font-medium text-ink-900/50 dark:text-paper-50/50 hover:text-amber-500">
              Forgot password?
            </Link>
          </div>
          <Button type="submit" loading={submitting} className="w-full mt-1">
            Log in
          </Button>
        </form>

        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px bg-ink-900/8 dark:bg-paper-50/10" />
          <span className="text-xs text-ink-900/40 dark:text-paper-50/40">or</span>
          <div className="flex-1 h-px bg-ink-900/8 dark:bg-paper-50/10" />
        </div>

        <Link to="/otp-login">
          <Button variant="secondary" className="w-full">
            Log in with a code instead
          </Button>
        </Link>

        <p className="text-sm text-center text-ink-900/60 dark:text-paper-50/60 mt-6">
          New here?{" "}
          <Link to="/signup" className="font-medium text-amber-500 hover:underline">
            Create an account
          </Link>
        </p>
      </Card>
    </div>
  );
}
