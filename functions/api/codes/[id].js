import { json } from "../../../lib/http.js";

// DELETE /api/codes/:id
export async function onRequestDelete({ params, env }) {
  const id = Number(params.id);
  if (!Number.isInteger(id)) return json({ error: '잘못된 ID' }, 400);
  const r = await env.DB.prepare('DELETE FROM codes WHERE id = ?').bind(id).run();
  return json({ deleted: r.meta.changes });
}
