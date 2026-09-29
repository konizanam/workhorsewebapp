import { useState } from "react";

type AddRecordField = {
  name: string;
  label: string;
  type?: "text" | "email" | "tel" | "file";
  placeholder?: string;
  pattern?: string;
  title?: string;
  accept?: string;
  required?: boolean;
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
  const [fileError, setFileError] = useState("");
  const [isReadingFile, setIsReadingFile] = useState(false);

  const handleFieldChange = (
    field: AddRecordField,
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    if (field.type !== "file") {
      setValues((current) => ({ ...current, [field.name]: event.target.value }));
      return;
    }

    const file = event.currentTarget.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setFileError("Choose an image file.");
      setValues((current) => ({ ...current, [field.name]: "" }));
      event.currentTarget.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setFileError("Choose an image smaller than 5 MB.");
      setValues((current) => ({ ...current, [field.name]: "" }));
      event.currentTarget.value = "";
      return;
    }

    setFileError("");
    setIsReadingFile(true);
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setValues((current) => ({ ...current, [field.name]: reader.result as string }));
      }
      setIsReadingFile(false);
    };
    reader.onerror = () => {
      setFileError("The image could not be read. Please try another file.");
      setIsReadingFile(false);
    };
    reader.readAsDataURL(file);
  };

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
                value={field.type === "file" ? undefined : values[field.name] ?? ""}
                onChange={(event) => handleFieldChange(field, event)}
                placeholder={field.placeholder}
                pattern={field.pattern}
                title={field.title}
                accept={field.accept}
                required={field.required ?? true}
              />
              {field.type === "file" && values[field.name] && (
                <img className="driver-photo-preview" src={values[field.name]} alt={`${field.label} preview`} />
              )}
              {field.type === "file" && fileError && <span className="file-upload-error" role="alert">{fileError}</span>}
            </div>
          ))}
        </div>

        <div className="modal-footer">
          <button className="secondary-btn" type="button" onClick={onClose}>
            Cancel
          </button>
          <button className="primary-btn" type="submit" disabled={isReadingFile}>
            Add {title.replace("Add New ", "")}
          </button>
        </div>
      </form>
    </div>
  );
}

export default AddRecordModal;
