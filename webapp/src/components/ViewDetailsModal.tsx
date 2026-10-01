type ViewDetailsModalProps = {
  title: string;
  details: Record<string, string>;
  onClose: () => void;
};

function ViewDetailsModal({ title, details, onClose }: ViewDetailsModalProps) {
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

        <div className="modal-body details-grid">
          {details["Driver Image"] !== undefined && (
            <div className="driver-details-image">
              {details["Driver Image"] ? (
                <img className="driver-photo" src={details["Driver Image"]} alt={`${title} profile`} />
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

        <div className="modal-footer">
          <button className="secondary-btn" type="button" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default ViewDetailsModal;
