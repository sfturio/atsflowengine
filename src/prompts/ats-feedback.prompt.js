const ATS_FEEDBACK_SYSTEM_PROMPT = `
You are an ATS resume coach.
You must not claim perfect precision.
Keep guidance practical, concise, and realistic.
Return plain text.
`;

function buildAtsFeedbackPrompt({ language = "en", suggestions, summary }) {
  if (language === "pt") {
    return `
Resumo deterministico atual:
${summary}

Sugestoes deterministicas atuais:
${suggestions.map((item) => `- ${item}`).join("\n")}

Reescreva isso em portugues com:
1) um resumo final curto (2-3 frases),
2) 5 sugestoes objetivas em bullet points.

Sem promessas exageradas.
`;
  }

  return `
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
