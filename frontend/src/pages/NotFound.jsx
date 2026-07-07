import { Link } from "react-router-dom";
import Button from "../components/ui/Button";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-paper-50 dark:bg-ink-950 text-ink-900 dark:text-paper-50 flex flex-col items-center justify-center gap-4 px-4 text-center">
      <p className="font-mono text-amber-500 text-sm">404</p>
      <h1 className="font-display text-2xl font-semibold">This page went off-syllabus.</h1>
      <p className="text-ink-900/60 dark:text-paper-50/60 max-w-sm">
        The page you're looking for doesn't exist, or has moved.
      </p>
      <Link to="/">
        <Button>Back to home</Button>
      </Link>
    </div>
  );
}
