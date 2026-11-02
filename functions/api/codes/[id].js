import { json } from "../../../lib/http.js";
import { ensurePhotos } from "../../../lib/schema.js";

// DELETE /api/codes/:id
export async function onRequestDelete({ params, env }) {
  const id = Number(params.id);
  if (!Number.isInteger(id)) return json({ error: '잘못된 ID' }, 400);
  await ensurePhotos(env);
  const [r] = await env.DB.batch([
    env.DB.prepare('DELETE FROM codes WHERE id = ?').bind(id),
    env.DB.prepare('DELETE FROM photos WHERE code_id = ?').bind(id),
  ]);
  return json({ deleted: r.meta.changes });
}
