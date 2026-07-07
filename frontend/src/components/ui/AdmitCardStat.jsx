/**
 * The one signature visual element in this app: a ticket/admit-card stub,
 * echoing the actual CAT admit card every aspirant is working toward.
 * Used sparingly for hero-level stats only (landing hero, dashboard top row).
 */
export default function AdmitCardStat({ label, value, unit, icon: Icon, accent = "amber" }) {
  const accentClass = accent === "amber" ? "text-amber-500" : "text-teal-500";

  return (
    <div className="admit-card flex items-stretch text-paper-50 min-w-[220px]">
      <div className="flex-1 px-6 py-5">
        <p className="text-xs font-medium uppercase tracking-wider text-paper-50/60">
          {label}
        </p>
        <p className="tabular mt-1 text-3xl font-semibold">
          {value}
          {unit && <span className="ml-1 text-base font-medium text-paper-50/60">{unit}</span>}
        </p>
      </div>
      {Icon && (
        <div className="admit-card-stub flex items-center justify-center px-5">
          <Icon className={accentClass} size={22} />
        </div>
      )}
    </div>
  );
}
