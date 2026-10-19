CREATE TABLE IF NOT EXISTS codes (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  code       TEXT NOT NULL,
  proc       TEXT NOT NULL DEFAULT '',
  name       TEXT NOT NULL,
  note       TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_codes_code ON codes(code);
