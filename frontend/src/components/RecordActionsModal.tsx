import { useState } from "react";

type RecordField = {
  key: string;
  label: string;
  type?: "text" | "email" | "number";
  options?: string[];
};

type RecordActionsModalProps = {
  title: string;
  values: Record<string, string>;
  fields: RecordField[];
  actions?: { label: string; onClick: () => void; danger?: boolean }[];
  onClose: () => void;
  onSave: (values: Record<string, string>) => void;
};

function RecordActionsModal({
  title,
  values,
  fields,
  actions = [],
  onClose,
  onSave,
}: RecordActionsModalProps) {
  const [pendingAction, setPendingAction] = useState<{ label: string; onClick: () => void } | null>(null);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const updatedValues = Object.fromEntries(formData.entries()) as Record<string, string>;
    onSave({ ...values, ...updatedValues });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <form className="role-modal" onClick={(event) => event.stopPropagation()} onSubmit={handleSubmit}>
        <div className="modal-header">
          <div>
            <h2>{title}</h2>
            <p>Update this record and manage its status.</p>
          </div>
          <button className="modal-close" type="button" onClick={onClose}>×</button>
        </div>

        <div className="modal-body actions-form-grid">
          {fields.map((field) => (
            <div className="form-group" key={field.key}>
              <label htmlFor={`record-${field.key}`}>{field.label}</label>
              {field.options ? (
                <select id={`record-${field.key}`} name={field.key} defaultValue={values[field.key]}>
                  {field.options.map((option) => <option key={option}>{option}</option>)}
                </select>
              ) : (
                <input id={`record-${field.key}`} name={field.key} type={field.type ?? "text"} defaultValue={values[field.key]} required />
              )}
            </div>
          ))}
        </div>

        <div className="modal-footer">
          {actions.map((action) => (
            <button key={action.label} className={action.danger ? "delete-btn" : "secondary-btn"} type="button" onClick={() => action.danger ? setPendingAction(action) : action.onClick()}>
              {action.label}
            </button>
          ))}
          <button className="primary-btn" type="submit">Save Changes</button>
        </div>

        {pendingAction && (
          <div className="confirmation-panel">
            <strong>Are you sure you want to delete?</strong>
            <p>This action cannot be undone.</p>
            <div className="confirmation-actions">
              <button className="secondary-btn" type="button" onClick={() => setPendingAction(null)}>Cancel</button>
              <button className="delete-btn" type="button" onClick={() => { pendingAction.onClick(); setPendingAction(null); }}>Yes, Delete</button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}

export default RecordActionsModal;
