import Lead from "../models/Lead.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import {
  generateEmail,
  generateLeadSummary,
  generateSalesInsights,
  isAiConfigured,
} from "../services/ai.service.js";

const resolveLead = async (req) => {
  if (req.body.leadId) {
    const lead = await Lead.findOne({
      _id: req.body.leadId,
      owner: req.user._id,
    });
    if (!lead) throw new ApiError(404, "Lead not found");
    return lead;
  }
  if (req.body.lead) return req.body.lead;
  throw new ApiError(400, "Provide leadId or an inline lead object");
};

const buildPipelineStats = (leads) => {
  const byState = {};
  let totalValue = 0;

  for (const l of leads) {
    byState[l.status] = byState[l.status] || { count: 0, value: 0 };
    byState[l.status].count += 1;
    byState[l.status].value += l.value || 0;
    totalValue += l.value || 0;
  }

  const won = byState.Won?.count || 0;
  const lost = byState.Lost?.count || 0;
  const closed = won + lost;

  return {
    totalLeads: leads.length,
    totalPipeline: totalValue,
    winRate: closed ? Math.round((won / closed) * 100) : 0,
    stages: byState,
  };
};

export const aiStatus = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    configured: isAiConfigured(),
    model: process.env.GEMINI_MODEL || "gemini-3.5-flash",
  });
});

export const leadSummary = asyncHandler(async (req, res) => {
  const lead = await resolveLead(req);
  const result = await generateLeadSummary(lead);

  if (req.body.leadId) {
    await Lead.updateOne(
      { _id: req.body.leadId, owner: req.user._id },
      { $set: { aiSummary: result.summary, aiRiskScore: result.riskScore } },
    );
  }

  res.json({ success: true, ...result });
});

export const generateEmailDraft = asyncHandler(async (req, res) => {
  const lead = await resolveLead(req);
  const { purpose, tone } = req.body;

  const result = await generateEmail({
    lead,
    purpose,
    tone,
    sender: { name: req.user.name, company: req.user.company },
  });

  res.json({ success: true, ...result });
});

export const salesInsights = asyncHandler(async (req, res) => {
  let stats = req.body.stats;
  if (!stats) {
    const leads = await Lead.find({ owner: req.user._id });
    stats = buildPipelineStats(leads);
  }

  const result = await generateSalesInsights(stats);
  res.json({ success: true, ...result });
});