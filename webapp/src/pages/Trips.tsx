import "../App.css";
import AdminSidebar from "../components/AdminSidebar";
import { useState } from "react";
import ViewDetailsModal from "../components/ViewDetailsModal";
import RecordActionsModal from "../components/RecordActionsModal";
import FeedbackMessage from "../components/FeedbackMessage";
import TablePagination from "../components/TablePagination";

function Trips() {
  const [selectedTrip, setSelectedTrip] = useState<Record<string, string> | null>(null);
  const [actionTrip, setActionTrip] = useState<Record<string, string> | null>(null);
  const [feedback, setFeedback] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const tripRows = [
    { "Trip ID": "#TRIP-1001", "Request ID": "#REQ-1002", Driver: "Michael Adams", Vehicle: "N12345W", Pickup: "Windhoek", Destination: "Rehoboth", Status: "In Progress" },
    { "Trip ID": "#TRIP-1002", "Request ID": "#REQ-1003", Driver: "James Wilson", Vehicle: "N67890W", Pickup: "Windhoek", Destination: "Katutura", Status: "Completed" },
    { "Trip ID": "#TRIP-1003", "Request ID": "#REQ-1004", Driver: "David Smith", Vehicle: "N24680W", Pickup: "Windhoek", Destination: "Ongwediva", Status: "Assigned" },
    { "Trip ID": "#TRIP-1004", "Request ID": "#REQ-1005", Driver: "Michael Adams", Vehicle: "N12345W", Pickup: "Windhoek", Destination: "Okahandja", Status: "Pending" },
  ];

  const filteredTrips = tripRows.filter((trip) =>
    Object.values(trip).join(" ").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.max(1, Math.ceil(filteredTrips.length / pageSize));
  const currentPage = Math.min(page, totalPages);

  return (
    <div className="admin-page">

      <AdminSidebar />

      <div className="admin-content">

        {feedback && <FeedbackMessage message={feedback} />}

        {/* Header */}
        <div className="admin-header">

          <div>
            <h1>Trips</h1>
            <p>Monitor and manage transport trips.</p>
          </div>

        </div>


        {/* Trips Table */}
        <div className="users-section">

          <div className="users-section-header">

            <h2>All Trips</h2>

          </div>


          <div className="table-toolbar">
            <input
              type="text"
              className="table-search-input"
              placeholder="Search trips..."
              value={searchTerm}
              onChange={(event) => {
                setSearchTerm(event.target.value);
                setPage(1);
              }}
            />
            <TablePagination page={currentPage} pageSize={pageSize} totalRecords={filteredTrips.length} onPageChange={setPage} onPageSizeChange={(size) => { setPageSize(size); setPage(1); }} />
          </div>

          <div className="table-container">

            <TablePagination page={currentPage} pageSize={pageSize} totalRecords={filteredTrips.length} onPageChange={setPage} onPageSizeChange={(size) => { setPageSize(size); setPage(1); }} />

            <table className="users-table">

              <thead>

                <tr>
                  <th>Trip ID</th>
                  <th>Request ID</th>
                  <th>Driver</th>
                  <th>Vehicle</th>
                  <th>Pickup</th>
                  <th>Destination</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>

              </thead>


              <tbody>

                {filteredTrips.slice((currentPage - 1) * pageSize, currentPage * pageSize).map((trip) => (
                  <tr key={trip["Trip ID"]}>
                    <td>{trip["Trip ID"]}</td>
                    <td>{trip["Request ID"]}</td>
                    <td>{trip.Driver}</td>
                    <td>{trip.Vehicle}</td>
                    <td>{trip.Pickup}</td>
                    <td>{trip.Destination}</td>
                    <td>
                      <span className={`status ${trip.Status === "Completed" || trip.Status === "In Progress" ? "active" : "pending"}`}>
                        {trip.Status}
                      </span>
                    </td>
                    <td>
                      <div className="table-actions"><button className="action-btn" onClick={() => setSelectedTrip(trip)}>View</button><button className="action-btn" onClick={() => setActionTrip(trip)}>Actions</button></div>
                    </td>
                  </tr>
                ))}

              </tbody>

            </table>

          </div>

          <TablePagination page={currentPage} pageSize={pageSize} totalRecords={filteredTrips.length} onPageChange={setPage} onPageSizeChange={(size) => { setPageSize(size); setPage(1); }} />

        </div>

      </div>

      {selectedTrip && (
        <ViewDetailsModal
          title={selectedTrip["Trip ID"]}
          details={selectedTrip}
          onClose={() => setSelectedTrip(null)}
        />
      )}

      {actionTrip && (
        <RecordActionsModal
          title={`Manage ${actionTrip["Trip ID"]}`}
          values={actionTrip}
          fields={[{ key: "Driver", label: "Driver" }, { key: "Vehicle", label: "Vehicle" }, { key: "Pickup", label: "Pickup" }, { key: "Destination", label: "Destination" }, { key: "Status", label: "Status", options: ["Pending", "Assigned", "In Progress", "Completed", "Cancelled"] }]}
          actions={[{ label: "Cancel Trip", onClick: () => setFeedback("Trip cancelled.") }, { label: "Delete Trip", onClick: () => { setFeedback("Trip deleted."); setActionTrip(null); }, danger: true }]}
          onClose={() => setActionTrip(null)}
          onSave={(values) => { setFeedback(`${values["Trip ID"]} was updated.`); setActionTrip(null); }}
        />
      )}

    </div>
  );
}

export default Trips;