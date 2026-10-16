const baseUrl = import.meta.env.VITE_API_BASE_URL?.replace(/\/+$/, "");
const ACCESS_TOKEN_KEY = "workhorse.accessToken";
const REFRESH_TOKEN_KEY = "workhorse.refreshToken";
const LOGOUT_REASON_KEY = "workhorse.logoutReason";

export const SESSION_EXPIRED_MESSAGE = "Your session has expired. Please log in again.";

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
  sessionStorage.removeItem(LOGOUT_REASON_KEY);
}

function getAccessToken() {
  return sessionStorage.getItem(ACCESS_TOKEN_KEY);
}

export function hasStoredSession() {
  return Boolean(getAccessToken());
}

/** When the stored access token expires (ms since epoch), or null if there is none or it can't be read. */
export function getSessionExpiry(): number | null {
  const token = getAccessToken();
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
    return typeof payload.exp === "number" ? payload.exp * 1000 : null;
  } catch {
    return null;
  }
}

export function hasActiveSession() {
  if (!hasStoredSession()) return false;
  const expiry = getSessionExpiry();
  return expiry === null || expiry > Date.now();
}

/** Clear the expired session and leave a message for the login page. */
export function recordExpiredSession() {
  clearSession();
  sessionStorage.setItem(LOGOUT_REASON_KEY, SESSION_EXPIRED_MESSAGE);
}

/** Log the user out because their session expired, and send them to the login page. */
export function expireSession() {
  recordExpiredSession();
  if (window.location.pathname !== "/") window.location.replace("/");
}

/** Why the user was logged out, if it was automatic. Cleared on the next login. */
export function getLogoutReason() {
  return sessionStorage.getItem(LOGOUT_REASON_KEY) ?? "";
}

/** Turn an error response such as {"error": "...", "details": [...]} into a readable sentence. */
async function readErrorMessage(response: Response) {
  const fallback = response.status >= 500
    ? "The server ran into a problem. Please try again."
    : `Request failed (${response.status}).`;
  const text = await response.text();
  if (!text) return fallback;
  try {
    const body = JSON.parse(text) as { error?: unknown; message?: unknown; details?: unknown };
    const message = [body.error, body.message].find((value): value is string => typeof value === "string" && value.length > 0);
    const details = Array.isArray(body.details)
      ? body.details.map((detail) => typeof detail === "string" ? detail : (detail as { message?: string })?.message).filter(Boolean).join(" ")
      : typeof body.details === "string" ? body.details : "";
    return [message ?? fallback, details].filter(Boolean).join(" ");
  } catch {
    return text.length > 300 ? fallback : text;
  }
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
  if (accessToken) {
    if (!hasActiveSession()) {
      expireSession();
      throw new Error(SESSION_EXPIRED_MESSAGE);
    }
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  const response = await fetch(
    `${baseUrl}/${path.replace(/^\/+/, "")}`,
    { ...options, headers },
  );

  // A signed-in request that comes back unauthorised means the session is no longer valid.
  if (response.status === 401 && accessToken) {
    expireSession();
    throw new Error(SESSION_EXPIRED_MESSAGE);
  }

  if (!response.ok) {
    throw new Error(await readErrorMessage(response));
  }

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}
