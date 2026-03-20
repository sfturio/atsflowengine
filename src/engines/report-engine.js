function buildMarkdownReport(result) {
  const language = result?.metadata?.language === "pt" ? "pt" : "en";
  const labels =
    language === "pt"
      ? {
          title: "# Relatorio ATSFlow",
          ats: "ATS Score",
          keyword: "Keyword Match Score",
          structure: "Structure Score",
          readability: "Readability Score",
          content: "Content Strength Score",
          found: "## Palavras-chave encontradas",
          missing: "## Palavras-chave ausentes",
          issues: "## Problemas detectados",
          suggestions: "## Sugestoes de melhoria",
          summary: "## Resumo final",
          none: "- Nenhum"
        }
      : {
          title: "# ATSFlow Analysis Report",
          ats: "ATS Score",
          keyword: "Keyword Match Score",
          structure: "Structure Score",
          readability: "Readability Score",
          content: "Content Strength Score",
          found: "## Keywords Found",
          missing: "## Keywords Missing",
          issues: "## Detected Issues",
          suggestions: "## Improvement Suggestions",
          summary: "## Final Summary",
          none: "- None"
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
