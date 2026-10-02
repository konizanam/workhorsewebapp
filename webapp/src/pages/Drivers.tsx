import "../App.css";
import { useState } from "react";
import AdminSidebar from "../components/AdminSidebar";
import AddRecordModal from "../components/AddRecordModal";
import ViewDetailsModal from "../components/ViewDetailsModal";
import RecordActionsModal from "../components/RecordActionsModal";
import FeedbackMessage from "../components/FeedbackMessage";
import TablePagination from "../components/TablePagination";

const caseStatuses = ["Under Review", "Resolved", "Cancelled", "In Violation"] as const;

type DriverCase = {
  id: string;
  driverEmail: string;
  customer: string;
  report: string;
  reportedOn: string;
  status: typeof caseStatuses[number];
};

function Drivers() {
  const [showModal, setShowModal] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState<Record<string, string> | null>(null);
  const [actionDriver, setActionDriver] = useState<Record<string, string> | null>(null);
  const [feedback, setFeedback] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [driverRows, setDriverRows] = useState<Record<string, string>[]>([]);
  const [caseRows, setCaseRows] = useState<DriverCase[]>([]);

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

  const addDriver = (values: Record<string, string>) => {
    setDriverRows((current) => [{
      Name: values.name,
      Email: values.email,
      Phone: values.phone,
      "Driver's License Number": values.license,
      "Car's License Plate": values.carLicensePlate,
      "Driver Image": values.image ?? "",
      "ID Certified Copy": values.idCopy ?? "",
      "Driver License Certified Copy": values.driverLicenseCopy ?? "",
      "Car Registration Certified Copy": values.carRegistrationCopy ?? "",
      Rating: "Not rated",
      Availability: "Available",
      Status: "Submitted",
    }, ...current]);
    setPage(1);
    setSearchTerm("");
    setShowModal(false);
    setFeedback(`${values.name} was added as a driver.`);
  };

  const toggleDriverStatus = () => {
    if (!actionDriver) return;
    const availability = actionDriver.Availability === "Disabled" ? "Available" : "Disabled";
    if (availability === "Available" && caseRows.some((report) => report.driverEmail === actionDriver.Email && report.status === "In Violation")) {
      setFeedback(`${actionDriver.Name} cannot be enabled while a case is In Violation.`);
      setActionDriver(null);
      return;
    }
    setDriverRows((current) => current.map((driver) =>
      driver.Email === actionDriver.Email ? { ...driver, Availability: availability } : driver
    ));
    setFeedback(`${actionDriver.Name} ${availability === "Disabled" ? "disabled" : "enabled"}.`);
    setActionDriver(null);
  };

  const updateCaseStatus = (caseId: string, status: typeof caseStatuses[number]) => {
    const report = caseRows.find((item) => item.id === caseId);
    if (!report) return;

    setCaseRows((current) => current.map((item) => item.id === caseId ? { ...item, status } : item));
    if (status === "In Violation") {
      const driver = driverRows.find((item) => item.Email === report.driverEmail);
      setDriverRows((current) => current.map((item) =>
        item.Email === report.driverEmail ? { ...item, Availability: "Disabled" } : item
      ));
      setFeedback(`${driver?.Name ?? "Driver"} was disabled after a case was marked In Violation.`);
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
        />
      )}

      {selectedDriver && (
        (() => {
          const driver = driverRows.find((item) => item.Email === selectedDriver.Email) ?? selectedDriver;
          const driverCases = caseRows.filter((report) => report.driverEmail === driver.Email);
          const hasViolation = driverCases.some((report) => report.status === "In Violation");
          const appealSubject = encodeURIComponent("Appeal your driver account restriction");
          const appealBody = encodeURIComponent(`Hello ${driver.Name},\n\nYour account has been disabled following a customer report reviewed as a violation. Please reply to this email to submit an appeal.\n\nCase(s): ${driverCases.filter((report) => report.status === "In Violation").map((report) => report.id).join(", ")}\n\nWorkhorse Support`);

          return (
            <ViewDetailsModal
              title={driver.Name}
              details={driver}
              onClose={() => setSelectedDriver(null)}
            >
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
                                onChange={(event) => updateCaseStatus(report.id, event.target.value as typeof caseStatuses[number])}
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
          actions={[{ label: actionDriver.Availability === "Disabled" ? "Enable Driver" : "Disable Driver", onClick: toggleDriverStatus }]}
          onClose={() => setActionDriver(null)}
          onSave={(values) => {
            const hasViolation = caseRows.some((report) => report.driverEmail === actionDriver.Email && report.status === "In Violation");
            setDriverRows((current) => current.map((driver) =>
              driver.Email === actionDriver.Email ? { ...driver, ...values, ...(hasViolation ? { Availability: "Disabled" } : {}) } : driver
            ));
            setFeedback(`${values.Name} was updated${hasViolation ? "; the driver remains disabled while a case is In Violation" : ""}.`);
            setActionDriver(null);
          }}
        />
      )}

    </div>
  );
}

export default Drivers;