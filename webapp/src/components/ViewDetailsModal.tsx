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
          {Object.entries(details).map(([label, value]) => (
            <div className="detail-item" key={label}>
              <span>{label}</span>
              <strong>{value}</strong>
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
