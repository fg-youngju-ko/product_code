CREATE TABLE IF NOT EXISTS codes (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  code       TEXT NOT NULL,
  proc       TEXT NOT NULL DEFAULT '',
  name       TEXT NOT NULL,
  note       TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_codes_code ON codes(code);

-- 품목별 사진 (codes.id 기준, 목록 조회를 가볍게 하려고 분리)
CREATE TABLE IF NOT EXISTS photos (
  code_id    INTEGER PRIMARY KEY,
  mime       TEXT NOT NULL,
  data       TEXT NOT NULL,           -- base64
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
