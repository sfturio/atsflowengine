function buildMarkdownReport(result) {
  const lines = [
    "# ATSFlow Analysis Report",
    "",
    `- ATS Score: **${result.atsScore}/100**`,
    `- Keyword Match Score: **${result.keywordMatchScore}/100**`,
    `- Structure Score: **${result.structureScore}/100**`,
    `- Readability Score: **${result.readabilityScore}/100**`,
    `- Content Strength Score: **${result.contentStrengthScore}/100**`,
    "",
    "## Keywords Found",
    ...(result.keywordsFound.length ? result.keywordsFound.map((item) => `- ${item}`) : ["- None"]),
    "",
    "## Keywords Missing",
    ...(result.keywordsMissing.length
      ? result.keywordsMissing.map((item) => `- ${item}`)
      : ["- None"]),
    "",
    "## Detected Issues",
    ...(result.detectedIssues.length ? result.detectedIssues.map((item) => `- ${item}`) : ["- None"]),
    "",
    "## Improvement Suggestions",
    ...(result.improvementSuggestions.length
      ? result.improvementSuggestions.map((item) => `- ${item}`)
      : ["- None"]),
    "",
    "## Final Summary",
    result.shortFinalSummary
  ];
  return lines.join("\n");
}

module.exports = { buildMarkdownReport };
