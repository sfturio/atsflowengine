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
    ...(result.detectedIssues.length ? result.detectedIssues.map((item) => `- ${item}`) : [labels.none]),
    "",
    labels.suggestions,
    ...(result.improvementSuggestions.length
      ? result.improvementSuggestions.map((item) => `- ${item}`)
      : [labels.none]),
    "",
    labels.summary,
    result.shortFinalSummary
  ];
  return lines.join("\n");
}

module.exports = { buildMarkdownReport };
