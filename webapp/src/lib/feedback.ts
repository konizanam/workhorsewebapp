import { useMemo, useState } from "react";

export type FeedbackTone = "success" | "error" | "warning" | "info";

export type Feedback = {
  id: number;
  tone: FeedbackTone;
  message: string;
};

/** A readable message from anything thrown, falling back when there is none. */
export function errorMessage(error: unknown, fallback = "Something went wrong. Please try again.") {
  if (error instanceof Error && error.message) return error.message;
  if (typeof error === "string" && error) return error;
  return fallback;
}

/**
 * The page's current success, error, warning or info message.
 *
 *   const { feedback, notify } = useFeedback();
 *   notify.success("Saved.");
 *   notify.error(error, "Unable to save.");
 */
export function useFeedback() {
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  const notify = useMemo(() => {
    const show = (tone: FeedbackTone, message: string) => setFeedback({ id: Date.now(), tone, message });
    return {
      success: (message: string) => show("success", message),
      info: (message: string) => show("info", message),
      warning: (message: string) => show("warning", message),
      error: (error: unknown, fallback?: string) => show("error", errorMessage(error, fallback)),
      clear: () => setFeedback(null),
    };
  }, []);

  return { feedback, notify };
}
