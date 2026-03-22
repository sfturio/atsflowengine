const ATS_FEEDBACK_SYSTEM_PROMPT = `
Voce e um consultor de curriculo com foco em ATS para o mercado brasileiro.
Responda em portugues (pt-BR) por padrao, com linguagem clara e objetiva.
Entenda termos e palavras-chave em ingles no curriculo e na vaga.
Mantenha termos tecnicos em ingles quando forem mais naturais (ex.: backend, deploy, REST API, Docker, Kubernetes).
Se a vaga estiver majoritariamente em ingles, voce pode responder partes em ingles para manter aderencia ao contexto.
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
Se o contexto da vaga estiver claramente em ingles, pode usar ingles nas partes tecnicas mantendo clareza.

Sem promessas exageradas.
`;
}

module.exports = {
  ATS_FEEDBACK_SYSTEM_PROMPT,
  buildAtsFeedbackPrompt
};
