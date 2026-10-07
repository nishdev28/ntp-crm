import { useState } from "react";
import { Mail, Copy, Check, Sparkles, Send } from "lucide-react";
import { Dialog, Button, Field, Select, Textarea, Spinner } from "../ui";
import { aiApi } from "../../lib/services";
import { toast } from "sonner";

/**
 * Contextual email generator dialog. Drafts structured sales communication
 * based on lead details, chosen objective, and tone.
 */
export function AiEmailDialog({ open, onClose, lead }) {
  const [purpose, setPurpose] = useState("Follow-up");
  const [tone, setTone] = useState("Friendly & professional");
  const [loading, setLoading] = useState(false);
  const [draft, setDraft] = useState(null);
  const [copied, setCopied] = useState(false);

  const generate = async () => {
    setLoading(true);
    try {
      const res = await aiApi.generateEmail({ leadId: lead._id, purpose, tone });
      setDraft({ subject: res.subject, body: res.body });
    } catch (err) {
      toast.error(err.message || "Could not generate email");
    } finally {
      setLoading(false);
    }
  };

  const copy = () => {
    navigator.clipboard.writeText(`Subject: ${draft.subject}\n\n${draft.body}`);
    setCopied(true);
    toast.success("Draft copied to clipboard");
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Draft Lead Outreach"
      description={`Generate structured message draft for ${lead?.name || "recipient"}`}
    >
      <div className="grid grid-cols-2 gap-3">
        <Field label="Communication Objective">
          <Select value={purpose} onChange={(e) => setPurpose(e.target.value)}>
            {["Follow-up", "Sales pitch", "Meeting request", "Re-engagement", "Thank you"].map(
              (p) => (
                <option key={p}>{p}</option>
              )
            )}
          </Select>
        </Field>
        <Field label="Voice & Tone">
          <Select value={tone} onChange={(e) => setTone(e.target.value)}>
            {[
              "Friendly & professional",
              "Formal",
              "Concise & direct",
              "Warm & casual",
            ].map((t) => (
              <option key={t}>{t}</option>
            ))}
          </Select>
        </Field>
      </div>

      <div className="mt-4">
        <Button className="w-full text-xs font-semibold" onClick={generate} loading={loading}>
          <Sparkles className="h-3.5 w-3.5" />
          {draft ? "Regenerate Outreach Draft" : "Generate Draft with Gemini"}
        </Button>
      </div>

      {loading && <Spinner className="py-6" />}

      {draft && !loading && (
        <div className="mt-5 space-y-3">
          <div className="rounded-lg border border-slate-800 bg-slate-800/40 p-3 space-y-3">
            <Field label="Subject Line">
              <input
                value={draft.subject}
                onChange={(e) => setDraft({ ...draft, subject: e.target.value })}
                className="h-9 w-full rounded-md border border-slate-800 bg-slate-900 px-3 text-sm text-slate-100 placeholder-slate-400 focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </Field>
            <Field label="Email Body">
              <Textarea
                rows={9}
                value={draft.body}
                onChange={(e) => setDraft({ ...draft, body: e.target.value })}
                className="font-sans text-sm text-slate-100 leading-relaxed bg-slate-900"
              />
            </Field>
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] text-slate-400">Review and customize draft before sending</span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={copy}>
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? "Copied" : "Copy to Clipboard"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {!draft && !loading && (
        <div className="mt-4 flex items-center justify-center gap-1.5 rounded-lg border border-slate-800 bg-slate-800/40 py-2.5 text-[11px] text-slate-400">
          <span>Gemini Intelligence Model</span>
          <span>•</span>
          <span>Context-aware sales drafting</span>
        </div>
      )}
    </Dialog>
  );
}
