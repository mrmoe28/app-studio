/// <reference types="node" />
const BAD_CHARS = /[\r\n\t]/;

export const mask = (v: string | undefined | null) => {
  if (!v) return "(unset)";
  const s = v.trim();
  if (s.length <= 8) return "***";
  return `${s.slice(0,4)}...${s.slice(-4)}`;
};

export function getCfg() {
  const rawKey = process.env.SHOTSTACK_API_KEY ?? "";
  const key = rawKey.trim();
  const host = (process.env.SHOTSTACK_HOST ?? "https://api.shotstack.io/stage").replace(/\/+$/,"");
  if (!key) throw new Error("SHOTSTACK_API_KEY is not set");
  if (BAD_CHARS.test(key) || /["'`]/.test(key)) throw new Error("SHOTSTACK_API_KEY has invalid characters");
  return { key, host };
}

export async function ssFetch(path: string, init: RequestInit & { json?: unknown } = {}) {
  const { key, host } = getCfg();
  const headers = new Headers(init.headers ?? {});
  headers.set("Content-Type", "application/json");
  headers.set("Accept", "application/json");
  headers.set("x-api-key", key);

  const url = `${host}${path.startsWith("/") ? path : `/${path}`}`;
  const body = init.json !== undefined ? JSON.stringify(init.json) : (init.body as BodyInit | null);
  return fetch(url, { ...init, headers, body, cache: "no-store" });
}

export function vErr(e: unknown) {
  const verbose = String(process.env.VERBOSE_ERRORS ?? "").toLowerCase() === "true";
  const msg = (e as any)?.message ?? "unknown error";
  return verbose ? { message: msg, stack: (e as any)?.stack } : { message: msg };
}
