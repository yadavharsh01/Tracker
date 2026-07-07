export default function Card({ children, className = "", as: Tag = "div", ...props }) {
  return (
    <Tag
      className={`rounded-2xl border border-ink-900/8 dark:border-paper-50/8
        bg-white dark:bg-ink-800 shadow-soft p-6 ${className}`}
      {...props}
    >
      {children}
    </Tag>
  );
}
