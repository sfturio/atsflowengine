function buildMarkdownReport(result) {
  const labels = {
    title: "# Relatorio ATSFlow",
    ats: "Score ATS",
    keyword: "Score de aderencia de palavras-chave",
    structure: "Score de estrutura",
    readability: "Score de legibilidade",
    content: "Score de forca de conteudo",
    found: "## Palavras-chave encontradas",
    missing: "## Palavras-chave ausentes",
    issues: "## Problemas detectados",
    suggestions: "## Sugestoes de melhoria",
    summary: "## Resumo final",
    none: "- Nenhum"
  };

  const lines = [
    labels.title,
    "",
    `- ${labels.ats}: **${result.atsScore}/100**`,
    `- ${labels.keyword}: **${result.keywordMatchScore}/100**`,
    `- ${labels.structure}: **${result.structureScore}/100**`,
    `- ${labels.readability}: **${result.readabilityScore}/100**`,
    `- ${labels.content}: **${result.contentStrengthScore}/100**`,
    "",
    labels.found,
    ...(result.keywordsFound.length ? result.keywordsFound.map((item) => `- ${item}`) : [labels.none]),
    "",
    labels.missing,
    ...(result.keywordsMissing.length
      ? result.keywordsMissing.map((item) => `- ${item}`)
      : [labels.none]),
    "",
    labels.issues,
    ...buildIssueLines(result),
    "",
    labels.suggestions,
    ...buildSuggestionLines(result),
    "",
    labels.summary,
    result.shortFinalSummary
  ];
  return lines.join("\n");
}

function buildSuggestionLines(result) {
  const structured = Array.isArray(result.analysisSuggestions) ? result.analysisSuggestions : [];
  if (structured.length) {
    const lines = [];
    for (const item of structured) {
      lines.push(`- [${(item.priority || "low").toUpperCase()}] ${item.title} (${item.category || "Content"})`);
      lines.push(`  - Motivo: ${item.reason}`);
      lines.push(`  - Acao: ${item.action}`);
      if (item.example) lines.push(`  - Exemplo: ${item.example}`);
    }
    return lines;
  }

  const legacy = Array.isArray(result.improvementSuggestions) ? result.improvementSuggestions : [];
  return legacy.length ? legacy.map((item) => `- ${item}`) : ["- Nenhum"];
}

function buildIssueLines(result) {
  const structured = Array.isArray(result.detectedIssueInsights) ? result.detectedIssueInsights : [];
  if (structured.length) {
    const lines = [];
    for (const item of structured) {
      lines.push(`- [${(item.priority || "low").toUpperCase()}] ${item.title} (${item.category || "ATS"})`);
      lines.push(`  - Motivo: ${item.reason}`);
      lines.push(`  - Impacto: ${item.impact}`);
      lines.push(`  - Acao: ${item.action}`);
      if (item.evidence) lines.push(`  - Evidencia: ${item.evidence}`);
    }
    return lines;
  }

  const legacy = Array.isArray(result.detectedIssues) ? result.detectedIssues : [];
  return legacy.length ? legacy.map((item) => `- ${item}`) : ["- Nenhum"];
}

module.exports = { buildMarkdownReport };
