import { useEffect, useState } from "react";

type FeedbackMessageProps = {
  message: string;
  tone?: "success" | "error";
};

function FeedbackMessage({ message, tone = "success" }: FeedbackMessageProps) {
  const [dismissedMessage, setDismissedMessage] = useState("");

  useEffect(() => {
    const timeout = window.setTimeout(() => setDismissedMessage(message), 5000);
    return () => window.clearTimeout(timeout);
  }, [message]);

  if (dismissedMessage === message) return null;

  return (
    <div className={`feedback-message ${tone}`} role={tone === "error" ? "alert" : "status"} aria-live={tone === "error" ? "assertive" : "polite"}>
      <span>{message}</span>
      <button type="button" className="feedback-dismiss" aria-label="Dismiss message" onClick={() => setDismissedMessage(message)}>
        ×
      </button>
    </div>
  );
}

export default FeedbackMessage;
