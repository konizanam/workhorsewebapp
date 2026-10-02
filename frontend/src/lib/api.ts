const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api/v1";

type TokenResponse = {
  accessToken: string;
  refreshToken: string;
};

const ACCESS_TOKEN_KEY = "workhorse.accessToken";
const REFRESH_TOKEN_KEY = "workhorse.refreshToken";

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export function storeTokens(tokens: TokenResponse) {
  sessionStorage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken);
  sessionStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
}

export function clearSession() {
  sessionStorage.removeItem(ACCESS_TOKEN_KEY);
  sessionStorage.removeItem(REFRESH_TOKEN_KEY);
  sessionStorage.removeItem("workhorse.pendingToken");
}

export function getAccessToken() {
  return sessionStorage.getItem(ACCESS_TOKEN_KEY);
}

let refreshInFlight: Promise<boolean> | null = null;

async function refreshSession(): Promise<boolean> {
  const refreshToken = sessionStorage.getItem(REFRESH_TOKEN_KEY);
  if (!refreshToken) return false;

  if (!refreshInFlight) {
    refreshInFlight = fetch(`${API_BASE_URL}/auth/refresh-token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    })
      .then(async (response) => {
        if (!response.ok) return false;
        const tokens = (await response.json()) as TokenResponse;
        storeTokens(tokens);
        return true;
      })
      .catch(() => false)
      .finally(() => {
        refreshInFlight = null;
      });
  }

  return refreshInFlight;
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
  retry = true,
): Promise<T> {
  const headers = new Headers(options.headers);
  if (options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const token = getAccessToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });

  if (response.status === 401 && retry && (path === "/auth/me" || !path.startsWith("/auth/"))) {
    if (await refreshSession()) return apiRequest<T>(path, options, false);
    clearSession();
  }

  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as { error?: string };
    throw new ApiError(body.error || `Request failed (${response.status})`, response.status);
  }

  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

export function jsonBody(value: unknown) {
  return JSON.stringify(value);
}