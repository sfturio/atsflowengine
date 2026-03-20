const { clampScore, detectLanguage, normalizeText, unique } = require("../utils/text-utils");

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

const CORE_ATS_KEYWORDS = [
  "experience",
  "experiencia",
  "skills",
  "habilidades",
  "education",
  "formacao",
  "projects",
  "projetos",
  "results",
  "resultados",
  "api",
  "sql",
  "docker",
  "cloud",
  "aws",
  "azure",
  "kubernetes"
];

const I18N = {
  en: {
    denseParagraphs: "Dense paragraphs detected",
    excessiveUppercase: "Excessive uppercase usage",
    unusualSymbols: "Too many unusual symbols",
    tooShort: "Resume text is too short",
    tooLong: "Resume text appears overly long",
    lowSegmentation: "Low segmentation and poor visual structure",
    actionLanguage: "Action-oriented language",
    measurableOutcomes: "Measurable outcomes",
    stackCoverage: "Technical stack coverage",
    projectsPresent: "Projects section present",
    experienceContext: "Professional experience context",
    lowKeywordAlignment: "Low keyword alignment with ATS baseline",
    missingSectionsIssue: "Missing important resume sections",
    missingKeywordsIssue: "Missing relevant ATS keywords",
    addMissingKeywords: "Add missing ATS keywords in your resume content",
    createSkillsSection: "Create a dedicated skills section",
    includeAchievements: "Include measurable achievements and stronger action verbs",
    reduceDenseParagraphs: "Reduce dense paragraphs and split content into bullet points",
    improveHeadings: "Improve section headings for ATS parsing",
    tailorSummary: "Refine your summary to be more objective and role-specific",
    strong: "strong",
    moderate: "moderate",
    weak: "weak",
    critical: "critical",
    summaryTemplate:
      "Overall ATS readiness is {band} ({atsScore}/100). ATS keyword baseline is {keywordScore}/100, structure is {structureScore}/100, readability is {readabilityScore}/100. Prioritize keyword and structure fixes first for fastest gains."
  },
  pt: {
    denseParagraphs: "Paragrafos muito densos detectados",
    excessiveUppercase: "Uso excessivo de letras maiusculas",
    unusualSymbols: "Excesso de simbolos incomuns",
    tooShort: "Texto do curriculo muito curto",
    tooLong: "Texto do curriculo muito longo",
    lowSegmentation: "Baixa segmentacao e estrutura visual fraca",
    actionLanguage: "Linguagem orientada a acao",
    measurableOutcomes: "Resultados mensuraveis",
    stackCoverage: "Cobertura de stack tecnica",
    projectsPresent: "Secao de projetos presente",
    experienceContext: "Contexto de experiencia profissional",
    lowKeywordAlignment: "Baixo alinhamento com palavras-chave basicas de ATS",
    missingSectionsIssue: "Faltam secoes importantes no curriculo",
    missingKeywordsIssue: "Palavras-chave ATS relevantes ausentes",
    addMissingKeywords: "Adicione palavras-chave ATS ausentes no conteudo do curriculo",
    createSkillsSection: "Crie uma secao dedicada de habilidades",
    includeAchievements: "Inclua conquistas mensuraveis e verbos de acao mais fortes",
    reduceDenseParagraphs: "Reduza paragrafos densos e divida o conteudo em bullets",
    improveHeadings: "Melhore os titulos das secoes para facilitar o parsing ATS",
    tailorSummary: "Refine o resumo para ficar mais objetivo e alinhado ao cargo",
    strong: "forte",
    moderate: "moderado",
    weak: "fraco",
    critical: "critico",
    summaryTemplate:
      "A prontidao ATS geral esta {band} ({atsScore}/100). A base de palavras-chave ATS esta em {keywordScore}/100, estrutura em {structureScore}/100 e legibilidade em {readabilityScore}/100. Priorize primeiro ajustes de palavras-chave e estrutura para ganhos mais rapidos."
  }
};

function t(language, key) {
  return (I18N[language] || I18N.en)[key] || I18N.en[key] || key;
}

function analyzeKeywords(resumeText) {
  const extracted = CORE_ATS_KEYWORDS;
  const normalizedResume = normalizeText(resumeText);
  const found = [];
  const missing = [];

  for (const keyword of extracted) {
    const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const pattern = new RegExp(`(^|\\s)${escaped}(\\s|$)`, "i");
    if (pattern.test(normalizedResume)) found.push(keyword);
    else missing.push(keyword);
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

function analyzeReadability(resumeText, language) {
  const issues = [];
  const cleanText = resumeText || "";
  let score = 100;

  const paragraphs = cleanText.split(/\n\s*\n/).map((part) => part.trim()).filter(Boolean);
  const veryLongParagraphs = paragraphs.filter((paragraph) => paragraph.length > 600).length;
  if (veryLongParagraphs > 0) {
    score -= Math.min(25, veryLongParagraphs * 8);
    issues.push(t(language, "denseParagraphs"));
  }

  const letters = cleanText.match(/[A-Za-z]/g) || [];
  const uppercase = cleanText.match(/[A-Z]/g) || [];
  const upperRatio = letters.length ? uppercase.length / letters.length : 0;
  if (upperRatio > 0.28) {
    score -= 15;
    issues.push(t(language, "excessiveUppercase"));
  }

  const oddSymbols = cleanText.match(/[^\w\s.,;:!?@#+%()\-\/]/g) || [];
  const oddRatio = cleanText.length ? oddSymbols.length / cleanText.length : 0;
  if (oddRatio > 0.03) {
    score -= 12;
    issues.push(t(language, "unusualSymbols"));
  }

  if (cleanText.length < 450) {
    score -= 20;
    issues.push(t(language, "tooShort"));
  }

  if (cleanText.length > 14000) {
    score -= 10;
    issues.push(t(language, "tooLong"));
  }

  const segmentationSignals = cleanText.match(/\n|•|- |\d+\./g) || [];
  if (segmentationSignals.length < 8) {
    score -= 15;
    issues.push(t(language, "lowSegmentation"));
  }

  return { readabilityScore: clampScore(score), readabilityIssues: issues };
}

function analyzeContentStrength(resumeText, language) {
  const normalized = normalizeText(resumeText);
  let score = 0;
  const checks = [];

  const actionVerbMatches = ACTION_VERBS.filter((verb) => normalized.includes(verb)).length;
  if (actionVerbMatches > 0) {
    score += Math.min(30, actionVerbMatches * 5);
    checks.push(t(language, "actionLanguage"));
  }

  const metricMatches = resumeText.match(/\b\d+([.,]\d+)?\s?(%|k|m|ms|x)?\b/gi) || [];
  if (metricMatches.length > 0) {
    score += Math.min(25, metricMatches.length * 4);
    checks.push(t(language, "measurableOutcomes"));
  }

  const techStackMatches = TECH_TERMS.filter((term) => normalized.includes(term)).length;
  if (techStackMatches > 0) {
    score += Math.min(20, techStackMatches * 3);
    checks.push(t(language, "stackCoverage"));
  }

  if (/project|projeto/i.test(resumeText)) {
    score += 12;
    checks.push(t(language, "projectsPresent"));
  }

  if (/experience|experiencia|work history/i.test(resumeText)) {
    score += 13;
    checks.push(t(language, "experienceContext"));
  }

  return { contentStrengthScore: clampScore(score), contentSignals: checks };
}

function composeIssues({ language, keywordsMissing, readabilityIssues, keywordMatchScore, structureScore }) {
  const issues = [];
  if (keywordMatchScore < 60) issues.push(t(language, "lowKeywordAlignment"));
  if (structureScore < 70) issues.push(t(language, "missingSectionsIssue"));
  issues.push(...readabilityIssues);
  if (keywordsMissing.length > 0) {
    issues.push(`${t(language, "missingKeywordsIssue")}: ${keywordsMissing.slice(0, 8).join(", ")}`);
  }
  return unique(issues);
}

function generateSuggestions({ language, missingSections, keywordsMissing, readabilityIssues, contentStrengthScore }) {
  const suggestions = [];
  if (keywordsMissing.length) suggestions.push(t(language, "addMissingKeywords"));
  if (missingSections.includes("skills")) suggestions.push(t(language, "createSkillsSection"));
  if (contentStrengthScore < 60) suggestions.push(t(language, "includeAchievements"));
  if (readabilityIssues.some((item) => /dense|denso/i.test(item))) {
    suggestions.push(t(language, "reduceDenseParagraphs"));
  }
  if (missingSections.length > 0) suggestions.push(t(language, "improveHeadings"));
  suggestions.push(t(language, "tailorSummary"));
  return unique(suggestions).slice(0, 8);
}

function buildDeterministicSummary({ language, atsScore, keywordMatchScore, structureScore, readabilityScore }) {
  const band =
    atsScore >= 80
      ? t(language, "strong")
      : atsScore >= 60
      ? t(language, "moderate")
      : atsScore >= 40
      ? t(language, "weak")
      : t(language, "critical");

  return t(language, "summaryTemplate")
    .replace("{band}", band)
    .replace("{atsScore}", atsScore)
    .replace("{keywordScore}", keywordMatchScore)
    .replace("{structureScore}", structureScore)
    .replace("{readabilityScore}", readabilityScore);
}

function analyzeResume({ resumeText }) {
  const language = detectLanguage(resumeText);

  const keywordData = analyzeKeywords(resumeText);
  const structureData = analyzeStructure(resumeText);
  const readabilityData = analyzeReadability(resumeText, language);
  const contentData = analyzeContentStrength(resumeText, language);

  const atsScore = clampScore(
    keywordData.keywordMatchScore * 0.4 +
      structureData.structureScore * 0.25 +
      readabilityData.readabilityScore * 0.2 +
      contentData.contentStrengthScore * 0.15
  );

  const detectedIssues = composeIssues({
    language,
    keywordsMissing: keywordData.keywordsMissing,
    readabilityIssues: readabilityData.readabilityIssues,
    keywordMatchScore: keywordData.keywordMatchScore,
    structureScore: structureData.structureScore
  });

  const improvementSuggestions = generateSuggestions({
    language,
    missingSections: structureData.missingSections,
    keywordsMissing: keywordData.keywordsMissing,
    readabilityIssues: readabilityData.readabilityIssues,
    contentStrengthScore: contentData.contentStrengthScore
  });

  const shortFinalSummary = buildDeterministicSummary({
    language,
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
      language,
      presentSections: structureData.presentSections,
      missingSections: structureData.missingSections
    }
  };
}

module.exports = { analyzeResume };
