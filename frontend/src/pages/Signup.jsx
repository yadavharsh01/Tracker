import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GraduationCap } from "lucide-react";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const { signup } = useAuth();
  const { notify } = useToast();
  const navigate = useNavigate();

  const validate = () => {
    const next = {};
    if (!name.trim()) next.name = "Your name is required";
    if (!/^\S+@\S+\.\S+$/.test(email)) next.email = "Enter a valid email";
    if (password.length < 6) next.password = "At least 6 characters";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      await signup(name.trim(), email, password);
      notify("Account created. Log in to get started.");
      navigate("/login");
    } catch (err) {
      setErrors({ form: err.response?.data?.msg || "Something went wrong. Try again." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-paper-50 dark:bg-ink-950 flex items-center justify-center px-4">
      <Card className="w-full max-w-sm animate-fade-up">
        <div className="flex flex-col items-center mb-6">
          <GraduationCap className="text-amber-500 mb-2" size={28} />
          <h2 className="font-display font-semibold text-xl">Create your account</h2>
          <p className="text-sm text-ink-900/50 dark:text-paper-50/50 mt-1">
            Start your prep, tracked properly.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            id="name"
            label="Full name"
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={errors.name}
          />
          <Input
            id="email"
            label="Email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={errors.email}
          />
          <Input
            id="password"
            label="Password"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
          />
          {errors.form && <p className="text-sm text-danger-500 font-medium">{errors.form}</p>}
          <Button type="submit" loading={submitting} className="w-full mt-1">
            Sign up
          </Button>
        </form>

        <p className="text-sm text-center text-ink-900/60 dark:text-paper-50/60 mt-6">
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-amber-500 hover:underline">
            Log in
          </Link>
        </p>
      </Card>
    </div>
  );
}
