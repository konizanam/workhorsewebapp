import { useEffect, useRef } from "react";
import type { IconType } from "react-icons";
import { FiAlertTriangle, FiCheckCircle, FiInfo, FiX, FiXCircle } from "react-icons/fi";
import type { FeedbackTone } from "../lib/feedback";

type FeedbackMessageProps = {
  message: string;
  tone?: FeedbackTone;
  /** Shows a close button; success and info messages also close on their own after a few seconds. */
  onDismiss?: () => void;
};

const TONES: Record<FeedbackTone, { title: string; icon: IconType }> = {
  success: { title: "Success", icon: FiCheckCircle },
  error: { title: "Error", icon: FiXCircle },
  warning: { title: "Warning", icon: FiAlertTriangle },
  info: { title: "Information", icon: FiInfo },
};

const AUTO_HIDE_MS = 6000;

/** An in-page message banner, coloured by its tone. */
function FeedbackMessage({ message, tone = "info", onDismiss }: FeedbackMessageProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { title, icon: Icon } = TONES[tone];
  const isUrgent = tone === "error" || tone === "warning";

  // Bring errors and warnings into view so they are not missed below the fold.
  useEffect(() => {
    if (isUrgent) ref.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [isUrgent, message]);

  useEffect(() => {
    if (!onDismiss || isUrgent) return;
    const timeout = window.setTimeout(onDismiss, AUTO_HIDE_MS);
    return () => window.clearTimeout(timeout);
  }, [onDismiss, isUrgent, message]);

  return (
    <div
      ref={ref}
      className={`feedback-message ${tone}`}
      role={isUrgent ? "alert" : "status"}
      aria-live={isUrgent ? "assertive" : "polite"}
    >
      <Icon className="feedback-icon" aria-hidden="true" />
      <div className="feedback-text">
        <strong>{title}</strong>
        <span>{message}</span>
      </div>
      {onDismiss && (
        <button type="button" className="feedback-dismiss" aria-label="Dismiss message" onClick={onDismiss}>
          <FiX aria-hidden="true" />
        </button>
      )}
    </div>
  );
}

export default FeedbackMessage;
