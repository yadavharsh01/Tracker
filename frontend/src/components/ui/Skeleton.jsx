export default function Skeleton({ className = "" }) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-ink-900/8 dark:bg-paper-50/8 ${className}`}
      aria-hidden="true"
    />
  );
}
