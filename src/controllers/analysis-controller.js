const { extractTextFromPdf } = require("../helpers/pdf-helper");
const { getAnalyses, getAnalysisById, runAnalysis } = require("../services/analysis-service");

function validateAnalyzeInput(body) {
  const resumeText = (body.resume_text || "").trim();

  if (resumeText.length < 30) {
    return { error: "resume_text must have at least 30 characters" };
  }

  return {
    data: {
      resumeText
    }
  };
}

async function analyzeText(req, res, next) {
  try {
    const { error, data } = validateAnalyzeInput(req.body);
    if (error) return res.status(400).json({ error });

    const result = await runAnalysis({ ...data, sourceType: "text" });
    return res.json(result);
  } catch (errorCaught) {
    return next(errorCaught);
  }
}

async function analyzePdf(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "resume_pdf is required" });
    }

    const resumeText = await extractTextFromPdf(req.file.buffer);
    const payload = { resume_text: resumeText };
    const { error, data } = validateAnalyzeInput(payload);
    if (error) return res.status(400).json({ error });

    const result = await runAnalysis({ ...data, sourceType: "pdf" });
    return res.json(result);
  } catch (errorCaught) {
    return next(errorCaught);
  }
}

async function listHistory(req, res, next) {
  try {
    const limitRaw = Number.parseInt(req.query.limit, 10);
    const limit = Number.isFinite(limitRaw) ? Math.min(Math.max(limitRaw, 1), 100) : 20;
    const rows = await getAnalyses(limit);
    return res.json(rows);
  } catch (errorCaught) {
    return next(errorCaught);
  }
}

async function getHistoryItem(req, res, next) {
  try {
    const result = await getAnalysisById(req.params.id);
    if (!result) {
      return res.status(404).json({ error: "Analysis not found" });
    }
    return res.json(result);
  } catch (errorCaught) {
    return next(errorCaught);
  }
}

async function getReport(req, res, next) {
  try {
    const result = await getAnalysisById(req.params.id);
    if (!result) {
      return res.status(404).json({ error: "Analysis not found" });
    }
    res.setHeader("Content-Type", "text/markdown; charset=utf-8");
    return res.send(result.markdownReport);
  } catch (errorCaught) {
    return next(errorCaught);
  }
}

module.exports = {
  analyzePdf,
  analyzeText,
  getHistoryItem,
  getReport,
  listHistory
};
