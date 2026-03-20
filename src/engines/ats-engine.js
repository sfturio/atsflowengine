const { clampScore, extractKeywords, normalizeText, unique } = require("../utils/text-utils");

const SECTION_PATTERNS = {
  summary: ["summary", "resumo", "perfil"],
  experience: ["experience", "experiencia", "work history"],
  skills: ["skills", "habilidades", "competencias"],
  education: ["education", "formacao", "academic"],
  projects: ["projects", "projetos", "portfolio"]
};

const ACTION_VERBS = [
  "built",
  "created",
  "designed",
  "developed",
  "improved",
  "implemented",
  "increased",
  "led",
  "optimized",
  "reduced",
  "automatizei",
  "constru",
  "desenvolv",
  "implementei",
  "melhorei",
  "otimizei",
  "reduzi"
];

const TECH_TERMS = [
  "node",
  "express",
  "javascript",
  "typescript",
  "react",
  "python",
  "sql",
  "postgres",
  "sqlite",
  "docker",
  "aws",
  "azure",
  "gcp",
  "api",
  "rest"
];

function analyzeKeywords(resumeText, jobDescription) {
  const extracted = extractKeywords(jobDescription);
  const normalizedResume = normalizeText(resumeText);
  const found = [];
  const missing = [];

  for (const keyword of extracted) {
    const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const pattern = new RegExp(`(^|\\s)${escaped}(\\s|$)`, "i");
    if (pattern.test(normalizedResume)) {
      found.push(keyword);
    } else {
      missing.push(keyword);
    }
  }

  const score = extracted.length ? (found.length / extracted.length) * 100 : 50;
  return {
    keywordsFound: unique(found),
    keywordsMissing: unique(missing),
    keywordMatchScore: clampScore(score)
  };
}

function analyzeStructure(resumeText) {
  const normalized = normalizeText(resumeText);
  const presentSections = [];
  const missingSections = [];

  for (const [sectionName, variants] of Object.entries(SECTION_PATTERNS)) {
    const found = variants.some((variant) => normalized.includes(variant));
    if (found) presentSections.push(sectionName);
    else missingSections.push(sectionName);
  }

  return {
    presentSections,
    missingSections,
    structureScore: clampScore((presentSections.length / Object.keys(SECTION_PATTERNS).length) * 100)
  };
}

function analyzeReadability(resumeText) {
  const issues = [];
  const cleanText = resumeText || "";
  let score = 100;

  const paragraphs = cleanText.split(/\n\s*\n/).map((part) => part.trim()).filter(Boolean);
  const veryLongParagraphs = paragraphs.filter((paragraph) => paragraph.length > 600).length;
  if (veryLongParagraphs > 0) {
    score -= Math.min(25, veryLongParagraphs * 8);
    issues.push("Dense paragraphs detected");
  }

  const letters = cleanText.match(/[A-Za-z]/g) || [];
  const uppercase = cleanText.match(/[A-Z]/g) || [];
  const upperRatio = letters.length ? uppercase.length / letters.length : 0;
  if (upperRatio > 0.28) {
    score -= 15;
    issues.push("Excessive uppercase usage");
  }

  const oddSymbols = cleanText.match(/[^\w\s.,;:!?@#+%()\-\/]/g) || [];
  const oddRatio = cleanText.length ? oddSymbols.length / cleanText.length : 0;
  if (oddRatio > 0.03) {
    score -= 12;
    issues.push("Too many unusual symbols");
  }

  if (cleanText.length < 450) {
    score -= 20;
    issues.push("Resume text is too short");
  }

  if (cleanText.length > 14000) {
    score -= 10;
    issues.push("Resume text appears overly long");
  }

  const segmentationSignals = cleanText.match(/\n|•|- |\d+\./g) || [];
  if (segmentationSignals.length < 8) {
    score -= 15;
    issues.push("Low segmentation and poor visual structure");
  }

  return { readabilityScore: clampScore(score), readabilityIssues: issues };
}

function analyzeContentStrength(resumeText) {
  const normalized = normalizeText(resumeText);
  let score = 0;
  const checks = [];

  const actionVerbMatches = ACTION_VERBS.filter((verb) => normalized.includes(verb)).length;
  if (actionVerbMatches > 0) {
    score += Math.min(30, actionVerbMatches * 5);
    checks.push("Action-oriented language");
  }

  const metricMatches = resumeText.match(/\b\d+([.,]\d+)?\s?(%|k|m|ms|x)?\b/gi) || [];
  if (metricMatches.length > 0) {
    score += Math.min(25, metricMatches.length * 4);
    checks.push("Measurable outcomes");
  }

  const techStackMatches = TECH_TERMS.filter((term) => normalized.includes(term)).length;
  if (techStackMatches > 0) {
    score += Math.min(20, techStackMatches * 3);
    checks.push("Technical stack coverage");
  }

  if (/project|projeto/i.test(resumeText)) {
    score += 12;
    checks.push("Projects section present");
  }

  if (/experience|experiencia|work history/i.test(resumeText)) {
    score += 13;
    checks.push("Professional experience context");
  }

  return { contentStrengthScore: clampScore(score), contentSignals: checks };
}

function composeIssues({
  keywordsMissing,
  missingSections,
  readabilityIssues,
  keywordMatchScore,
  structureScore
}) {
  const issues = [];
  if (keywordMatchScore < 60) issues.push("Low keyword alignment with job description");
  if (structureScore < 70) issues.push("Missing important resume sections");
  issues.push(...readabilityIssues);
  if (keywordsMissing.length > 0) {
    issues.push(`Missing relevant keywords: ${keywordsMissing.slice(0, 8).join(", ")}`);
  }
  return unique(issues);
}

function generateSuggestions({ missingSections, keywordsMissing, readabilityIssues, contentStrengthScore }) {
  const suggestions = [];
  if (keywordsMissing.length) suggestions.push("Add missing keywords from the job description");
  if (missingSections.includes("skills")) suggestions.push("Create a dedicated skills section");
  if (contentStrengthScore < 60) suggestions.push("Include measurable achievements and stronger action verbs");
  if (readabilityIssues.some((item) => item.toLowerCase().includes("dense"))) {
    suggestions.push("Reduce dense paragraphs and split content into bullet points");
  }
  if (missingSections.length > 0) suggestions.push("Improve section headings for ATS parsing");
  suggestions.push("Tailor the summary to the target role");
  return unique(suggestions).slice(0, 8);
}

function buildDeterministicSummary({ atsScore, keywordMatchScore, structureScore, readabilityScore }) {
  const band =
    atsScore >= 80 ? "strong" : atsScore >= 60 ? "moderate" : atsScore >= 40 ? "weak" : "critical";
  return `Overall ATS readiness is ${band} (${atsScore}/100). Keyword alignment is ${keywordMatchScore}/100, structure is ${structureScore}/100, readability is ${readabilityScore}/100. Use missing-keyword and structure fixes first for fastest gains.`;
}

function analyzeResume({ resumeText, jobDescription, targetRole }) {
  const keywordData = analyzeKeywords(resumeText, jobDescription);
  const structureData = analyzeStructure(resumeText);
  const readabilityData = analyzeReadability(resumeText);
  const contentData = analyzeContentStrength(resumeText);

  // Weighted ATS formula:
  // keyword_match_score: 40%
  // structure_score: 25%
  // readability_score: 20%
  // content_strength_score: 15%
  const atsScore = clampScore(
    keywordData.keywordMatchScore * 0.4 +
      structureData.structureScore * 0.25 +
      readabilityData.readabilityScore * 0.2 +
      contentData.contentStrengthScore * 0.15
  );

  const detectedIssues = composeIssues({
    keywordsMissing: keywordData.keywordsMissing,
    missingSections: structureData.missingSections,
    readabilityIssues: readabilityData.readabilityIssues,
    keywordMatchScore: keywordData.keywordMatchScore,
    structureScore: structureData.structureScore
  });

  const improvementSuggestions = generateSuggestions({
    missingSections: structureData.missingSections,
    keywordsMissing: keywordData.keywordsMissing,
    readabilityIssues: readabilityData.readabilityIssues,
    contentStrengthScore: contentData.contentStrengthScore
  });

  const shortFinalSummary = buildDeterministicSummary({
    atsScore,
    keywordMatchScore: keywordData.keywordMatchScore,
    structureScore: structureData.structureScore,
    readabilityScore: readabilityData.readabilityScore
  });

  return {
    atsScore,
    keywordMatchScore: keywordData.keywordMatchScore,
    structureScore: structureData.structureScore,
    readabilityScore: readabilityData.readabilityScore,
    contentStrengthScore: contentData.contentStrengthScore,
    keywordsFound: keywordData.keywordsFound,
    keywordsMissing: keywordData.keywordsMissing,
    detectedIssues,
    improvementSuggestions,
    shortFinalSummary,
    metadata: {
      presentSections: structureData.presentSections,
      missingSections: structureData.missingSections,
      role: targetRole || null
    }
  };
}

module.exports = { analyzeResume };
