import { useState } from "react";
import LocationAutocomplete from "./LocationAutocomplete";
import FileUpload from "./FileUpload";

type RecordField = {
  key: string;
  label: string;
  type?: "text" | "email" | "number" | "file" | "location";
  options?: string[];
  pattern?: string;
  title?: string;
  accept?: string;
  required?: boolean;
};

type RecordActionsModalProps = {
  title: string;
  values: Record<string, string>;
  fields: RecordField[];
  actions?: { label: string; onClick: () => void }[];
  onClose: () => void;
  onSave: (values: Record<string, string>) => void;
  isSaving?: boolean;
};

function RecordActionsModal({
  title,
  values,
  fields,
  actions = [],
  onClose,
  onSave,
  isSaving = false,
}: RecordActionsModalProps) {
  const [fileValues, setFileValues] = useState<Record<string, string>>({});
  const [fileErrors, setFileErrors] = useState<Record<string, string>>({});
  const hasFileError = Object.values(fileErrors).some(Boolean);
  const [isReadingFile, setIsReadingFile] = useState(false);

  const handleFileChange = (field: RecordField, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files?.[0];
    if (!file) return;
    const setFileError = (message: string) => setFileErrors((current) => ({ ...current, [field.key]: message }));

    const acceptsPdf = field.accept?.includes("application/pdf") ?? false;
    const isAcceptedFile = file.type.startsWith("image/") || (acceptsPdf && file.type === "application/pdf");
    if (!isAcceptedFile) {
      setFileError(acceptsPdf ? "Choose an image or PDF file." : "Choose an image file.");
      event.currentTarget.value = "";
      return;
    }

    const maxSize = acceptsPdf ? 10 * 1024 * 1024 : 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setFileError(`Choose a file smaller than ${acceptsPdf ? "10" : "5"} MB.`);
      event.currentTarget.value = "";
      return;
    }

    setFileError("");
    setIsReadingFile(true);
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setFileValues((current) => ({ ...current, [field.key]: reader.result as string }));
      }
      setIsReadingFile(false);
    };
    reader.onerror = () => {
      setFileError("The file could not be read. Please try another file.");
      setIsReadingFile(false);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (hasFileError) return;
    const formData = new FormData(event.currentTarget);
    const updatedValues = Object.fromEntries(formData.entries()) as Record<string, string>;
    for (const field of fields) {
      if (field.type === "file") {
        updatedValues[field.key] = fileValues[field.key] ?? values[field.key] ?? "";
      }
    }
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

        <div className="modal-body modal-form-grid">
          {fields.map((field) => (
            <div className="form-group" key={field.key}>
              <label htmlFor={`record-${field.key}`}>{field.label}</label>
              {field.options ? (
                <select id={`record-${field.key}`} name={field.key} defaultValue={values[field.key]}>
                  {field.options.map((option) => <option key={option}>{option}</option>)}
                </select>
              ) : field.type === "location" ? (
                <LocationAutocomplete
                  id={`record-${field.key}`}
                  name={field.key}
                  initialAddress={values[field.key] ?? ""}
                  initialLatitude={values[`${field.key} Latitude`]}
                  initialLongitude={values[`${field.key} Longitude`]}
                  initialPlaceId={values[`${field.key} Place ID`]}
                />
              ) : field.type === "file" ? (
                  <FileUpload
                    id={`record-${field.key}`}
                    name={field.key}
                    label={field.label}
                    accept={field.accept}
                    required={field.required ?? false}
                    value={fileValues[field.key] ?? values[field.key]}
                    error={fileErrors[field.key]}
                    onChange={(event) => handleFileChange(field, event)}
                  />
              ) : (
                <input id={`record-${field.key}`} name={field.key} type={field.type ?? "text"} defaultValue={values[field.key]} pattern={field.pattern} title={field.title} required={field.required ?? true} />
              )}
            </div>
          ))}
        </div>

        <div className="modal-footer">
          {actions.map((action) => (
            <button key={action.label} className="secondary-btn" type="button" onClick={action.onClick}>
              {action.label}
            </button>
          ))}
          <button className="primary-btn" type="submit" disabled={isReadingFile || hasFileError || isSaving}>
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default RecordActionsModal;
