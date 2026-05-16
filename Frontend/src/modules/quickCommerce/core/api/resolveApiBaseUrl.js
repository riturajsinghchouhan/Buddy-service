const DEFAULT_API_PATH = "/api/v1/qc";


function normalizeOrigin(origin) {
  return origin.replace(/\/+$/, "");
}

function ensureApiPath(pathname) {
  const normalized = pathname.replace(/\/+$/, "");
  if (!normalized || normalized === "/" || normalized === "/api") return DEFAULT_API_PATH;
  
  // If the path already includes our target base, return it
  if (normalized.includes(DEFAULT_API_PATH)) return normalized;
  
  // If it's a standard /api/v1 path, append /qc
  if (normalized === "/api/v1") return `${normalized}/qc`;
  
  // Fallback
  return normalized.includes("/api") ? normalized : `${normalized}${DEFAULT_API_PATH}`;
}

function buildLocalApiUrl(hostname) {
  const protocol = window.location.protocol || "http:";
  const port = window.location.port ? `:${window.location.port}` : "";
  return `${protocol}//${hostname}${port}${DEFAULT_API_PATH}`;
}


function parseEnvUrl(rawUrl) {
  if (!rawUrl) return null;
  try {
    const parsed = new URL(rawUrl, window.location.origin);
    return `${normalizeOrigin(parsed.origin)}${ensureApiPath(parsed.pathname)}`;
  } catch {
    return null;
  }
}

export function resolveApiBaseUrl() {
  const envUrl =
    parseEnvUrl(import.meta.env.VITE_API_URL) ||
    parseEnvUrl(import.meta.env.VITE_API_BASE_URL);

  const browserHostname = window.location.hostname;
  if (!envUrl) {
    const fallbackHost = browserHostname || "localhost";
    return buildLocalApiUrl(fallbackHost);
  }

  try {
    const parsed = new URL(envUrl);
    return `${normalizeOrigin(parsed.origin)}${ensureApiPath(parsed.pathname)}`;
  } catch {
    const fallbackHost = browserHostname || "localhost";
    return buildLocalApiUrl(fallbackHost);
  }
}

export function resolveSocketBaseUrl() {
  const explicitSocketUrl = import.meta.env.VITE_SOCKET_URL;
  if (explicitSocketUrl) {
    try {
      return new URL(explicitSocketUrl).origin;
    } catch {
      return explicitSocketUrl;
    }
  }
  
  const apiUrl = resolveApiBaseUrl();
  try {
    return new URL(apiUrl).origin;
  } catch {
    return apiUrl.split('/api')[0];
  }
}
