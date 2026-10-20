import type { ReactNode } from "react";

type SectionedField = {
  type?: string;
  /** Section heading; file fields default to "Documents", everything else to "Details". */
  section?: string;
};

type FormSectionsProps<T extends SectionedField> = {
  fields: T[];
  renderField: (field: T) => ReactNode;
};

/** Lays out form fields in titled sections, in the order the sections first appear. */
function FormSections<T extends SectionedField>({ fields, renderField }: FormSectionsProps<T>) {
  const sections: { title: string; fields: T[] }[] = [];
  for (const field of fields) {
    const title = field.section ?? (field.type === "file" ? "Documents" : "Details");
    const section = sections.find((item) => item.title === title);
    if (section) section.fields.push(field);
    else sections.push({ title, fields: [field] });
  }

  return (
    <>
      {sections.map((section) => (
        <section className="form-section" key={section.title}>
          {sections.length > 1 && <h3 className="form-section-title">{section.title}</h3>}
          <div className="modal-form-grid">
            {section.fields.map(renderField)}
          </div>
        </section>
      ))}
    </>
  );
}

export default FormSections;
