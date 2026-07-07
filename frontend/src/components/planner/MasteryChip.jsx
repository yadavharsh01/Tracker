const STATES = [
  { key: "not_started", label: "Not started" },
  { key: "learning", label: "Learning" },
  { key: "mastered", label: "Mastered" },
];

const styles = {
  not_started: "bg-ink-900/6 dark:bg-paper-50/8 text-ink-900/60 dark:text-paper-50/60",
  learning: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  mastered: "bg-teal-500/15 text-teal-600 dark:text-teal-400",
};

export default function MasteryChip({ value, onChange }) {
  const currentIndex = STATES.findIndex((s) => s.key === value);

  const cycle = () => {
    const next = STATES[(currentIndex + 1) % STATES.length];
    onChange(next.key);
  };

  const current = STATES[currentIndex] || STATES[0];

  return (
    <button
      onClick={cycle}
      className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${styles[current.key]}`}
      aria-label={`Mastery: ${current.label}. Click to change.`}
    >
      {current.label}
    </button>
  );
}
