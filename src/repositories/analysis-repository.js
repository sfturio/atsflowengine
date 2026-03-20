const { randomUUID } = require("crypto");
const { db } = require("../config/database");

async function initAnalysisRepository() {
  const ddl = `
    CREATE TABLE IF NOT EXISTS analyses (
      id TEXT PRIMARY KEY,
      created_at TEXT NOT NULL,
      source_type TEXT NOT NULL,
      target_role TEXT,
      payload_json TEXT NOT NULL
    )
  `;

  if (db.isPostgres) {
    await db.pool.query(ddl);
  } else {
    db.sqlite.exec(ddl);
  }
}

async function saveAnalysis(result, sourceType = "text", targetRole = null) {
  const id = randomUUID();
  const createdAt = new Date().toISOString();
  const payloadJson = JSON.stringify(result);

  if (db.isPostgres) {
    await db.pool.query(
      `INSERT INTO analyses (id, created_at, source_type, target_role, payload_json)
       VALUES ($1, $2, $3, $4, $5)`,
      [id, createdAt, sourceType, targetRole, payloadJson]
    );
  } else {
    db.sqlite
      .prepare(
        `INSERT INTO analyses (id, created_at, source_type, target_role, payload_json)
         VALUES (?, ?, ?, ?, ?)`
      )
      .run(id, createdAt, sourceType, targetRole, payloadJson);
  }

  return id;
}

async function listAnalyses(limit = 20) {
  let rows = [];
  if (db.isPostgres) {
    const result = await db.pool.query(
      `SELECT id, created_at, source_type, target_role
       FROM analyses
       ORDER BY created_at DESC
       LIMIT $1`,
      [limit]
    );
    rows = result.rows;
  } else {
    rows = db.sqlite
      .prepare(
        `SELECT id, created_at, source_type, target_role
         FROM analyses
         ORDER BY created_at DESC
         LIMIT ?`
      )
      .all(limit);
  }
  return rows.map((row) => ({
    analysisId: row.id,
    createdAt: row.created_at,
    sourceType: row.source_type,
    targetRole: row.target_role
  }));
}

async function getAnalysisById(id) {
  let row = null;
  if (db.isPostgres) {
    const result = await db.pool.query(`SELECT * FROM analyses WHERE id = $1`, [id]);
    row = result.rows[0] || null;
  } else {
    row = db.sqlite.prepare(`SELECT * FROM analyses WHERE id = ?`).get(id) || null;
  }
  if (!row) return null;

  return {
    analysisId: row.id,
    createdAt: row.created_at,
    sourceType: row.source_type,
    targetRole: row.target_role,
    ...JSON.parse(row.payload_json)
  };
}

module.exports = {
  getAnalysisById,
  initAnalysisRepository,
  listAnalyses,
  saveAnalysis
};
