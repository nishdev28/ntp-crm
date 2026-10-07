import { cn } from "../../lib/utils";

/**
 * Segmented control tabs (e.g., Monthly / Annually, status filter).
 */
export function Tabs({ tabs, value, onChange, className }) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-0.5 rounded-xl bg-white/[0.03] p-0.5 border border-white/[0.07]",
        className
      )}
    >
      {tabs.map((t) => {
        const active = t.value === value;
        return (
          <button
            key={t.value}
            type="button"
            onClick={() => onChange(t.value)}
            className={cn(
              "rounded-lg px-3 py-1 text-xs font-medium transition-colors cursor-pointer",
              active
                ? "bg-white/[0.08] text-white"
                : "text-slate-400 hover:text-slate-200"
            )}
          >
            {t.label}
          </button>
        );
      })}
    </div>
  );
}
