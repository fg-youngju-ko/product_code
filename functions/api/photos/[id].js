import { json } from '../../../lib/http.js';
import { ensurePhotos } from '../../../lib/schema.js';

const MAX_B64 = 1_500_000; // 약 1.1MB 이미지 (브라우저에서 축소 후 업로드)
const MIMES = ['image/jpeg', 'image/png', 'image/webp'];

function parseId(params) {
  const id = Number(params.id);
  return Number.isInteger(id) && id > 0 ? id : null;
}

// GET /api/photos/:id — 이미지 바이너리
export async function onRequestGet({ params, env }) {
  const id = parseId(params);
  if (!id) return json({ error: '잘못된 ID' }, 400);
  await ensurePhotos(env);
  const row = await env.DB.prepare('SELECT mime, data FROM photos WHERE code_id = ?').bind(id).first();
  if (!row) return json({ error: '사진 없음' }, 404);
  const bin = Uint8Array.from(atob(row.data), c => c.charCodeAt(0));
  // URL에 ?v=<updated_at>이 붙으므로 길게 캐시해도 변경 시 새로 받음
  return new Response(bin, { headers: { 'Content-Type': row.mime, 'Cache-Control': 'public, max-age=31536000, immutable' } });
}

// PUT /api/photos/:id — { data: "data:image/jpeg;base64,..." }
export async function onRequestPut({ params, request, env }) {
  const id = parseId(params);
  if (!id) return json({ error: '잘못된 ID' }, 400);
  await ensurePhotos(env);
  const body = await request.json().catch(() => ({}));
  const m = /^data:(image\/[a-z]+);base64,([A-Za-z0-9+/=]+)$/.exec(body.data || '');
  if (!m || !MIMES.includes(m[1])) return json({ error: 'JPEG/PNG/WEBP 이미지만 가능합니다' }, 400);
  if (m[2].length > MAX_B64) return json({ error: '이미지가 너무 큽니다' }, 400);
  const exists = await env.DB.prepare('SELECT 1 FROM codes WHERE id = ?').bind(id).first();
  if (!exists) return json({ error: '품목이 없습니다' }, 404);
  const r = await env.DB
    .prepare(`INSERT INTO photos (code_id, mime, data) VALUES (?, ?, ?)
              ON CONFLICT(code_id) DO UPDATE SET mime = excluded.mime, data = excluded.data, updated_at = datetime('now')
              RETURNING updated_at`)
    .bind(id, m[1], m[2])
    .first();
  return json({ photo_v: r.updated_at });
}

// DELETE /api/photos/:id
export async function onRequestDelete({ params, env }) {
  const id = parseId(params);
  if (!id) return json({ error: '잘못된 ID' }, 400);
  await ensurePhotos(env);
  const r = await env.DB.prepare('DELETE FROM photos WHERE code_id = ?').bind(id).run();
  return json({ deleted: r.meta.changes });
}
