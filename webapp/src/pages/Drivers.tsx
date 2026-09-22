import "../App.css";
import { useState } from "react";
import AdminSidebar from "../components/AdminSidebar";
import AddRecordModal from "../components/AddRecordModal";
import ViewDetailsModal from "../components/ViewDetailsModal";
import RecordActionsModal from "../components/RecordActionsModal";
import FeedbackMessage from "../components/FeedbackMessage";
import TablePagination from "../components/TablePagination";

function Drivers() {
  const [showModal, setShowModal] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState<Record<string, string> | null>(null);
  const [actionDriver, setActionDriver] = useState<Record<string, string> | null>(null);
  const [feedback, setFeedback] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const driverRows = [
    { Name: "Michael Adams", Email: "michael@example.com", Phone: "0856781234", "License Number": "N58921W", Rating: "4.8", Availability: "Available" },
    { Name: "David Smith", Email: "david@example.com", Phone: "0812345678", "License Number": "N7841W", Rating: "4.5", Availability: "Unavailable" },
    { Name: "James Wilson", Email: "james@example.com", Phone: "0823456789", "License Number": "N923451W", Rating: "4.9", Availability: "Available" },
  ];

  const filteredDrivers = driverRows.filter((driver) =>
    Object.values(driver).join(" ").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.max(1, Math.ceil(filteredDrivers.length / pageSize));
  const currentPage = Math.min(page, totalPages);

  const addDriver = (values: Record<string, string>) => {
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
            <TablePagination page={currentPage} pageSize={pageSize} totalRecords={filteredDrivers.length} onPageChange={setPage} onPageSizeChange={(size) => { setPageSize(size); setPage(1); }} />
            <button className="btn" onClick={() => setShowModal(true)}>+ Add Driver</button>
          </div>


          <div className="table-container">

            <TablePagination page={currentPage} pageSize={pageSize} totalRecords={filteredDrivers.length} onPageChange={setPage} onPageSizeChange={(size) => { setPageSize(size); setPage(1); }} />

            <table className="users-table">

              <thead>

                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>License Number</th>
                  <th>Rating</th>
                  <th>Availability</th>
                  <th>Actions</th>
                </tr>

              </thead>


              <tbody>

                {filteredDrivers.slice((currentPage - 1) * pageSize, currentPage * pageSize).map((driver) => (
                  <tr key={driver.Email}>
                    <td>{driver.Name}</td>
                    <td>{driver.Email}</td>
                    <td>{driver.Phone}</td>
                    <td>{driver["License Number"]}</td>
                    <td>{driver.Rating}</td>
                    <td>
                      <span className={`status ${driver.Availability === "Available" ? "active" : "pending"}`}>
                        {driver.Availability}
                      </span>
                    </td>
                    <td>
                      <div className="table-actions"><button className="action-btn" onClick={() => setSelectedDriver(driver)}>View</button><button className="action-btn" onClick={() => setActionDriver(driver)}>Actions</button></div>
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
            { name: "license", label: "License Number", placeholder: "N12345W" },
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
          fields={[{ key: "Name", label: "Full Name" }, { key: "Email", label: "Email", type: "email" }, { key: "Phone", label: "Phone" }, { key: "License Number", label: "License Number" }, { key: "Availability", label: "Availability", options: ["Available", "Unavailable"] }]}
          actions={[{ label: "Disable Driver", onClick: () => setFeedback("Driver disabled.") }, { label: "Delete Driver", onClick: () => { setFeedback("Driver deleted."); setActionDriver(null); }, danger: true }]}
          onClose={() => setActionDriver(null)}
          onSave={(values) => { setFeedback(`${values.Name} was updated.`); setActionDriver(null); }}
        />
      )}

    </div>
  );
}

export default Drivers;