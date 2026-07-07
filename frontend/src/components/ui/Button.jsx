const variants = {
  primary:
    "bg-amber-500 text-ink-950 hover:bg-amber-400 active:bg-amber-600 disabled:bg-amber-500/50",
  secondary:
    "bg-ink-800 text-paper-50 hover:bg-ink-700 active:bg-ink-600 disabled:bg-ink-800/50 dark:bg-ink-700 dark:hover:bg-ink-600",
  ghost:
    "bg-transparent text-ink-900 dark:text-paper-50 hover:bg-ink-900/5 dark:hover:bg-paper-50/10",
  danger:
    "bg-danger-500 text-paper-50 hover:bg-danger-600 disabled:bg-danger-500/50",
};

export default function Button({
  children,
  variant = "primary",
  className = "",
  loading = false,
  disabled = false,
  type = "button",
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold
        transition-colors duration-150 disabled:cursor-not-allowed
        ${variants[variant]} ${className}`}
      {...props}
    >
      {loading && (
        <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
      )}
      {children}
    </button>
  );
}
