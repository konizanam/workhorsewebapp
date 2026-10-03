import "../App.css";
import { useEffect, useState } from "react";
import AdminSidebar from "../components/AdminSidebar";
import AddRecordModal from "../components/AddRecordModal";
import ViewDetailsModal from "../components/ViewDetailsModal";
import RecordActionsModal from "../components/RecordActionsModal";
import FeedbackMessage from "../components/FeedbackMessage";
import TablePagination from "../components/TablePagination";
import { apiRequest } from "../lib/api";

const caseStatuses = ["Under Review", "Resolved", "Cancelled", "In Violation"] as const;

type DriverCase = {
  id: string;
  driverEmail: string;
  customer: string;
  report: string;
  reportedOn: string;
  status: typeof caseStatuses[number];
};

type DriverApiRecord = {
  user_id: string;
  first_name?: string | null;
  last_name?: string | null;
  email: string;
  phone_number?: string | null;
  profile_image_data?: string | null;
  rating?: number | null;
  availability_status?: string | null;
  onboarding_status?: string | null;
  "Driver's License Number"?: string | null;
  "Car's License Plate"?: string | null;
  Availability?: string | null;
  Status?: string | null;
};

type ApiDriverCase = {
  case_id: string;
  driver_id: string;
  reporter: string;
  reporter_email?: string;
  reason: string;
  status: "open" | "resolved" | "cancelled" | "in_violation";
  created_at: string;
};

type ApiDriverDocument = {
  document_id: string;
  document_type: "id" | "driver_license" | "car_registration";
  document_data_url?: string | null;
  document_url?: string | null;
  content_type?: string | null;
  verification_status: string;
  uploaded_at: string;
};

const driverDocumentLabels: Record<ApiDriverDocument["document_type"], string> = {
  id: "Certified Copy of ID",
  driver_license: "Certified Copy of Driver License",
  car_registration: "Certified Copy of Car Registration",
};

const createPdfBlobUrl = (dataUrl: string, contentType: string) => {
  const separator = dataUrl.indexOf(",");
  if (separator < 0) throw new Error("The saved PDF document is not valid.");
  const binary = window.atob(dataUrl.slice(separator + 1).replace(/\s/g, ""));
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
  return URL.createObjectURL(new Blob([bytes], { type: contentType }));
};

const mapDriverCase = (item: ApiDriverCase): DriverCase => ({
  id: item.case_id,
  driverEmail: item.reporter_email ?? "",
  customer: item.reporter ?? item.reporter_email ?? "Unknown",
  report: item.reason,
  reportedOn: new Date(item.created_at).toLocaleString(),
  status: item.status === "open"
    ? "Under Review"
    : item.status === "resolved"
      ? "Resolved"
      : item.status === "cancelled"
        ? "Cancelled"
        : "In Violation",
});

type DriverListResponse = {
  data: DriverApiRecord[];
};

const mapDriver = (driver: DriverApiRecord): Record<string, string> => ({
  ID: driver.user_id,
  Name: [driver.first_name, driver.last_name].filter(Boolean).join(" "),
  Email: driver.email,
  Phone: driver.phone_number ?? "",
  "Driver's License Number": driver["Driver's License Number"] ?? "",
  "Car's License Plate": driver["Car's License Plate"] ?? "",
  "Driver Image": driver.profile_image_data ?? "",
  "ID Certified Copy": "",
  "Driver License Certified Copy": "",
  "Car Registration Certified Copy": "",
  Rating: driver.rating == null ? "Not rated" : String(driver.rating),
  Availability: driver.Availability ?? (driver.availability_status === "online" ? "Available" : "Unavailable"),
  Status: driver.Status ?? driver.onboarding_status ?? "Submitted",
});

function Drivers() {
  const [showModal, setShowModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState<Record<string, string> | null>(null);
  const [actionDriver, setActionDriver] = useState<Record<string, string> | null>(null);
  const [feedback, setFeedback] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [driverRows, setDriverRows] = useState<Record<string, string>[]>([]);
  const [caseRows, setCaseRows] = useState<DriverCase[]>([]);
  const [driverDocuments, setDriverDocuments] = useState<Record<string, ApiDriverDocument[]>>({});
  const [documentPreview, setDocumentPreview] = useState<ApiDriverDocument | null>(null);
  const [documentPreviewUrl, setDocumentPreviewUrl] = useState("");

  useEffect(() => {
    const previewUrl = documentPreviewUrl;
    return () => {
      if (previewUrl.startsWith("blob:")) URL.revokeObjectURL(previewUrl);
    };
  }, [documentPreviewUrl]);

  useEffect(() => {
    const loadDrivers = async () => {
      try {
        const response = await apiRequest<DriverListResponse>("/drivers?limit=100");
        setDriverRows((response.data ?? []).map(mapDriver));
      } catch (error) {
        setFeedback(error instanceof Error ? error.message : "Unable to load drivers.");
      }
    };

    void loadDrivers();
  }, []);

  useEffect(() => {
    const driverId = selectedDriver?.ID;
    if (!driverId) return;

    const loadCases = async () => {
      try {
        const response = await apiRequest<ApiDriverCase[]>(`/drivers/${driverId}/cases`);
        setCaseRows((current) => [
          ...current.filter((item) => item.driverEmail !== selectedDriver.Email),
          ...(response ?? []).map(mapDriverCase).map((item) => ({ ...item, driverEmail: selectedDriver.Email })),
        ]);
      } catch (error) {
        setFeedback(error instanceof Error ? error.message : "Unable to load driver cases.");
      }
    };

    void loadCases();
  }, [selectedDriver]);

  useEffect(() => {
    const driverId = selectedDriver?.ID;
    if (!driverId) return;
    let active = true;

    const loadDocuments = async () => {
      try {
        const response = await apiRequest<ApiDriverDocument[]>(`/drivers/${driverId}/documents`);
        if (active) setDriverDocuments((current) => ({ ...current, [driverId]: response ?? [] }));
      } catch (error) {
        if (active) setFeedback(error instanceof Error ? error.message : "Unable to load driver documents.");
      }
    };

    void loadDocuments();
    return () => { active = false; };
  }, [selectedDriver]);

  const filteredDrivers = driverRows.filter((driver) =>
    Object.entries(driver)
      .filter(([key]) => key !== "Driver Image")
      .map(([, value]) => value)
      .join(" ")
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.max(1, Math.ceil(filteredDrivers.length / pageSize));
  const currentPage = Math.min(page, totalPages);

  const addDriver = async (values: Record<string, string>) => {
    setIsSaving(true);
    setFeedback("");
    try {
      const created = await apiRequest<DriverApiRecord>("/drivers", {
        method: "POST",
        body: JSON.stringify(values),
      });
      const row = mapDriver({
        ...created,
        first_name: created.first_name ?? values.name.trim().split(/\s+/)[0],
        last_name: created.last_name ?? values.name.trim().split(/\s+/).slice(1).join(" "),
        phone_number: created.phone_number ?? values.phone,
        profile_image_data: created.profile_image_data ?? values.image,
        "Driver's License Number": created["Driver's License Number"] ?? values.license,
        "Car's License Plate": created["Car's License Plate"] ?? values.carLicensePlate,
      });
      setDriverRows((current) => [row, ...current]);
      setPage(1);
      setSearchTerm("");
      setShowModal(false);
      setFeedback(`${values.name} was saved successfully.`);
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Unable to save the driver.");
    } finally {
      setIsSaving(false);
    }
  };

  const toggleDriverStatus = async () => {
    if (!actionDriver) return;
    const availability = actionDriver.Availability === "Disabled" ? "Available" : "Disabled";
    if (availability === "Available" && caseRows.some((report) => report.driverEmail === actionDriver.Email && report.status === "In Violation")) {
      setFeedback(`${actionDriver.Name} cannot be enabled while a case is In Violation.`);
      setActionDriver(null);
      return;
    }
    try {
      const updated = await apiRequest<DriverApiRecord>(`/drivers/${actionDriver.ID}`, {
        method: "PUT",
        body: JSON.stringify({ Availability: availability }),
      });
      const row = mapDriver({ ...updated, email: updated.email ?? actionDriver.Email });
      setDriverRows((current) => current.map((driver) => driver.ID === actionDriver.ID ? { ...driver, ...row } : driver));
      setFeedback(`${actionDriver.Name} ${availability === "Disabled" ? "disabled" : "enabled"}.`);
      setActionDriver(null);
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Unable to update driver status.");
    }
  };

  const updateCaseStatus = async (caseId: string, status: typeof caseStatuses[number]) => {
    const report = caseRows.find((item) => item.id === caseId);
    if (!report) return;

    const apiStatus = status === "Under Review" ? "open" : status.toLowerCase().replace(/\s+/g, "_");
    try {
      const updated = await apiRequest<ApiDriverCase>(`/drivers/${selectedDriver?.ID}/cases/${caseId}`, {
        method: "PUT",
        body: JSON.stringify({ status: apiStatus }),
      });
      const updatedCase = mapDriverCase(updated);
      setCaseRows((current) => current.map((item) => item.id === caseId ? { ...updatedCase, driverEmail: report.driverEmail } : item));
      if (status === "In Violation") {
        setDriverRows((current) => current.map((item) =>
          item.Email === report.driverEmail ? { ...item, Availability: "Disabled", Status: "Disabled" } : item
        ));
      }
      setFeedback(status === "In Violation" ? "Driver disabled after the case was marked In Violation." : `Case ${caseId} was updated.`);
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Unable to update the driver case.");
    }
  };

  const saveDriver = async (values: Record<string, string>) => {
    if (!actionDriver) return;
    try {
      const updated = await apiRequest<DriverApiRecord>(`/drivers/${actionDriver.ID}`, {
        method: "PUT",
        body: JSON.stringify(values),
      });
      const row = mapDriver({ ...updated, email: updated.email ?? actionDriver.Email });
      setDriverRows((current) => current.map((driver) => driver.ID === actionDriver.ID ? { ...driver, ...row } : driver));
      setFeedback(`${row.Name} was saved.`);
      setActionDriver(null);
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Unable to update the driver.");
    }
  };

  const viewDriverDocument = (document: ApiDriverDocument) => {
    const source = document.document_data_url ?? document.document_url ?? "";
    if (!source) {
      setFeedback("This document has no stored file data.");
      return;
    }

    const contentType = document.content_type ?? (source.startsWith("data:application/pdf") ? "application/pdf" : "");
    try {
      const previewUrl = contentType === "application/pdf" && source.startsWith("data:")
        ? createPdfBlobUrl(source, contentType)
        : source;
      setDocumentPreview(document);
      setDocumentPreviewUrl(previewUrl);
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Unable to open this document.");
    }
  };

  return (
    <div className="admin-page">

      <AdminSidebar />

      <div className="admin-content">

        {feedback && <FeedbackMessage message={feedback} />}

        {/* Header */}
        <div className="admin-header">

          <div>
            <h1>Drivers</h1>
            <p>Manage registered drivers and their status.</p>
          </div>

        </div>


        {/* Drivers Table */}
        <div className="users-section">

          <div className="users-section-header">

            <h2>All Drivers</h2>

          </div>

          <div className="table-toolbar">
            <input
              type="text"
              className="table-search-input"
              placeholder="Search drivers..."
              value={searchTerm}
              onChange={(event) => {
                setSearchTerm(event.target.value);
                setPage(1);
              }}
            />
            <button className="btn" onClick={() => setShowModal(true)}>+ Add Driver</button>
          </div>


          <TablePagination page={currentPage} pageSize={pageSize} totalRecords={filteredDrivers.length} onPageChange={setPage} onPageSizeChange={(size) => { setPageSize(size); setPage(1); }} />

          <div className="table-container">

            <table className="users-table">

              <thead>

                <tr>
                  <th>Image</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Driver's License Number</th>
                  <th>Car's License Plate</th>
                  <th>Rating</th>
                  <th>Availability</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>

              </thead>


              <tbody>

                {filteredDrivers.slice((currentPage - 1) * pageSize, currentPage * pageSize).map((driver) => (
                  <tr key={driver.Email}>
                    <td>
                      {driver["Driver Image"] ? (
                        <img className="driver-photo" src={driver["Driver Image"]} alt={`${driver.Name} profile`} />
                      ) : (
                        <span className="driver-photo-placeholder" aria-label={`${driver.Name} has no image`}>
                          {driver.Name.split(" ").map((part) => part[0]).join("").slice(0, 2)}
                        </span>
                      )}
                    </td>
                    <td>{driver.Name}</td>
                    <td>{driver.Email}</td>
                    <td>{driver.Phone}</td>
                    <td>{driver["Driver's License Number"]}</td>
                    <td>{driver["Car's License Plate"]}</td>
                    <td>{driver.Rating}</td>
                    <td>
                      <span className={`status ${driver.Availability === "Available" ? "active" : driver.Availability === "Disabled" ? "rejected" : "pending"}`}>
                        {driver.Availability}
                      </span>
                    </td>
                    <td><span className={`status ${driver.Status.toLowerCase()}`}>{driver.Status}</span></td>
                    <td>
                      <div className="table-actions"><button className="action-btn" onClick={() => setSelectedDriver(driver)}>View</button><button className="action-btn" onClick={() => setActionDriver(driver)}>Edit</button></div>
                    </td>
                  </tr>
                ))}

              </tbody>

            </table>

          </div>

          <TablePagination page={currentPage} pageSize={pageSize} totalRecords={filteredDrivers.length} onPageChange={setPage} onPageSizeChange={(size) => { setPageSize(size); setPage(1); }} />

        </div>

      </div>

      {showModal && (
        <AddRecordModal
          title="Add New Driver"
          description="Enter the details for the new driver."
          fields={[
            { name: "name", label: "Full Name", placeholder: "e.g. Alex Morgan" },
            { name: "email", label: "Email Address", type: "email", placeholder: "alex@example.com" },
            { name: "phone", label: "Phone Number", type: "tel", placeholder: "0812345678" },
            { name: "license", label: "Driver's License Number", placeholder: "Enter driver's license number" },
            { name: "carLicensePlate", label: "Car's License Plate", placeholder: "Enter car's license plate" },
            { name: "image", label: "Driver Image", type: "file", accept: "image/*", required: false },
            { name: "idCopy", label: "Certified Copy of ID", type: "file", accept: "image/*,application/pdf", required: false },
            { name: "driverLicenseCopy", label: "Certified Copy of Driver License", type: "file", accept: "image/*,application/pdf", required: false },
            { name: "carRegistrationCopy", label: "Certified Copy of Car Registration", type: "file", accept: "image/*,application/pdf", required: false },
          ]}
          onClose={() => setShowModal(false)}
          onSubmit={addDriver}
          isSubmitting={isSaving}
        />
      )}

      {selectedDriver && (
        (() => {
          const driver = driverRows.find((item) => item.Email === selectedDriver.Email) ?? selectedDriver;
          const driverCases = caseRows.filter((report) => report.driverEmail === driver.Email);
          const documents = driverDocuments[driver.ID] ?? [];
          const hasViolation = driverCases.some((report) => report.status === "In Violation");
          const appealSubject = encodeURIComponent("Appeal your driver account restriction");
          const appealBody = encodeURIComponent(`Hello ${driver.Name},\n\nYour account has been disabled following a customer report reviewed as a violation. Please reply to this email to submit an appeal.\n\nCase(s): ${driverCases.filter((report) => report.status === "In Violation").map((report) => report.id).join(", ")}\n\nWorkhorse Support`);

          return (
            <ViewDetailsModal
              title={driver.Name}
              details={Object.fromEntries(Object.entries(driver).filter(([label]) => ![
                "ID Certified Copy",
                "Driver License Certified Copy",
                "Car Registration Certified Copy",
              ].includes(label)))}
              onClose={() => {
                setSelectedDriver(null);
                setDocumentPreview(null);
                setDocumentPreviewUrl("");
              }}
            >
              <section className="driver-cases driver-documents-section">
                <div className="driver-cases-header">
                  <div>
                    <h3>Documents</h3>
                    <p>Uploaded driver documents and verification status.</p>
                  </div>
                  <span>{documents.length} {documents.length === 1 ? "document" : "documents"}</span>
                </div>
                {documents.length > 0 ? (
                  <div className="driver-documents-grid">
                    {documents.map((document) => {
                      const url = document.document_data_url ?? document.document_url ?? "";
                      const contentType = document.content_type ?? url.slice(5, url.indexOf(";"));
                      return (
                        <div className="driver-document-item" key={document.document_id}>
                          <strong>{driverDocumentLabels[document.document_type]}</strong>
                          <span>{document.verification_status.replaceAll("_", " ")}</span>
                          {contentType.startsWith("image/") ? (
                            <img className="driver-document-preview" src={url} alt={driverDocumentLabels[document.document_type]} />
                          ) : (
                            <span>PDF document</span>
                          )}
                          <button className="action-btn" type="button" onClick={() => viewDriverDocument(document)}>View</button>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="cases-empty">No documents have been uploaded for this driver.</p>
                )}
                {documentPreview && documents.some((document) => document.document_id === documentPreview.document_id) && (
                  <div className="driver-document-viewer">
                    <div className="driver-cases-header">
                      <strong>{driverDocumentLabels[documentPreview.document_type]}</strong>
                      <button className="action-btn" type="button" onClick={() => {
                        setDocumentPreview(null);
                        setDocumentPreviewUrl("");
                      }}>Close preview</button>
                    </div>
                    {(documentPreview.content_type ?? documentPreviewUrl).startsWith("image/") || documentPreviewUrl.startsWith("data:image/") ? (
                      <img className="driver-document-full-image" src={documentPreviewUrl} alt={driverDocumentLabels[documentPreview.document_type]} />
                    ) : (
                      <iframe className="driver-document-pdf" src={documentPreviewUrl} title={driverDocumentLabels[documentPreview.document_type]} />
                    )}
                  </div>
                )}
              </section>

              <section className="driver-cases">
                <div className="driver-cases-header">
                  <div>
                    <h3>Cases</h3>
                    <p>Customer reports linked to this driver.</p>
                  </div>
                  <span>{driverCases.length} {driverCases.length === 1 ? "report" : "reports"}</span>
                </div>

                {hasViolation && (
                  <div className="case-violation-notice" role="alert">
                    <strong>Driver disabled: violation under review.</strong>
                    <span>Send an appeal notice to {driver.Email}.</span>
                    <a href={`mailto:${driver.Email}?subject=${appealSubject}&body=${appealBody}`}>Prepare appeal email</a>
                  </div>
                )}

                {driverCases.length > 0 ? (
                  <div className="table-container">
                    <table className="users-table cases-table">
                      <thead>
                        <tr><th>Case</th><th>Customer</th><th>Report</th><th>Reported</th><th>Status</th></tr>
                      </thead>
                      <tbody>
                        {driverCases.map((report) => (
                          <tr key={report.id}>
                            <td>{report.id}</td>
                            <td>{report.customer}</td>
                            <td>{report.report}</td>
                            <td>{report.reportedOn}</td>
                            <td>
                              <select
                                aria-label={`Status for ${report.id}`}
                                className="case-status-select"
                                value={report.status}
                                onChange={(event) => void updateCaseStatus(report.id, event.target.value as typeof caseStatuses[number])}
                              >
                                {caseStatuses.map((status) => <option key={status}>{status}</option>)}
                              </select>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="cases-empty">No customer reports have been recorded for this driver.</p>
                )}
              </section>
            </ViewDetailsModal>
          );
        })()
      )}

      {actionDriver && (
        <RecordActionsModal
          title={`Manage ${actionDriver.Name}`}
          values={actionDriver}
          fields={[{ key: "Name", label: "Full Name" }, { key: "Email", label: "Email", type: "email" }, { key: "Phone", label: "Phone" }, { key: "Driver's License Number", label: "Driver's License Number" }, { key: "Car's License Plate", label: "Car's License Plate" }, { key: "Driver Image", label: "Driver Image", type: "file", accept: "image/*", required: false }, { key: "ID Certified Copy", label: "Certified Copy of ID", type: "file", accept: "image/*,application/pdf", required: false }, { key: "Driver License Certified Copy", label: "Certified Copy of Driver License", type: "file", accept: "image/*,application/pdf", required: false }, { key: "Car Registration Certified Copy", label: "Certified Copy of Car Registration", type: "file", accept: "image/*,application/pdf", required: false }, { key: "Availability", label: "Availability", options: ["Available", "Unavailable", "Disabled"] }, { key: "Status", label: "Onboarding Status", options: ["Submitted", "Verified", "Approved", "Rejected"] }]}
          actions={[{ label: actionDriver.Availability === "Disabled" ? "Enable Driver" : "Disable Driver", onClick: () => void toggleDriverStatus() }]}
          onClose={() => setActionDriver(null)}
          onSave={(values) => void saveDriver(values)}
        />
      )}

    </div>
  );
}

export default Drivers;