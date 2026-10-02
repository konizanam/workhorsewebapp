import "../App.css";
import { useState } from "react";
import AdminSidebar from "../components/AdminSidebar";
import AddRecordModal from "../components/AddRecordModal";
import ViewDetailsModal from "../components/ViewDetailsModal";
import RecordActionsModal from "../components/RecordActionsModal";
import FeedbackMessage from "../components/FeedbackMessage";
import TablePagination from "../components/TablePagination";
import { apiRequest } from "../lib/api";
import { useApiList } from "../lib/useApiList";

type Driver = {
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  email: string;
  phone_number: string | null;
  status: string;
  rating: number | null;
  availability_status: string;
  company_id: string | null;
};

const driverName = (driver: Driver) => [driver.first_name, driver.last_name].filter(Boolean).join(" ") || driver.email;

function Drivers() {
  const [showModal, setShowModal] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [actionDriver, setActionDriver] = useState<Driver | null>(null);
  const [feedback, setFeedback] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const { rows: driverRows, loading, error, refresh } = useApiList<Driver>("/drivers?limit=100");

  const filteredDrivers = driverRows.filter((driver) =>
    Object.values(driver).join(" ").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.max(1, Math.ceil(filteredDrivers.length / pageSize));
  const currentPage = Math.min(page, totalPages);

  const addDriver = async (values: Record<string, string>) => {
    try {
      await apiRequest("/drivers", {
        method: "POST",
        body: JSON.stringify({
          first_name: values.first_name,
          last_name: values.last_name,
          email: values.email,
          phone_number: values.phone_number,
          password: values.password,
        }),
      });
      setShowModal(false);
      setFeedback(`${values.first_name} ${values.last_name} was added as a driver.`);
      refresh();
    } catch (requestError) {
      setFeedback(requestError instanceof Error ? requestError.message : "Unable to create driver.");
    }
  };

  const saveDriver = async (values: Record<string, string>) => {
    if (!actionDriver) return;
    try {
      await apiRequest(`/drivers/${actionDriver.user_id}`, {
        method: "PUT",
        body: JSON.stringify({
          first_name: values.first_name,
          last_name: values.last_name,
          phone_number: values.phone_number,
          status: values.status,
          company_id: values.company_id || null,
        }),
      });
      setActionDriver(null);
      setFeedback("Driver updated successfully.");
      refresh();
    } catch (requestError) {
      setFeedback(requestError instanceof Error ? requestError.message : "Unable to update driver.");
    }
  };

  const removeDriver = async (driver: Driver) => {
    try {
      await apiRequest(`/drivers/${driver.user_id}`, { method: "DELETE" });
      setActionDriver(null);
      setFeedback("Driver deleted successfully.");
      refresh();
    } catch (requestError) {
      setFeedback(requestError instanceof Error ? requestError.message : "Unable to delete driver.");
    }
  };

  const verifyDriver = async (driver: Driver) => {
    try {
      await apiRequest(`/drivers/${driver.user_id}/registration/verify`, {
        method: "PUT",
        body: JSON.stringify({ verification_status: "verified" }),
      });
      setActionDriver(null);
      setFeedback("Driver registration verified.");
    } catch (requestError) {
      setFeedback(requestError instanceof Error ? requestError.message : "Unable to verify driver.");
    }
  };

  return (
    <div className="admin-page">

      <AdminSidebar />

      <div className="admin-content">

        {feedback && <FeedbackMessage message={feedback} />}
        {error && <FeedbackMessage message={error} tone="error" />}

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
                  <th>Account Status</th>
                  <th>Rating</th>
                  <th>Availability</th>
                  <th>Actions</th>
                </tr>

              </thead>


              <tbody>

                {loading ? <tr><td colSpan={7}>Loading drivers...</td></tr> : filteredDrivers.slice((currentPage - 1) * pageSize, currentPage * pageSize).map((driver) => (
                  <tr key={driver.user_id}>
                    <td>{driverName(driver)}</td>
                    <td>{driver.email}</td>
                    <td>{driver.phone_number || "-"}</td>
                    <td>{driver.status}</td>
                    <td>{driver.rating ?? "-"}</td>
                    <td>
                      <span className={`status ${driver.availability_status}`}>
                        {driver.availability_status}
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
            { name: "first_name", label: "First Name", placeholder: "Alex" },
            { name: "last_name", label: "Last Name", placeholder: "Morgan" },
            { name: "email", label: "Email Address", type: "email", placeholder: "alex@example.com" },
            { name: "phone_number", label: "Phone Number", type: "tel", placeholder: "0812345678" },
            { name: "password", label: "Temporary Password (8+ characters)", type: "password" },
          ]}
          onClose={() => setShowModal(false)}
          onSubmit={addDriver}
        />
      )}

      {selectedDriver && (
        <ViewDetailsModal
          title={driverName(selectedDriver)}
          details={{
            "Driver ID": selectedDriver.user_id,
            Email: selectedDriver.email,
            Phone: selectedDriver.phone_number || "-",
            Status: selectedDriver.status,
            Rating: String(selectedDriver.rating ?? "-"),
            Availability: selectedDriver.availability_status,
            "Company ID": selectedDriver.company_id || "Independent",
          }}
          onClose={() => setSelectedDriver(null)}
        />
      )}

      {actionDriver && (
        <RecordActionsModal
          title={`Manage ${driverName(actionDriver)}`}
          values={{
            first_name: actionDriver.first_name || "",
            last_name: actionDriver.last_name || "",
            phone_number: actionDriver.phone_number || "",
            status: actionDriver.status,
            company_id: actionDriver.company_id || "",
          }}
          fields={[
            { key: "first_name", label: "First Name" },
            { key: "last_name", label: "Last Name" },
            { key: "phone_number", label: "Phone Number" },
            { key: "status", label: "Account Status", options: ["active", "suspended", "invited"] },
            { key: "company_id", label: "Company ID" },
          ]}
          actions={[
            { label: "Verify Registration", onClick: () => void verifyDriver(actionDriver) },
            { label: "Delete Driver", onClick: () => void removeDriver(actionDriver), danger: true },
          ]}
          onClose={() => setActionDriver(null)}
          onSave={saveDriver}
        />
      )}

    </div>
  );
}

export default Drivers;