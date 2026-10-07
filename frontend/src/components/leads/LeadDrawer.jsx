import { useState } from "react";
import {
  Mail,
  Phone,
  Building2,
  Sparkles,
  Pencil,
  Trash2,
  Send,
  AlertCircle,
  TrendingUp,
  ShieldAlert,
} from "lucide-react";
import { Drawer, Button, Badge, Avatar, Spinner } from "../ui";
import { AiEmailDialog } from "../ai/AiEmailDialog";
import { aiApi } from "../../lib/services";
import { currency, shortDate } from "../../lib/format";
import { STAGE_STYLES, PRIORITY_STYLES } from "../../lib/constants";
import { cn } from "../../lib/utils";
import { toast } from "sonner";

/** Detailed slide-over for a single lead: info, AI summary, email generator. */
export function LeadDrawer({ open, onClose, lead, onEdit, onDelete }) {
  const [summary, setSummary] = useState(null);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [emailOpen, setEmailOpen] = useState(false);

  if (!lead) return null;
  const stage = STAGE_STYLES[lead.status] || STAGE_STYLES.New;

  const runSummary = async () => {
    setLoadingSummary(true);
    try {
      const res = await aiApi.leadSummary({ leadId: lead._id });
      setSummary(res);
    } catch (err) {
      toast.error(err.message || "Could not summarize lead");
    } finally {
      setLoadingSummary(false);
    }
  };

  const riskTone =
    summary?.riskScore >= 66
      ? "text-rose-400 bg-rose-500/10 border-rose-500/25"
      : summary?.riskScore >= 33
      ? "text-amber-400 bg-amber-500/10 border-amber-500/25"
      : "text-emerald-400 bg-emerald-500/10 border-emerald-500/25";

  return (
    <>
      <Drawer open={open} onClose={onClose} title="Lead Profile">
        {/* Header */}
        <div className="flex items-start gap-3.5 pb-2">
          <Avatar name={lead.name} size="lg" />
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-lg font-bold tracking-tight text-slate-50">{lead.name}</h2>
            <p className="truncate text-xs font-medium text-slate-500">{lead.company || "No company specified"}</p>
            <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
              <Badge className={stage.badge} dot={stage.dot}>
                {lead.status}
              </Badge>
              <Badge className={PRIORITY_STYLES[lead.priority]}>{lead.priority} priority</Badge>
              {lead.source && (
                <span className="inline-flex items-center rounded-md border border-slate-800 bg-slate-800/40 px-2 py-0.5 text-[11px] font-medium text-slate-300">
                  {lead.source}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Value */}
        <div className="mt-5 rounded-lg border border-slate-800 bg-slate-800/40 p-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Pipeline Deal Value</span>
            <span className="text-[11px] font-mono text-slate-400">USD</span>
          </div>
          <p className="mt-1 font-mono text-2xl font-bold tracking-tight text-slate-50">{currency(lead.value)}</p>
        </div>

        {/* Contact info list */}
        <div className="mt-4 rounded-lg border border-slate-800 bg-slate-900 divide-y divide-slate-800 overflow-hidden shadow-sm">
          <InfoRow icon={Mail} label="Email" value={lead.email} href={lead.email ? `mailto:${lead.email}` : undefined} />
          <InfoRow icon={Phone} label="Phone" value={lead.phone} href={lead.phone ? `tel:${lead.phone}` : undefined} />
          <InfoRow icon={Building2} label="Company" value={lead.company} />
        </div>

        {lead.notes && (
          <div className="mt-4 rounded-lg border border-slate-800 bg-slate-900 p-4 shadow-sm">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Account Notes
            </p>
            <p className="mt-2 text-xs leading-relaxed text-slate-200 whitespace-pre-wrap">{lead.notes}</p>
          </div>
        )}

        {/* AI Deal Intelligence */}
        <div className="mt-5 rounded-lg border border-slate-800 bg-slate-800/40 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded bg-indigo-500/10 border border-indigo-500/25 text-indigo-400">
                <Sparkles className="h-3 w-3" />
              </span>
              <span className="text-xs font-semibold text-slate-100">Deal Intelligence Analysis</span>
            </div>
            {!summary && (
              <Button size="sm" variant="secondary" onClick={runSummary} loading={loadingSummary}>
                Run Analysis
              </Button>
            )}
          </div>

          {loadingSummary && <Spinner className="py-6" />}

          {summary && (
            <div className="mt-3.5 space-y-3">
              <p className="text-xs leading-relaxed text-slate-200 rounded-lg border border-slate-800 bg-slate-900 p-3">{summary.summary}</p>
              
              <div className="grid grid-cols-2 gap-2.5">
                <div className="rounded-lg border border-slate-800 bg-slate-900 p-3 text-center">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Risk Assessment</span>
                  <div className="mt-1 flex items-center justify-center gap-1.5">
                    <span className={cn("inline-flex items-center rounded border px-2 py-0.5 text-xs font-bold", riskTone)}>
                      {summary.riskScore} / 100
                    </span>
                  </div>
                </div>
                <div className="rounded-lg border border-slate-800 bg-slate-900 p-3 text-center">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Target Priority</span>
                  <p className="mt-1 text-xs font-bold text-slate-50">{summary.suggestedPriority}</p>
                </div>
              </div>

              {summary.nextBestAction && (
                <div className="flex items-start gap-2.5 rounded-lg border border-slate-800 bg-slate-900 p-3">
                  <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-indigo-400" />
                  <div className="text-xs text-slate-200">
                    <span className="font-semibold text-slate-50">Recommended Next Step: </span>
                    {summary.nextBestAction}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="mt-5 space-y-2">
          <Button variant="primary" onClick={() => setEmailOpen(true)} className="w-full text-xs font-semibold">
            <Mail className="h-3.5 w-3.5" /> Draft Outreach Email
          </Button>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="secondary" size="sm" onClick={() => onEdit(lead)} className="w-full">
              <Pencil className="h-3.5 w-3.5" /> Edit Details
            </Button>
            <Button variant="danger" size="sm" onClick={() => onDelete(lead)} className="w-full">
              <Trash2 className="h-3.5 w-3.5" /> Delete
            </Button>
          </div>
        </div>

        <div className="mt-5 border-t border-slate-800 pt-3 text-center">
          <span className="font-mono text-[11px] text-slate-400">
            Recorded {shortDate(lead.createdAt)}
          </span>
        </div>
      </Drawer>

      <AiEmailDialog open={emailOpen} onClose={() => setEmailOpen(false)} lead={lead} />
    </>
  );
}

function InfoRow({ icon: Icon, label, value, href }) {
  if (!value) return null;
  const content = (
    <div className="flex items-center justify-between px-3.5 py-2.5 text-xs text-slate-100 transition hover:bg-slate-800/40">
      <div className="flex items-center gap-2.5 text-slate-500">
        <Icon className="h-3.5 w-3.5 text-slate-400" />
        <span className="font-medium text-slate-300">{label}</span>
      </div>
      <span className="font-medium text-slate-50 truncate max-w-[200px]">{value}</span>
    </div>
  );
  return href ? (
    <a href={href} className="block transition hover:text-indigo-400">
      {content}
    </a>
  ) : (
    content
  );
}
