/// <reference types="node" />

const REQUIRED_HEADER = "x-api-key";

// Reject control chars / whitespace / quotes in header values.
function hasInvalidHeaderChars(v: string) {
  // Disallow non-printable, CR/LF, and any quotes/backticks/spaces
  // (Node HTTP is strict about \r\n and some separators).
  return /[\r\n\t]/.test(v) || /["'`]/.test(v) || /^\s|\s$/.test(v);
}

export function getShotstackConfig() {
  const rawKey = process.env.SHOTSTACK_API_KEY ?? "";
  const apiKey = rawKey.trim();
  const host =
    (process.env.SHOTSTACK_HOST ?? "https://api.shotstack.io/stage").replace(/\/+$/, "");

  if (!apiKey) {
    throw new Error("SHOTSTACK_API_KEY is not set");
  }
  if (hasInvalidHeaderChars(apiKey)) {
    throw new Error(
      `SHOTSTACK_API_KEY contains invalid characters for ${REQUIRED_HEADER} header`
    );
  }
  if (apiKey.length < 16) {
    // sanity check; real keys are longer
    throw new Error("SHOTSTACK_API_KEY appears too short");
  }

  return { apiKey, host };
}

export async function ssFetch(
  path: string,
  init: RequestInit & { json?: unknown } = {}
): Promise<Response> {
  const { apiKey, host } = getShotstackConfig();

  const headers = new Headers(init.headers ?? {});
  headers.set("Content-Type", "application/json");
  headers.set("Accept", "application/json");
  headers.set("x-api-key", apiKey);

  const url = `${host}${path.startsWith("/") ? path : `/${path}`}`;
  const body = init.json !== undefined ? JSON.stringify(init.json) : (init.body as BodyInit | null);

  return fetch(url, { ...init, headers, body, cache: "no-store" });
}

export async function maskKeyForLog() {
  try {
    const { apiKey } = getShotstackConfig();
    return apiKey.length <= 8 ? "***" : `${apiKey.slice(0, 4)}...${apiKey.slice(-4)}`;
  } catch {
    return "(unset)";
  }
}
