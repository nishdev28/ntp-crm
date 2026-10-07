/* Shared domain constants kept in one place so UI + filters stay in sync
   with the backend enums. */

export const LEAD_STAGES = ["New", "Qualified", "Proposal", "Won", "Lost"];

export const PIPELINE_STAGES = ["New", "Qualified", "Proposal", "Won", "Lost"];

export const LEAD_PRIORITIES = ["Low", "Medium", "High"];

export const LEAD_SOURCES = [
  "Website",
  "Referral",
  "Cold Outreach",
  "Social",
  "Event",
  "Other",
];

export const TASK_STATUSES = ["Pending", "In Progress", "Completed"];
export const TASK_PRIORITIES = ["Low", "Medium", "High"];

/** Tailwind class tokens for each lead stage (badge + kanban accents). */
export const STAGE_STYLES = {
  New: {
    dot: "bg-sky-400",
    badge: "bg-sky-400/10 text-sky-300 border-sky-400/25",
    bar: "bg-sky-400",
    hex: "#38bdf8",
  },
  Qualified: {
    dot: "bg-teal-400",
    badge: "bg-teal-400/10 text-teal-300 border-teal-400/25",
    bar: "bg-teal-400",
    hex: "#2dd4bf",
  },
  Proposal: {
    dot: "bg-amber-400",
    badge: "bg-amber-400/10 text-amber-300 border-amber-400/25",
    bar: "bg-amber-400",
    hex: "#fbbf24",
  },
  Won: {
    dot: "bg-emerald-400",
    badge: "bg-emerald-400/10 text-emerald-300 border-emerald-400/25",
    bar: "bg-emerald-400",
    hex: "#34d399",
  },
  Lost: {
    dot: "bg-slate-500",
    badge: "bg-white/[0.04] text-slate-400 border-white/10",
    bar: "bg-slate-600",
    hex: "#66716f",
  },
};

export const PRIORITY_STYLES = {
  Low: "bg-white/[0.04] text-slate-400 border-white/10",
  Medium: "bg-amber-400/10 text-amber-300 border-amber-400/25",
  High: "bg-rose-400/10 text-rose-300 border-rose-400/25",
};

export const TASK_STATUS_STYLES = {
  Pending: "bg-white/[0.04] text-slate-400 border-white/10",
  "In Progress": "bg-sky-400/10 text-sky-300 border-sky-400/25",
  Completed: "bg-emerald-400/10 text-emerald-300 border-emerald-400/25",
};
