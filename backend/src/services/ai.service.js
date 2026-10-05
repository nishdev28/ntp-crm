import { GoogleGenAI, Type } from "@google/genai";
import { ApiError } from "../utils/apiError.js";

let client = null;

const getModel = () => process.env.GEMINI_MODEL || "gemini-3.5-flash";

const getClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new ApiError(
      503,
      "Gemini API key is not configured. Add GEMINI_API_KEY to backend .env file",
    );
  }
  if (!client) client = new GoogleGenAI({ apiKey });
  return client;
};

export const isAiConfigured = () => Boolean(process.env.GEMINI_API_KEY);

const generateJSON = async (prompt, schema) => {
  const ai = getClient();
  try {
    const response = await ai.models.generateContent({
      model: getModel(),
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
        temperature: 0.6,
      },
    });
    return JSON.parse(response.text);
  } catch (err) {
    console.error("Gemini JSON error:", err?.message || err);
    throw new ApiError(502, "AI request failed. Please try again later");
  }
};

export const generateText = async (prompt, temperature = 0.7) => {
  const ai = getClient();
  try {
    const response = await ai.models.generateContent({
      model: getModel(),
      contents: prompt,
      config: { temperature },
    });
    return response.text.trim();
  } catch (err) {
    console.error("Gemini text error:", err?.message || err);
    throw new ApiError(502, "AI request failed. Please try again later");
  }
};

export const generateLeadSummary = async (lead) => {
  const prompt = `You are an expert B2B sales analyst for a CRM called NTP CRM.
Analyse the following sales lead and produce a concise assessment.

Lead Details:
- Name: ${lead.name || "N/A"}
- Company: ${lead.company || "N/A"}
- Email: ${lead.email || "N/A"}
- Current pipeline stage: ${lead.status || "New"}
- Potential deal value: ${lead.value || 0}
- Source: ${lead.source || "Unknown"}
- Notes: ${lead.notes || "None"}

Return JSON only.`;

  const schema = {
    type: Type.OBJECT,
    properties: {
      summary: {
        type: Type.STRING,
        description: "2-3 sentence executive summary of the lead",
      },
      riskScore: {
        type: Type.INTEGER,
        description: "Risk of losing the deal, 0 (safe) to 100 (high risk)",
      },
      suggestedPriority: {
        type: Type.STRING,
        enum: ["Low", "Medium", "High"],
      },
      nextBestAction: {
        type: Type.STRING,
        description: "One concrete recommended next step",
      },
    },
    required: ["summary", "riskScore", "suggestedPriority", "nextBestAction"],
  };

  return generateJSON(prompt, schema);
};

export const generateEmail = async ({ lead, purpose, tone, sender }) => {
  const prompt = `You are a senior sales rep writing on behalf of ${sender?.name || "our team"}${sender?.company ? ` at ${sender.company}` : ""}.

Write a professional sales email.
Purpose: ${purpose || "follow up"}
Desired tone: ${tone || "friendly and professional"}

Recipient (lead) details:
- Name: ${lead.name || "N/A"}
- Company: ${lead.company || "N/A"}
- Pipeline stage: ${lead.status || "New"}
- Context/Notes: ${lead.notes || "None"}

Return JSON only with a compelling subject line and a complete email body.
Use line breaks (\\n) in the body. Keep it under 100 words.
Sign off as ${sender?.name || "The NTP CRM Team"}.`;

  const schema = {
    type: Type.OBJECT,
    properties: {
      subject: { type: Type.STRING },
      body: { type: Type.STRING },
    },
    required: ["subject", "body"],
  };

  return generateJSON(prompt, schema);
};

export const generateSalesInsights = async (pipelineStats) => {
  const prompt = `You are a revenue-operations advisor. Given a snapshot of a sales pipeline, identify what is working, what is at risk, and the corrective actions that would improve conversion.

Pipeline snapshot (JSON): ${JSON.stringify(pipelineStats, null, 2)}

Return JSON only.`;

  const schema = {
    type: Type.OBJECT,
    properties: {
      headline: {
        type: Type.STRING,
        description: "One-sentence summary of pipeline health",
      },
      insights: {
        type: Type.ARRAY,
        description: "3-5 specific, data-driven observations",
        items: { type: Type.STRING },
      },
      recommendations: {
        type: Type.ARRAY,
        description: "3-5 prioritized, actionable recommendations",
        items: { type: Type.STRING },
      },
      healthScore: {
        type: Type.INTEGER,
        description: "Overall pipeline health, 0-100",
      },
    },
    required: ["headline", "insights", "recommendations", "healthScore"],
  };

  return generateJSON(prompt, schema);
};