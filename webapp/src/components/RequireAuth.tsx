import { useEffect } from "react";
import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import {
  expireSession,
  getSessionExpiry,
  hasActiveSession,
  hasStoredSession,
  recordExpiredSession,
} from "../lib/api";

/**
 * Shows the page only while the user has a valid session, and logs them out
 * automatically the moment their access token expires.
 */
function RequireAuth({ children }: { children: ReactNode }) {
  const signedIn = hasActiveSession();

  useEffect(() => {
    if (!signedIn) return;
    const expiry = getSessionExpiry();
    if (expiry === null) return;

    // Timers are capped at about 24.8 days; tokens are far shorter than that.
    const timer = window.setTimeout(expireSession, Math.min(Math.max(0, expiry - Date.now()), 2 ** 31 - 1));

    // Timers can be delayed while a tab sleeps, so check again when it becomes visible.
    const checkOnReturn = () => {
      if (document.visibilityState === "visible" && !hasActiveSession()) expireSession();
    };
    document.addEventListener("visibilitychange", checkOnReturn);

    return () => {
      window.clearTimeout(timer);
      document.removeEventListener("visibilitychange", checkOnReturn);
    };
  }, [signedIn]);

  if (!signedIn) {
    if (hasStoredSession()) recordExpiredSession();
    return <Navigate to="/" replace />;
  }

  return children;
}

export default RequireAuth;
