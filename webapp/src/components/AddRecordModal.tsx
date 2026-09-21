import { useState } from "react";

type AddRecordField = {
  name: string;
  label: string;
  type?: "text" | "email" | "tel";
  placeholder?: string;
};

type AddRecordModalProps = {
  title: string;
  description: string;
  fields: AddRecordField[];
  onClose: () => void;
  onSubmit: (values: Record<string, string>) => void;
};

function AddRecordModal({
  title,
  description,
  fields,
  onClose,
  onSubmit,
}: AddRecordModalProps) {
  const [values, setValues] = useState<Record<string, string>>({});

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit(values);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <form
        className="role-modal"
        onClick={(event) => event.stopPropagation()}
        onSubmit={handleSubmit}
      >
        <div className="modal-header">
          <div>
            <h2>{title}</h2>
            <p>{description}</p>
          </div>

          <button className="modal-close" type="button" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="modal-body">
          {fields.map((field) => (
            <div className="form-group" key={field.name}>
              <label htmlFor={`add-${field.name}`}>{field.label}</label>
              <input
                id={`add-${field.name}`}
                type={field.type ?? "text"}
                value={values[field.name] ?? ""}
                onChange={(event) =>
                  setValues((current) => ({
                    ...current,
                    [field.name]: event.target.value,
                  }))
                }
                placeholder={field.placeholder}
                required
              />
            </div>
          ))}
        </div>

        <div className="modal-footer">
          <button className="secondary-btn" type="button" onClick={onClose}>
            Cancel
          </button>
          <button className="primary-btn" type="submit">
            Add {title.replace("Add New ", "")}
          </button>
        </div>
      </form>
    </div>
  );
}

export default AddRecordModal;
