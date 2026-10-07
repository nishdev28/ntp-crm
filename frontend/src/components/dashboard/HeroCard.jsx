import { Link } from "react-router-dom";
import { ArrowUpRight, TrendingUp, Layers } from "lucide-react";
import { Card } from "../ui";
import { currency } from "../../lib/format";

/**
 * Executive Pipeline Summary Card:
 * Clean, structured view of active pipeline value and stage momentum.
 */
export function HeroCard({ value = 0, label = "Active Pipeline" }) {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-slate-900 text-white">
            <Layers className="h-3.5 w-3.5" />
          </div>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            {label}
          </span>
        </div>
        <Link
          to="/pipeline"
          className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-900 transition-colors"
        >
          <span>Pipeline</span>
          <ArrowUpRight className="h-3 w-3" />
        </Link>
      </div>

      <div className="mt-4">
        <p className="text-3xl font-bold tracking-tight text-slate-900 tabular-nums">
          {currency(value)}
        </p>
        <p className="mt-1 text-xs text-slate-500 flex items-center gap-1.5">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
          Live deal pipeline across active stages
        </p>
      </div>
    </Card>
  );
}
