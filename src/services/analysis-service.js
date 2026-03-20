const { analyzeResume } = require("../engines/ats-engine");
const { buildMarkdownReport } = require("../engines/report-engine");
const {
  getAnalysisById,
  listAnalyses,
  saveAnalysis
} = require("../repositories/analysis-repository");
const { generateText } = require("../lib/llm");
const {
  ATS_FEEDBACK_SYSTEM_PROMPT,
  buildAtsFeedbackPrompt
} = require("../prompts/ats-feedback.prompt");

function applyLlmAssist(baseResult, llmText) {
  if (!llmText) return baseResult;
  const lines = llmText
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((line) => !/^#{1,6}\s/.test(line))
    .filter((line) => !/^(\*\*)?(final summary|resumo final)[:\s]*(\*\*)?$/i.test(line));
  if (!lines.length) return baseResult;

  const firstSentenceCandidate = lines.find(
    (line) =>
      !line.startsWith("-") &&
      line.length > 20 &&
      !/rewritten version|current assessment|summary[:]?$|versao reescrita|avaliacao atual|resumo[:]?$/i.test(
        line
      )
  );
  const firstSentence = firstSentenceCandidate || baseResult.shortFinalSummary;
  const bulletSuggestions = lines
    .filter((line) => line.startsWith("-"))
    .map((line) => line.replace(/^-+\s*/, ""))
    .slice(0, 5);

  return {
    ...baseResult,
    shortFinalSummary: firstSentence,
    improvementSuggestions: bulletSuggestions.length
      ? bulletSuggestions
      : baseResult.improvementSuggestions
  };
}

async function runAnalysis({ resumeText, sourceType }) {
  const deterministic = analyzeResume({ resumeText });
  let finalResult = deterministic;

  const llmResponse = await generateText({
    systemPrompt: ATS_FEEDBACK_SYSTEM_PROMPT,
    userPrompt: buildAtsFeedbackPrompt({
      language: deterministic?.metadata?.language || "en",
      suggestions: deterministic.improvementSuggestions,
      summary: deterministic.shortFinalSummary
    }),
    temperature: 0.2,
    maxTokens: 400
  });

  finalResult = applyLlmAssist(deterministic, llmResponse.text);
  finalResult.markdownReport = buildMarkdownReport(finalResult);
  finalResult.llm = {
    provider: llmResponse.provider,
    model: llmResponse.model
  };

  const analysisId = await saveAnalysis(finalResult, sourceType, null);
  return getAnalysisById(analysisId);
}

async function getAnalyses(limit = 20) {
  return listAnalyses(limit);
}

module.exports = {
  getAnalyses,
  getAnalysisById,
  runAnalysis
};
