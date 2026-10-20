import { useState } from "react";
import type { ChangeEvent } from "react";
import { FiFileText, FiUploadCloud } from "react-icons/fi";

type FileUploadProps = {
  id: string;
  name?: string;
  label: string;
  accept?: string;
  required?: boolean;
  /** The current file as a data URL, used for the preview. */
  value?: string;
  error?: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
};

/**
 * A drop zone for a single file. The real file input covers the whole zone,
 * so clicking, dragging a file onto it and keyboard use all work natively.
 */
function FileUpload({ id, name, label, accept, required = false, value, error, onChange }: FileUploadProps) {
  const [fileName, setFileName] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  const acceptsPdf = accept?.includes("application/pdf") ?? false;
  const hint = acceptsPdf ? "PNG, JPG or PDF, up to 10 MB" : "PNG or JPG, up to 5 MB";
  const isImage = value?.startsWith("data:image/") || (value?.startsWith("http") ?? false);
  const isPdf = value?.startsWith("data:application/pdf") ?? false;

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const input = event.currentTarget;
    onChange(event);
    // The parent clears the input when it rejects a file, so read the name afterwards.
    setFileName(input.files?.[0]?.name ?? "");
    setIsDragging(false);
  };

  const classes = [
    "file-upload",
    isDragging && "is-dragging",
    value && "has-file",
    error && "has-error",
  ].filter(Boolean).join(" ");

  return (
    <>
      <div className={classes}>
        <input
          id={id}
          name={name}
          type="file"
          accept={accept}
          required={required && !value}
          aria-describedby={`${id}-hint`}
          onChange={handleChange}
          onDragEnter={() => setIsDragging(true)}
          onDragLeave={() => setIsDragging(false)}
          onDrop={() => setIsDragging(false)}
        />

        <span className="file-upload-preview" aria-hidden="true">
          {isImage ? <img src={value} alt="" /> : isPdf ? <FiFileText /> : <FiUploadCloud />}
        </span>

        <span className="file-upload-text">
          <strong>{fileName || (value ? `${label} uploaded` : "Click or drag a file here")}</strong>
          <span id={`${id}-hint`}>{hint}</span>
        </span>

        <span className="file-upload-action" aria-hidden="true">{value ? "Replace" : "Browse"}</span>
      </div>
      {error && <span className="file-upload-error" role="alert">{error}</span>}
    </>
  );
}

export default FileUpload;
