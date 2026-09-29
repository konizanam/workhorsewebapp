import "../App.css";
import { useState } from "react";
import AdminSidebar from "../components/AdminSidebar";
import AddRecordModal from "../components/AddRecordModal";
import ViewDetailsModal from "../components/ViewDetailsModal";
import RecordActionsModal from "../components/RecordActionsModal";
import FeedbackMessage from "../components/FeedbackMessage";
import TablePagination from "../components/TablePagination";

const licenseNumberPattern = "[0-9]{9}[A-Za-z0-9]{4}";
const licenseNumberHint = "Enter 9 digits followed by 4 letters or numbers, e.g. 600255555M9KP.";
const carLicensePlatePattern = "N[0-9]{6}W";
const carLicensePlateHint = "Enter a plate in the format N456789W.";

function Drivers() {
  const [showModal, setShowModal] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState<Record<string, string> | null>(null);
  const [actionDriver, setActionDriver] = useState<Record<string, string> | null>(null);
  const [feedback, setFeedback] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [driverRows, setDriverRows] = useState([
    { Name: "Michael Adams", Email: "michael@example.com", Phone: "0856781234", "Driver's License Number": "600255555M9KP", "Car's License Plate": "N456789W", "Driver Image": "", Rating: "4.8", Availability: "Available" },
    { Name: "David Smith", Email: "david@example.com", Phone: "0812345678", "Driver's License Number": "781234567N4QR", "Car's License Plate": "N123456W", "Driver Image": "", Rating: "4.5", Availability: "Unavailable" },
    { Name: "James Wilson", Email: "james@example.com", Phone: "0823456789", "Driver's License Number": "923456789P2LX", "Car's License Plate": "N987654W", "Driver Image": "", Rating: "4.9", Availability: "Available" },
  ]);

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
      Rating: "Not rated",
      Availability: "Available",
    }, ...current]);
    setPage(1);
    setSearchTerm("");
    setShowModal(false);
    setFeedback(`${values.name} was added as a driver.`);
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


          <div className="table-container">

            <TablePagination page={currentPage} pageSize={pageSize} totalRecords={filteredDrivers.length} onPageChange={setPage} onPageSizeChange={(size) => { setPageSize(size); setPage(1); }} />

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
                      <span className={`status ${driver.Availability === "Available" ? "active" : "pending"}`}>
                        {driver.Availability}
                      </span>
                    </td>
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
            { name: "license", label: "Driver's License Number", placeholder: "600255555M9KP", pattern: licenseNumberPattern, title: licenseNumberHint },
            { name: "carLicensePlate", label: "Car's License Plate", placeholder: "N456789W", pattern: carLicensePlatePattern, title: carLicensePlateHint },
            { name: "image", label: "Driver Image", type: "file", accept: "image/*", required: false },
          ]}
          onClose={() => setShowModal(false)}
          onSubmit={addDriver}
        />
      )}

      {selectedDriver && (
        <ViewDetailsModal
          title={selectedDriver.Name}
          details={selectedDriver}
          onClose={() => setSelectedDriver(null)}
        />
      )}

      {actionDriver && (
        <RecordActionsModal
          title={`Manage ${actionDriver.Name}`}
          values={actionDriver}
          fields={[{ key: "Name", label: "Full Name" }, { key: "Email", label: "Email", type: "email" }, { key: "Phone", label: "Phone" }, { key: "Driver's License Number", label: "Driver's License Number", pattern: licenseNumberPattern, title: licenseNumberHint }, { key: "Car's License Plate", label: "Car's License Plate", pattern: carLicensePlatePattern, title: carLicensePlateHint }, { key: "Driver Image", label: "Driver Image", type: "file", accept: "image/*", required: false }, { key: "Availability", label: "Availability", options: ["Available", "Unavailable"] }]}
          actions={[{ label: "Disable Driver", onClick: () => setFeedback("Driver disabled.") }, { label: "Delete Driver", onClick: () => { setFeedback("Driver deleted."); setActionDriver(null); }, danger: true }]}
          onClose={() => setActionDriver(null)}
          onSave={(values) => {
            setDriverRows((current) => current.map((driver) =>
              driver.Email === actionDriver.Email ? { ...driver, ...values } : driver
            ));
            setFeedback(`${values.Name} was updated.`);
            setActionDriver(null);
          }}
        />
      )}

    </div>
  );
}

export default Drivers;