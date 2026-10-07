import { useState } from "react";
import { ScanSearch, TrendingUp, Lightbulb, RefreshCw, CheckCircle2 } from "lucide-react";
import { Card, Button, Spinner } from "../ui";
import { aiApi } from "../../lib/services";
import { toast } from "sonner";

/**
 * Pipeline review panel — AI assistant surfacing health score,
 * key observations, and actionable deal recommendations.
 */
export function AiInsightsCard() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);

  const run = async () => {
    setLoading(true);
    try {
      const res = await aiApi.salesInsights({});
      setData(res);
    } catch (err) {
      toast.error(err.message || "Could not generate insights");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="flex flex-col p-5">
      <div className="flex items-center justify-between border-b border-white/[0.07] pb-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/[0.04] text-slate-300">
            <ScanSearch className="h-3.5 w-3.5" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-slate-50">
              Pipeline review
            </h3>
            <p className="text-[11px] text-slate-500">AI summary of your open deals</p>
          </div>
        </div>
        {data && (
          <button
            onClick={run}
            disabled={loading}
            className="rounded-md p-1.5 text-slate-400 hover:bg-white/[0.06] hover:text-slate-200 transition-colors cursor-pointer"
            title="Refresh analysis"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {loading ? (
        <div className="py-8 flex justify-center">
          <Spinner />
        </div>
      ) : !data ? (
        <div className="flex flex-1 flex-col items-center justify-center py-6 text-center">
          <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
            Review your open deals for stalled stages and suggested next steps.
          </p>
          <Button
            className="mt-4"
            size="sm"
            variant="outline"
            onClick={run}
          >
            <ScanSearch className="h-3.5 w-3.5 text-slate-200" />
            <span>Run review</span>
          </Button>
        </div>
      ) : (
        <div className="mt-4 space-y-4">
          <div className="rounded-lg border border-white/[0.07] bg-white/[0.03] p-3.5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">
                Health score
              </span>
              <span className="text-sm font-semibold text-slate-50 tabular-nums">
                {data.healthScore}/100
              </span>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-teal-400 transition-all duration-500"
                style={{ width: `${Math.min(Math.max(data.healthScore, 5), 100)}%` }}
              />
            </div>
            {data.headline && (
              <p className="mt-2.5 text-xs font-medium text-slate-100 leading-snug">
                {data.headline}
              </p>
            )}
          </div>

          <Section icon={TrendingUp} title="Observations" items={data.insights} />
          <Section
            icon={Lightbulb}
            title="Next steps"
            items={data.recommendations}
          />
        </div>
      )}
    </Card>
  );
}

function Section({ icon: Icon, title, items = [] }) {
  if (!items || items.length === 0) return null;
  return (
    <div>
      <div className="mb-2 flex items-center gap-1.5 text-xs font-medium text-slate-300">
        <Icon className="h-3.5 w-3.5 text-slate-500" /> {title}
      </div>
      <ul className="space-y-1.5">
        {items.map((t, i) => (
          <li key={i} className="flex items-start gap-2 text-xs text-slate-300 leading-relaxed">
            <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-slate-400" />
            <span>{t}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
