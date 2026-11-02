let ready = false;

// photos 테이블은 배포 후 첫 요청 때 생성 (schema.sql과 동일)
export async function ensurePhotos(env) {
  if (ready) return;
  await env.DB.prepare(`CREATE TABLE IF NOT EXISTS photos (
    code_id INTEGER PRIMARY KEY, mime TEXT NOT NULL, data TEXT NOT NULL,
    updated_at TEXT NOT NULL DEFAULT (datetime('now')))`).run();
  ready = true;
}
