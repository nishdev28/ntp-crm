import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Card } from "../ui";
import { cn } from "../../lib/utils";

/**
 * Clean KPI stat card with icon, metric, label, and trend.
 */
export function StatCard({ label, value, icon: Icon, trend, helper, accent = false }) {
  const positive = trend == null || trend >= 0;

  return (
    <Card
      className={cn(
        "p-5",
        accent && "border-teal-400/30"
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-400">
          {label}
        </span>
        {Icon && (
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.04] text-slate-300">
            <Icon className="h-4 w-4" />
          </div>
        )}
      </div>

      <div className="mt-3 flex items-baseline justify-between gap-2">
        <p className="text-2xl font-semibold tracking-tight text-white tabular-nums">
          {value}
        </p>

        {trend != null && (
          <span
            className={cn(
              "inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 text-xs font-medium",
              positive
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
            )}
          >
            {positive ? (
              <ArrowUpRight className="h-3 w-3" />
            ) : (
              <ArrowDownRight className="h-3 w-3" />
            )}
            {Math.abs(trend)}%
          </span>
        )}
      </div>

      {helper && (
        <p className="mt-1.5 text-xs text-slate-400">
          {helper}
        </p>
      )}
    </Card>
  );
}
