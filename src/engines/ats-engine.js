const { clampScore, normalizeText, unique } = require("../utils/text-utils");

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
  { label: "experiencia", aliases: ["experience", "experiencia"] },
  { label: "habilidades", aliases: ["skills", "habilidades", "competencias"] },
  { label: "formacao", aliases: ["education", "formacao", "academic"] },
  { label: "projetos", aliases: ["projects", "projetos", "portfolio"] },
  { label: "resultados", aliases: ["results", "resultados", "achievements"] },
  { label: "api", aliases: ["api", "apis"] },
  { label: "sql", aliases: ["sql"] },
  { label: "docker", aliases: ["docker"] },
  { label: "nuvem", aliases: ["cloud", "nuvem"] },
  { label: "aws", aliases: ["aws", "amazon web services"] },
  { label: "azure", aliases: ["azure"] },
  { label: "kubernetes", aliases: ["kubernetes", "k8s"] }
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
    weakExperienceIssue: "Experience descriptions are vague or low-impact",
    weakImpactIssue: "Few quantified achievements detected",
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
    weakExperienceIssue: "Descricoes de experiencia pouco especificas ou com baixo impacto",
    weakImpactIssue: "Poucas conquistas quantificadas no curriculo",
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
  const normalizedResume = normalizeText(resumeText);
  const found = [];
  const missing = [];

  for (const keyword of CORE_ATS_KEYWORDS) {
    const matched = keyword.aliases.some((alias) => {
      const escaped = alias.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const pattern = new RegExp(`(^|\\s)${escaped}(\\s|$)`, "i");
      return pattern.test(normalizedResume);
    });
    if (matched) found.push(keyword.label);
    else missing.push(keyword.label);
  }

  const score = CORE_ATS_KEYWORDS.length ? (found.length / CORE_ATS_KEYWORDS.length) * 100 : 50;
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

  return {
    contentStrengthScore: clampScore(score),
    contentSignals: checks,
    actionVerbMatches,
    metricMatchesCount: metricMatches.length,
    techStackMatches
  };
}

function buildIssue({ title, reason, impact, action, evidence, priority, category }) {
  return { title, reason, impact, action, ...(evidence ? { evidence } : {}), priority, category };
}

function buildSuggestion({ title, reason, action, example, priority, category }) {
  return { title, reason, action, ...(example ? { example } : {}), priority, category };
}

function pickPriorityFromScore(score) {
  if (score < 45) return "high";
  if (score < 70) return "medium";
  return "low";
}

function generateStructuredIssues({
  keywordMatchScore,
  keywordsMissing,
  structureScore,
  missingSections,
  readabilityScore,
  readabilityIssues,
  contentStrengthScore,
  actionVerbMatches,
  metricMatchesCount,
  atsScore
}) {
  const issues = [];

  if (keywordMatchScore < 60 || keywordsMissing.length > 0) {
    const topMissing = keywordsMissing.slice(0, 6);
    issues.push(
      buildIssue({
        title: "Baixo alinhamento com palavras-chave da vaga",
        reason: `Aderencia de palavras-chave em ${keywordMatchScore}/100 com termos ausentes: ${topMissing.join(", ")}.`,
        impact:
          "O ATS pode classificar seu curriculo abaixo de outros candidatos com termos tecnicos mais bem evidenciados.",
        action:
          "Reescreva bullets com tecnologia + contexto + resultado, incluindo as palavras-chave faltantes sem forcar repeticao.",
        evidence: topMissing.length ? `Principais lacunas detectadas: ${topMissing.join(", ")}.` : undefined,
        priority: pickPriorityFromScore(keywordMatchScore),
        category: "Skills"
      })
    );
  }

  if (structureScore < 70 || missingSections.length > 0) {
    issues.push(
      buildIssue({
        title: "Estrutura do curriculo dificulta o parsing ATS",
        reason: `Score de estrutura em ${structureScore}/100 com secoes ausentes: ${missingSections.join(", ")}.`,
        impact: "Sem secoes padronizadas, parte do historico pode ser lida de forma incompleta por filtros automatizados.",
        action:
          "Padronize secoes essenciais (Resumo, Experiencia, Habilidades, Educacao, Projetos) com cabecalhos claros e ordem logica.",
        priority: missingSections.length >= 2 ? "high" : "medium",
        category: "Structure"
      })
    );
  }

  if (readabilityScore < 70 || readabilityIssues.length > 0) {
    issues.push(
      buildIssue({
        title: "Risco de legibilidade para triagem automatica",
        reason:
          readabilityIssues.length > 0
            ? `Foram detectados sinais de leitura ruim: ${readabilityIssues.slice(0, 3).join("; ")}.`
            : `Legibilidade em ${readabilityScore}/100.`,
        impact: "Texto denso ou poluido reduz a extração correta de experiencias, skills e resultados.",
        action:
          "Quebre paragrafos longos, reduza simbolos incomuns e use bullets curtos com foco em acao e resultado.",
        priority: pickPriorityFromScore(readabilityScore),
        category: "ATS"
      })
    );
  }

  if (contentStrengthScore < 60 || actionVerbMatches === 0) {
    issues.push(
      buildIssue({
        title: "Descricoes de experiencia estao vagas",
        reason: `Forca de conteudo em ${contentStrengthScore}/100 e baixa presenca de verbos de acao (${actionVerbMatches}).`,
        impact:
          "Recrutadores e ATS identificam menos clareza sobre escopo tecnico, responsabilidade e nivel de senioridade.",
        action:
          "Reescreva experiencias com verbos de execucao no inicio e detalhe problema, stack utilizada e decisao tecnica.",
        priority: pickPriorityFromScore(contentStrengthScore),
        category: "Content"
      })
    );
  }

  if (metricMatchesCount === 0) {
    issues.push(
      buildIssue({
        title: "Falta de conquistas quantificadas",
        reason: "Nao foram encontradas metricas numericas (%, tempo, volume, custo) nas experiencias principais.",
        impact:
          "Sem numeros, o impacto das entregas fica subjetivo e reduz a percepcao de efetividade para recrutadores.",
        action:
          "Inclua ao menos 1 metrica por projeto relevante no formato: acao + contexto + resultado mensuravel.",
        priority: "high",
        category: "Impact"
      })
    );
  }

  if (issues.length === 0 || atsScore < 55) {
    const scoreDrivers = [
      { label: "keywords", value: keywordMatchScore },
      { label: "estrutura", value: structureScore },
      { label: "legibilidade", value: readabilityScore },
      { label: "conteudo", value: contentStrengthScore }
    ]
      .sort((a, b) => a.value - b.value)
      .slice(0, 2)
      .map((item) => `${item.label} (${item.value}/100)`);

    issues.push(
      buildIssue({
        title: "Score ATS pressionado pelos principais gaps atuais",
        reason: `Score ATS em ${atsScore}/100 com maiores limitadores em ${scoreDrivers.join(" e ")}.`,
        impact: "Esses gaps reduzem o match inicial e diminuem chance de avançar para entrevista.",
        action: "Priorize primeiro os dois menores scores e execute melhorias incrementais antes de reenviar o curriculo.",
        priority: pickPriorityFromScore(atsScore),
        category: "ATS"
      })
    );
  }

  const seen = new Set();
  const uniqueByTitle = [];
  for (const item of issues) {
    if (seen.has(item.title)) continue;
    seen.add(item.title);
    uniqueByTitle.push(item);
  }
  return uniqueByTitle;
}

function generateStructuredSuggestions({
  keywordsFound,
  keywordsMissing,
  keywordMatchScore,
  missingSections,
  readabilityIssues,
  structureScore,
  contentStrengthScore,
  actionVerbMatches,
  metricMatchesCount,
  readabilityScore,
  atsScore
}) {
  const suggestions = [];

  if (keywordsMissing.length > 0) {
    const topMissing = keywordsMissing.slice(0, 6);
    suggestions.push(
      buildSuggestion({
        title: "Adicionar palavras-chave tecnicas ausentes",
        reason: `O score de palavras-chave esta em ${keywordMatchScore}/100 e faltam termos importantes: ${topMissing.join(", ")}.`,
        action:
          "Inclua os termos ausentes em contexto real nas experiencias e projetos, descrevendo ferramenta + acao + resultado.",
        example:
          'Em vez de "Atuei em APIs", use "Desenvolvi APIs REST com Node.js e SQL para integrar pagamentos, reduzindo falhas em 22%".',
        priority: keywordsMissing.length >= 6 || keywordMatchScore < 55 ? "high" : "medium",
        category: "Skills"
      })
    );
  }

  if (keywordsFound.length < 5 || keywordMatchScore < 60) {
    suggestions.push(
      buildSuggestion({
        title: "Reforcar densidade de keywords com evidencias",
        reason: `Aderencia de keywords em ${keywordMatchScore}/100, com apenas ${keywordsFound.length} termos centrais detectados.`,
        action:
          "Distribua palavras-chave prioritarias em resumo, experiencia e projetos. Evite lista isolada e conecte cada termo a uma entrega concreta.",
        example:
          'Use bullets como: "Implementei pipeline CI/CD com Docker e GitHub Actions, acelerando deploy em 40%".',
        priority: pickPriorityFromScore(keywordMatchScore),
        category: "ATS"
      })
    );
  }

  if (missingSections.length > 0) {
    suggestions.push(
      buildSuggestion({
        title: "Corrigir estrutura de secoes para parsing ATS",
        reason: `Score de estrutura em ${structureScore}/100 com secoes ausentes: ${missingSections.join(", ")}.`,
        action:
          "Adicione cabecalhos claros e padronizados para as secoes faltantes (Resumo, Experiencia, Habilidades, Educacao, Projetos).",
        example:
          'Estruture com titulos simples: "Resumo", "Experiencia Profissional", "Habilidades Tecnicas", "Educacao".',
        priority: missingSections.length >= 2 ? "high" : "medium",
        category: "Structure"
      })
    );
  }

  if (readabilityIssues.length > 0 || readabilityScore < 70) {
    const readabilityDrivers = readabilityIssues.slice(0, 3).join("; ");
    suggestions.push(
      buildSuggestion({
        title: "Reduzir riscos de legibilidade para ATS",
        reason:
          readabilityDrivers.length > 0
            ? `Foram detectados riscos de leitura: ${readabilityDrivers}.`
            : `Legibilidade em ${readabilityScore}/100, abaixo do nivel recomendado.`,
        action:
          "Quebre blocos longos em bullets, mantenha frases curtas e remova simbolos incomuns para aumentar a extração automatica.",
        example:
          'Troque um paragrafo longo por 3 bullets: "acao", "tecnologia", "resultado".',
        priority: pickPriorityFromScore(readabilityScore),
        category: "ATS"
      })
    );
  }

  if (actionVerbMatches === 0 || contentStrengthScore < 60) {
    suggestions.push(
      buildSuggestion({
        title: "Tornar experiencias menos vagas e mais orientadas a execucao",
        reason: `Forca de conteudo em ${contentStrengthScore}/100 e baixa presenca de verbos de acao (${actionVerbMatches} detectados).`,
        action:
          "Reescreva bullets com verbos de execucao no inicio (desenvolvi, implementei, otimizei) e detalhe escopo tecnico.",
        example:
          'Em vez de "Responsavel por melhorias", use "Otimizei consultas SQL e reduzi tempo medio de resposta em 31%".',
        priority: pickPriorityFromScore(contentStrengthScore),
        category: "Content"
      })
    );
  }

  if (metricMatchesCount === 0) {
    suggestions.push(
      buildSuggestion({
        title: "Incluir resultados quantificados nas conquistas",
        reason: "Nao foram detectadas metricas numericas claras nos bullets de experiencia.",
        action: "Inclua percentuais, volume, tempo ou economia para cada entrega relevante.",
        example: 'Modelo: "Automatizei testes e reduzi retrabalho em 18%, com cobertura subindo para 82%".',
        priority: "high",
        category: "Impact"
      })
    );
  }

  if (atsScore < 70) {
    const scoreDrivers = [
      { label: "keywords", value: keywordMatchScore },
      { label: "estrutura", value: structureScore },
      { label: "legibilidade", value: readabilityScore },
      { label: "conteudo", value: contentStrengthScore }
    ]
      .sort((a, b) => a.value - b.value)
      .slice(0, 2)
      .map((item) => `${item.label} (${item.value}/100)`);

    suggestions.push(
      buildSuggestion({
        title: "Atacar os principais drivers do match score",
        reason: `Score ATS atual em ${atsScore}/100, puxado principalmente por: ${scoreDrivers.join(" e ")}.`,
        action:
          "Priorize as duas menores dimensoes primeiro e reavalie o curriculo apos os ajustes para medir ganho incremental.",
        priority: pickPriorityFromScore(atsScore),
        category: "ATS"
      })
    );
  }

  if (suggestions.length < 3) {
    suggestions.push(
      buildSuggestion({
        title: "Elevar alinhamento geral com a vaga alvo",
        reason: `Mesmo com boa base (${atsScore}/100), ainda existem oportunidades de otimizar match e clareza.`,
        action:
          "Adapte resumo e bullets ao cargo alvo com termos tecnicos e resultados mais especificos do contexto da vaga.",
        priority: "low",
        category: "Content"
      })
    );
  }

  const uniqueByTitle = [];
  const seen = new Set();
  for (const item of suggestions) {
    if (seen.has(item.title)) continue;
    seen.add(item.title);
    uniqueByTitle.push(item);
  }

  return uniqueByTitle;
}

function toLegacySuggestionList(structuredSuggestions) {
  return structuredSuggestions.map((item) => item.title);
}

function toLegacyIssueList(structuredIssues) {
  return structuredIssues.map((item) => item.title);
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
  const language = "pt";

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

  const detectedIssueInsights = generateStructuredIssues({
    keywordMatchScore: keywordData.keywordMatchScore,
    keywordsMissing: keywordData.keywordsMissing,
    structureScore: structureData.structureScore,
    missingSections: structureData.missingSections,
    readabilityScore: readabilityData.readabilityScore,
    readabilityIssues: readabilityData.readabilityIssues,
    contentStrengthScore: contentData.contentStrengthScore,
    actionVerbMatches: contentData.actionVerbMatches,
    metricMatchesCount: contentData.metricMatchesCount,
    atsScore
  });
  const detectedIssues = toLegacyIssueList(detectedIssueInsights);

  const analysisSuggestions = generateStructuredSuggestions({
    keywordsFound: keywordData.keywordsFound,
    keywordsMissing: keywordData.keywordsMissing,
    keywordMatchScore: keywordData.keywordMatchScore,
    missingSections: structureData.missingSections,
    readabilityIssues: readabilityData.readabilityIssues,
    structureScore: structureData.structureScore,
    readabilityScore: readabilityData.readabilityScore,
    contentStrengthScore: contentData.contentStrengthScore,
    actionVerbMatches: contentData.actionVerbMatches,
    metricMatchesCount: contentData.metricMatchesCount,
    atsScore
  });
  const improvementSuggestions = toLegacySuggestionList(analysisSuggestions);

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
    detectedIssueInsights,
    analysisSuggestions,
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
