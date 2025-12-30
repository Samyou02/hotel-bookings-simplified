// apiClient.ts

const env = (typeof import.meta !== 'undefined' && (import.meta as unknown as { env?: Record<string, string> })?.env) || {} as Record<string, string>;
const primaryBase = env?.VITE_API_URL || env?.VITE_API_BASE || env?.FRONTEND_BASE_URL || '';
const originBase = (typeof window !== 'undefined' && window?.location?.origin) ? window.location.origin : '';
const base = (primaryBase && primaryBase.trim()) ? primaryBase : '';
try { console.info('[API] base:', base || '(same-origin)') } catch (_e) { void 0 }

export async function apiGet<T>(path: string): Promise<T> {
  const url = base ? `${base}${path}` : path;
  const res = await fetch(url);
  if (!res.ok) {
    let msg = ''
    try {
      const j = await res.json().catch(() => null) as unknown as { error?: string; message?: string } | null
      msg = (j?.error || j?.message || res.statusText || '').trim()
    } catch (_) { /* ignore */ }
    throw new Error(msg || `GET ${path} ${res.status}`)
  }
  return res.json() as Promise<T>;
}

export async function apiPost<T, B extends object>(path: string, body: B): Promise<T> {
  const url = base ? `${base}${path}` : path;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    let msg = ''
    try {
      const j = await res.json().catch(() => null) as unknown as { error?: string; message?: string } | null
      msg = (j?.error || j?.message || res.statusText || '').trim()
    } catch (_) { /* ignore */ }
    throw new Error(msg || `POST ${path} ${res.status}`)
  }
  return res.json() as Promise<T>;
}

export async function apiDelete<T = { status: string }>(path: string): Promise<T> {
  const url = base ? `${base}${path}` : path;
  const res = await fetch(url, { method: 'DELETE' });
  if (!res.ok) {
    let msg = ''
    try {
      const j = await res.json().catch(() => null) as unknown as { error?: string; message?: string } | null
      msg = (j?.error || j?.message || res.statusText || '').trim()
    } catch (_) { /* ignore */ }
    throw new Error(msg || `DELETE ${path} ${res.status}`)
  }
  return res.json() as Promise<T>;
}
