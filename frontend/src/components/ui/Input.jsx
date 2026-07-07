export default function Input({ label, error, id, className = "", ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-ink-900/80 dark:text-paper-50/80">
          {label}
        </label>
      )}
      <input
        id={id}
        className={`rounded-xl border bg-paper-100 dark:bg-ink-900 px-3.5 py-2.5 text-sm
          text-ink-900 dark:text-paper-50 placeholder:text-ink-900/40 dark:placeholder:text-paper-50/40
          border-ink-900/10 dark:border-paper-50/10
          focus-visible:border-amber-500
          ${error ? "border-danger-500" : ""} ${className}`}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        {...props}
      />
      {error && (
        <p id={`${id}-error`} className="text-xs font-medium text-danger-500">
          {error}
        </p>
      )}
    </div>
  );
}
