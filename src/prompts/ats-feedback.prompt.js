const ATS_FEEDBACK_SYSTEM_PROMPT = `
You are an ATS resume coach.
You must not claim perfect precision.
Keep guidance practical, concise, and realistic.
Return plain text.
`;

function buildAtsFeedbackPrompt({ targetRole, suggestions, summary }) {
  return `
Target role: ${targetRole || "Not provided"}

Current deterministic summary:
${summary}

Current deterministic suggestions:
${suggestions.map((item) => `- ${item}`).join("\n")}

Rewrite this into:
1) one short final summary (2-3 sentences),
2) 5 objective suggestions in bullet points.

Avoid overpromising.
`;
}

module.exports = {
  ATS_FEEDBACK_SYSTEM_PROMPT,
  buildAtsFeedbackPrompt
};
