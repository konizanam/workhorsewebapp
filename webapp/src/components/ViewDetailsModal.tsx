import type { ReactNode } from "react";
import { useEffect, useState } from "react";

type ViewDetailsModalProps = {
  title: string;
  details: Record<string, string>;
  children?: ReactNode;
  onClose: () => void;
};

function ViewDetailsModal({ title, details, children, onClose }: ViewDetailsModalProps) {
  const [imagePreviewOpen, setImagePreviewOpen] = useState(false);

  useEffect(() => {
    if (!imagePreviewOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setImagePreviewOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [imagePreviewOpen]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="role-modal" onClick={(event) => event.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2>{title}</h2>
            <p>Record details</p>
          </div>
          <button className="modal-close" type="button" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="modal-body">
          <div className="details-grid">
            {details["Driver Image"] !== undefined && (
              <div className="driver-details-image">
                {details["Driver Image"] ? (
                  <button
                    className="driver-image-preview-trigger"
                    type="button"
                    aria-label={`View ${title}'s profile image`}
                    onClick={() => setImagePreviewOpen(true)}
                  >
                    <img className="driver-photo" src={details["Driver Image"]} alt={`${title} profile`} />
                  </button>
                ) : (
                  <span className="driver-photo-placeholder">
                    {(details.Name ?? title).split(" ").map((part) => part[0]).join("").slice(0, 2)}
                  </span>
                )}
              </div>
            )}
            {Object.entries(details).filter(([label]) => label !== "Driver Image").map(([label, value]) => (
              <div className="detail-item" key={label}>
                <span>{label}</span>
                {value.startsWith("data:") ? (
                  <a href={value} download={`${label.toLowerCase().replaceAll(" ", "-")}`} target="_blank" rel="noreferrer">View or download</a>
                ) : (
                  <strong>{value}</strong>
                )}
              </div>
            ))}
          </div>
        </div>

        {children && <div className="modal-body">{children}</div>}

        <div className="modal-footer">
          <button className="secondary-btn" type="button" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
      {imagePreviewOpen && details["Driver Image"] && (
        <div className="image-preview-overlay" role="dialog" aria-modal="true" aria-label={`${title} profile image`} onClick={() => setImagePreviewOpen(false)}>
          <button className="image-preview-close" type="button" aria-label="Close image preview" onClick={() => setImagePreviewOpen(false)}>×</button>
          <img src={details["Driver Image"]} alt={`${title} profile`} onClick={(event) => event.stopPropagation()} />
        </div>
      )}
    </div>
  );
}

export default ViewDetailsModal;
