import { useEffect, useState } from "react";
import type { IconType } from "react-icons";
import { LuArrowRight, LuCircleCheck, LuCreditCard, LuHistory, LuLifeBuoy, LuPencil, LuStar } from "react-icons/lu";
import { apiRequest } from "../lib/api";
import { errorMessage } from "../lib/feedback";

type HistoryEvent = {
  id: string;
  at: string;
  kind: "milestone" | "change" | "payment" | "ticket" | "rating";
  title: string;
  actor?: string | null;
  details?: string | null;
  changes?: { field: string; from: string; to: string }[];
};

const KIND_ICONS: Record<HistoryEvent["kind"], IconType> = {
  milestone: LuCircleCheck,
  change: LuPencil,
  payment: LuCreditCard,
  ticket: LuLifeBuoy,
  rating: LuStar,
};

const formatWhen = (at: string) =>
  new Date(at).toLocaleString(undefined, { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

/** A record's own history (audit trail and milestones), loaded from `${path}`. */
function RecordHistory({ path, description }: { path: string; description: string }) {
  const [result, setResult] = useState<{ path: string; events?: HistoryEvent[]; error?: string } | null>(null);

  useEffect(() => {
    let active = true;
    apiRequest<HistoryEvent[]>(path)
      .then((events) => { if (active) setResult({ path, events }); })
      .catch((error) => { if (active) setResult({ path, error: errorMessage(error, "Unable to load the history.") }); });
    return () => { active = false; };
  }, [path]);

  const current = result?.path === path ? result : null;
  const events = current?.events ?? [];

  return (
    <section className="driver-cases detail-section">
      <div className="driver-cases-header">
        <div>
          <h3><LuHistory aria-hidden="true" /> History</h3>
          <p>{description}</p>
        </div>
        <span>{events.length} {events.length === 1 ? "event" : "events"}</span>
      </div>

      {!current ? (
        <p className="cases-empty">Loading history...</p>
      ) : current.error ? (
        <p className="file-upload-error" role="alert">{current.error}</p>
      ) : events.length === 0 ? (
        <p className="cases-empty">Nothing has been recorded for this record yet.</p>
      ) : (
        <ol className="history-timeline">
          {events.map((event) => {
            const Icon = KIND_ICONS[event.kind] ?? LuCircleCheck;
            return (
              <li className={`history-event history-${event.kind}`} key={event.id}>
                <span className="history-icon" aria-hidden="true"><Icon /></span>
                <div className="history-body">
                  <div className="history-title-row">
                    <strong>{event.title}</strong>
                    <time dateTime={event.at}>{formatWhen(event.at)}</time>
                  </div>
                  {(event.actor || event.details) && (
                    <span className="history-meta">{[event.actor, event.details].filter(Boolean).join(" · ")}</span>
                  )}
                  {event.changes && event.changes.length > 0 && (
                    <ul className="history-changes">
                      {event.changes.map((change) => (
                        <li key={change.field}>
                          <span className="history-field">{change.field}</span>
                          <span className="history-from">{change.from}</span>
                          <LuArrowRight aria-label="changed to" />
                          <span className="history-to">{change.to}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}

export default RecordHistory;
