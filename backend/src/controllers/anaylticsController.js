import Lead from "../models/Lead.js";
import Task from "../models/Task.js";
import Contact from "../models/Contact.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const lastSixMonths = () => {
  const months = [];
  const now = new Date();

  for (let i = 5; i >= 0; i -= 1) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
      label: d.toLocaleString("en-US", { month: "short" }),
    });
  }

  return months;
};

export const getOverview = asyncHandler(async (req, res) => {
  const owner = req.user._id;

  const [leads, contactCount, openTasks] = await Promise.all([
    Lead.find({ owner }),
    Contact.countDocuments({ owner }),
    Task.countDocuments({ owner, status: { $ne: "Completed" } }),
  ]);

  const stages = ["New", "Qualified", "Proposal", "Won", "Lost"];
  const byStage = Object.fromEntries(
    stages.map((s) => [s, { count: 0, value: 0 }]),
  );

  let totalValue = 0;
  let wonValue = 0;

  for (const l of leads) {
    const bucket = byStage[l.status] || { count: 0, value: 0 };
    bucket.count += 1;
    bucket.value += l.value || 0;
    byStage[l.status] = bucket;

    totalValue += l.value || 0;

    if (l.status === "Won") wonValue += l.value || 0;
  }

  const won = byStage.Won?.count || 0;
  const lost = byStage.Lost?.count || 0;
  const closed = won + lost;
  const conversionRate = closed ? Math.round((won / closed) * 100) : 0;

  const months = lastSixMonths();
  const trend = months.map(({ key: label }) => ({
    month: label,
    leads: 0,
    won: 0,
  }));
  const indexByKey = Object.fromEntries(months.map((m, i) => [m.key, i]));

  for (const l of leads) {
    const d = new Date(l.createdAt);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    const index = indexByKey[key];

    if (index !== undefined) {
      trend[index].leads += 1;

      if (l.status === "Won") {
        trend[index].won += l.value || 0;
      }
    }
  }

  const recentLeads = [...leads]
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    .slice(0, 6)
    .map((l) => ({
      id: l._id,
      name: l.name,
      company: l.company,
      status: l.status,
      value: l.value,
      updatedAt: l.updatedAt,
    }));

  res.json({
    success: true,
    stats: {
      revenueWon: wonValue,
      pipelineValue: totalValue,
      totalLeads: leads.length,
      totalContact: contactCount,
      openTasks,
      conversionRate,
    },
    pipeline: stages.map((s) => ({
      stage: s,
      count: byStage[s].count,
      value: byStage[s].value,
    })),
    trend,
    recentLeads,
  });
});

const lastSixMonth = () => {
  const labels = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const now = new Date();
  const out = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    out.push({
      key: `${d.getFullYear()}-${d.getMonth()}`,
      label: labels[d.getMonth()],
    });
  }
  return out;
};
