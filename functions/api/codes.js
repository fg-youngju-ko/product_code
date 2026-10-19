import { json } from "../../lib/http.js";

const clean = (v, max = 200) => String(v ?? '').trim().slice(0, max);

function toRow(r) {
  const row = Array.isArray(r)
    ? { code: r[0], proc: r[1], name: r[2], note: r[3] }
    : { code: r?.code, proc: r?.proc, name: r?.name, note: r?.note };
  return {
    code: clean(row.code, 64).toUpperCase(),
    proc: clean(row.proc, 32).toUpperCase(),
    name: clean(row.name),
    note: clean(row.note),
  };
}

// GET /api/codes — 전체 목록
export async function onRequestGet({ env }) {
  const { results } = await env.DB
    .prepare('SELECT id, code, proc, name, note FROM codes ORDER BY code, id')
    .all();
  return json(results);
}

// POST /api/codes — 1건 추가
export async function onRequestPost({ request, env }) {
  const row = toRow(await request.json().catch(() => ({})));
  if (!row.code || !row.name) return json({ error: '품목코드와 단품명칭은 필수입니다' }, 400);
  const r = await env.DB
    .prepare('INSERT INTO codes (code, proc, name, note) VALUES (?, ?, ?, ?) RETURNING id, code, proc, name, note')
    .bind(row.code, row.proc, row.name, row.note)
    .first();
  return json(r, 201);
}

// PUT /api/codes — 전체 교체 (가져오기)
export async function onRequestPut({ request, env }) {
  const body = await request.json().catch(() => null);
  if (!Array.isArray(body)) return json({ error: '배열 형식이어야 합니다' }, 400);
  if (body.length > 20000) return json({ error: '항목이 너무 많습니다' }, 400);
  const rows = body.map(toRow).filter(r => r.code && r.name);
  const ins = env.DB.prepare('INSERT INTO codes (code, proc, name, note) VALUES (?, ?, ?, ?)');
  await env.DB.batch([
    env.DB.prepare('DELETE FROM codes'),
    ...rows.map(r => ins.bind(r.code, r.proc, r.name, r.note)),
  ]);
  return json({ count: rows.length });
}
