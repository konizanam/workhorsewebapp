import "../App.css";
import AdminSidebar from "../components/AdminSidebar";
import { useState } from "react";
import ViewDetailsModal from "../components/ViewDetailsModal";
import RecordActionsModal from "../components/RecordActionsModal";
import FeedbackMessage from "../components/FeedbackMessage";
import TablePagination from "../components/TablePagination";
import { apiRequest } from "../lib/api";
import { useApiList } from "../lib/useApiList";

type Trip = {
  trip_id: string;
  request_id: string;
  driver_id: string;
  customer_id: string;
  vehicle_id: string;
  status: string;
  payment_method: string | null;
  price: number | null;
};

function Trips() {
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [actionTrip, setActionTrip] = useState<Trip | null>(null);
  const [feedback, setFeedback] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const { rows: tripRows, loading, error, refresh } = useApiList<Trip>("/trips?limit=100");

  const filteredTrips = tripRows.filter((trip) =>
    Object.values(trip).join(" ").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const updateTrip = async (trip: Trip, status: string) => {
    try {
      await apiRequest(`/trips/${trip.trip_id}`, { method: "PUT", body: JSON.stringify({ status }) });
      setActionTrip(null);
      setFeedback(`Trip status updated to ${status}.`);
      refresh();
    } catch (requestError) {
      setFeedback(requestError instanceof Error ? requestError.message : "Unable to update trip.");
    }
  };

  const saveTrip = async (values: Record<string, string>) => {
    if (actionTrip) await updateTrip(actionTrip, values.status);
  };

  const totalPages = Math.max(1, Math.ceil(filteredTrips.length / pageSize));
  const currentPage = Math.min(page, totalPages);

  return (
    <div className="admin-page">

      <AdminSidebar />

      <div className="admin-content">

        {feedback && <FeedbackMessage message={feedback} />}
        {error && <FeedbackMessage message={error} tone="error" />}

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
                  <th>Status</th>
                  <th>Actions</th>
                </tr>

              </thead>


              <tbody>

                {loading ? <tr><td colSpan={6}>Loading trips...</td></tr> : filteredTrips.slice((currentPage - 1) * pageSize, currentPage * pageSize).map((trip) => (
                  <tr key={trip.trip_id}>
                    <td>{trip.trip_id}</td>
                    <td>{trip.request_id}</td>
                    <td>{trip.driver_id}</td>
                    <td>{trip.vehicle_id}</td>
                    <td>
                      <span className={`status ${trip.status}`}>
                        {trip.status}
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
          title={selectedTrip.trip_id}
          details={{
            "Trip ID": selectedTrip.trip_id,
            "Request ID": selectedTrip.request_id,
            "Driver ID": selectedTrip.driver_id,
            "Customer ID": selectedTrip.customer_id,
            "Vehicle ID": selectedTrip.vehicle_id,
            Status: selectedTrip.status,
            "Payment Method": selectedTrip.payment_method || "-",
            Price: String(selectedTrip.price ?? "-"),
          }}
          onClose={() => setSelectedTrip(null)}
        />
      )}

      {actionTrip && (
        <RecordActionsModal
          title={`Manage ${actionTrip.trip_id}`}
          values={{ status: actionTrip.status }}
          fields={[{ key: "status", label: "Trip Status", options: ["accepted", "driver_arriving", "driver_arrived", "loading", "in_transit", "unloading", "completed", "cancelled"] }]}
          actions={[{ label: "Cancel Trip", onClick: () => void updateTrip(actionTrip, "cancelled"), danger: true }]}
          onClose={() => setActionTrip(null)}
          onSave={saveTrip}
        />
      )}

    </div>
  );
}

export default Trips;