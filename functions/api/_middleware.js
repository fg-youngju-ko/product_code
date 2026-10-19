import { json } from "../../lib/http.js";

// 모든 /api 요청은 APP_PASSWORD(Cloudflare 시크릿)와 일치하는 Bearer 토큰이 있어야 함
async function sha256(s) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s));
  return new Uint8Array(buf);
}

async function safeEqual(a, b) {
  const [x, y] = await Promise.all([sha256(a), sha256(b)]);
  let diff = 0;
  for (let i = 0; i < x.length; i++) diff |= x[i] ^ y[i];
  return diff === 0;
}

export async function onRequest({ request, env, next }) {
  if (!env.APP_PASSWORD) return json({ error: '서버에 APP_PASSWORD가 설정되지 않았습니다' }, 500);
  const auth = request.headers.get('Authorization') || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  if (!token || !(await safeEqual(token, env.APP_PASSWORD))) {
    return json({ error: '인증 실패' }, 401);
  }
  const res = await next();
  res.headers.set('Cache-Control', 'no-store');
  return res;
}

