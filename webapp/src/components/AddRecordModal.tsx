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
  const [fileErrors, setFileErrors] = useState<Record<string, string>>({});
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

    const acceptsPdf = field.accept?.includes("application/pdf") ?? false;
    const isAcceptedFile = file.type.startsWith("image/") || (acceptsPdf && file.type === "application/pdf");
    if (!isAcceptedFile) {
      setFileErrors((current) => ({ ...current, [field.name]: acceptsPdf ? "Choose an image or PDF file." : "Choose an image file." }));
      setValues((current) => ({ ...current, [field.name]: "" }));
      event.currentTarget.value = "";
      return;
    }

    const maxSize = acceptsPdf ? 10 * 1024 * 1024 : 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setFileErrors((current) => ({ ...current, [field.name]: `Choose a file smaller than ${acceptsPdf ? "10" : "5"} MB.` }));
      setValues((current) => ({ ...current, [field.name]: "" }));
      event.currentTarget.value = "";
      return;
    }

    setFileErrors((current) => ({ ...current, [field.name]: "" }));
    setIsReadingFile(true);
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setValues((current) => ({ ...current, [field.name]: reader.result as string }));
      }
      setIsReadingFile(false);
    };
    reader.onerror = () => {
      setFileErrors((current) => ({ ...current, [field.name]: "The file could not be read. Please try another file." }));
      setIsReadingFile(false);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (Object.values(fileErrors).some(Boolean)) return;
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
                values[field.name].startsWith("data:image/") ? (
                  <img className="driver-photo-preview" src={values[field.name]} alt={`${field.label} preview`} />
                ) : (
                  <span>File uploaded</span>
                )
              )}
              {field.type === "file" && fileErrors[field.name] && <span className="file-upload-error" role="alert">{fileErrors[field.name]}</span>}
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
