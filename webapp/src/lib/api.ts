const baseUrl = import.meta.env.VITE_API_BASE_URL?.replace(/\/+$/, "");
const ACCESS_TOKEN_KEY = "workhorse.accessToken";
const REFRESH_TOKEN_KEY = "workhorse.refreshToken";

type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

if (!baseUrl) {
  throw new Error("VITE_API_BASE_URL is not set");
}

export function storeTokens(tokens: AuthTokens) {
  sessionStorage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken);
  sessionStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
}

export function clearSession() {
  sessionStorage.removeItem(ACCESS_TOKEN_KEY);
  sessionStorage.removeItem(REFRESH_TOKEN_KEY);
  sessionStorage.removeItem("workhorse.pendingToken");
}

function getAccessToken() {
  return sessionStorage.getItem(ACCESS_TOKEN_KEY);
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const headers = new Headers(options.headers);

  if (options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  const accessToken = getAccessToken();
  if (accessToken) headers.set("Authorization", `Bearer ${accessToken}`);

  const response = await fetch(
    `${baseUrl}/${path.replace(/^\/+/, "")}`,
    { ...options, headers },
  );

  if (!response.ok) {
    throw new Error((await response.text()) || `Request failed (${response.status})`);
  }

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}