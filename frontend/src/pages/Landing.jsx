import { Link } from "react-router-dom";
import { ArrowRight, Flame, Trophy } from "lucide-react";
import Button from "../components/ui/Button";
import AdmitCardStat from "../components/ui/AdmitCardStat";

export default function Landing() {
  return (
    <div className="min-h-screen bg-paper-50 dark:bg-ink-950 text-ink-900 dark:text-paper-50 flex flex-col">
      <header className="flex items-center justify-between px-6 md:px-12 py-6">
        <span className="font-display font-semibold text-lg">CAT Tracker</span>
        <div className="flex items-center gap-3">
          <Link to="/login">
            <Button variant="ghost">Log in</Button>
          </Link>
          <Link to="/signup">
            <Button variant="primary">Sign up</Button>
          </Link>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-6 py-12 gap-10 text-center">
        <div className="max-w-xl animate-fade-up">
          <p className="text-sm font-semibold uppercase tracking-wider text-amber-500 mb-3">
            For CAT aspirants
          </p>
          <h1 className="font-display text-4xl md:text-5xl font-semibold leading-tight mb-4">
            Every study session, one step closer to your admit card.
          </h1>
          <p className="text-ink-900/60 dark:text-paper-50/60 text-lg mb-8">
            Log sessions, hold your streak, and watch your percentile-worthy prep
            add up — day by day, section by section.
          </p>
          <Link to="/signup">
            <Button variant="primary" className="text-base px-6 py-3">
              Start tracking free <ArrowRight size={18} />
            </Button>
          </Link>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 animate-fade-up">
          <AdmitCardStat label="Current streak" value="12" unit="days" icon={Flame} />
          <AdmitCardStat label="Level" value="4" icon={Trophy} accent="teal" />
        </div>
      </main>

      <footer className="text-center text-xs text-ink-900/40 dark:text-paper-50/40 py-6">
        Built for the CAT prep grind.
      </footer>
    </div>
  );
}
