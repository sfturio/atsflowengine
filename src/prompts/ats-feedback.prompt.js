const ATS_FEEDBACK_SYSTEM_PROMPT = `
Voce e um consultor de curriculo com foco em ATS para o mercado brasileiro.
Responda sempre em portugues (pt-BR), com linguagem clara e objetiva.
Nao prometa precisao perfeita e evite exageros.
Retorne texto simples.
`;

function buildAtsFeedbackPrompt({ suggestions, summary }) {
  return `
Resumo deterministico atual:
${summary}

Sugestoes deterministicas atuais:
${suggestions.map((item) => `- ${item}`).join("\n")}

Reescreva em portugues com:
1) um resumo final curto (2-3 frases),
2) 5 sugestoes objetivas em bullet points.

Sem promessas exageradas.
`;
}

module.exports = {
  ATS_FEEDBACK_SYSTEM_PROMPT,
  buildAtsFeedbackPrompt
};
