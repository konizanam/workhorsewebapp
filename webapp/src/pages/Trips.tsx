import "../App.css";
import AdminSidebar from "../components/AdminSidebar";
import { useState } from "react";
import ViewDetailsModal from "../components/ViewDetailsModal";
import RecordActionsModal from "../components/RecordActionsModal";

function Trips() {
  const [selectedTrip, setSelectedTrip] = useState<Record<string, string> | null>(null);
  const [actionTrip, setActionTrip] = useState<Record<string, string> | null>(null);

  return (
    <div className="admin-page">

      <AdminSidebar />

      <div className="admin-content">

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


          <div className="table-container">

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

                <tr>

                  <td>#TRIP-1001</td>

                  <td>#REQ-1002</td>

                  <td>Michael Adams</td>

                  <td>N12345W</td>

                  <td>Windhoek</td>

                  <td>Rehoboth</td>

                  <td>
                    <span className="status active">
                      In Progress
                    </span>
                  </td>

                  <td>
                    <div className="table-actions"><button className="action-btn" onClick={() => setSelectedTrip({ "Trip ID": "#TRIP-1001", "Request ID": "#REQ-1002", Driver: "Michael Adams", Vehicle: "N12345W", Pickup: "Windhoek", Destination: "Rehoboth", Status: "In Progress" })}>View</button><button className="action-btn" onClick={() => setActionTrip({ "Trip ID": "#TRIP-1001", "Request ID": "#REQ-1002", Driver: "Michael Adams", Vehicle: "N12345W", Pickup: "Windhoek", Destination: "Rehoboth", Status: "In Progress" })}>Actions</button></div>
                  </td>

                </tr>


                <tr>

                  <td>#TRIP-1002</td>

                  <td>#REQ-1003</td>

                  <td>James Wilson</td>

                  <td>N67890W</td>

                  <td>Windhoek</td>

                  <td>Katutura</td>

                  <td>
                    <span className="status active">
                      Completed
                    </span>
                  </td>

                  <td>
                    <div className="table-actions"><button className="action-btn" onClick={() => setSelectedTrip({ "Trip ID": "#TRIP-1002", "Request ID": "#REQ-1003", Driver: "James Wilson", Vehicle: "N67890W", Pickup: "Windhoek", Destination: "Katutura", Status: "Completed" })}>View</button><button className="action-btn" onClick={() => setActionTrip({ "Trip ID": "#TRIP-1002", "Request ID": "#REQ-1003", Driver: "James Wilson", Vehicle: "N67890W", Pickup: "Windhoek", Destination: "Katutura", Status: "Completed" })}>Actions</button></div>
                  </td>

                </tr>


                <tr>

                  <td>#TRIP-1003</td>

                  <td>#REQ-1004</td>

                  <td>David Smith</td>

                  <td>N24680W</td>

                  <td>Windhoek</td>

                  <td>Ongwediva</td>

                  <td>
                    <span className="status pending">
                      Assigned
                    </span>
                  </td>

                  <td>
                    <div className="table-actions"><button className="action-btn" onClick={() => setSelectedTrip({ "Trip ID": "#TRIP-1003", "Request ID": "#REQ-1004", Driver: "David Smith", Vehicle: "N24680W", Pickup: "Windhoek", Destination: "Ongwediva", Status: "Assigned" })}>View</button><button className="action-btn" onClick={() => setActionTrip({ "Trip ID": "#TRIP-1003", "Request ID": "#REQ-1004", Driver: "David Smith", Vehicle: "N24680W", Pickup: "Windhoek", Destination: "Ongwediva", Status: "Assigned" })}>Actions</button></div>
                  </td>

                </tr>


                <tr>

                  <td>#TRIP-1004</td>

                  <td>#REQ-1005</td>

                  <td>Michael Adams</td>

                  <td>N12345W</td>

                  <td>Windhoek</td>

                  <td>Okahandja</td>

                  <td>
                    <span className="status pending">
                      Pending
                    </span>
                  </td>

                  <td>
                    <div className="table-actions"><button className="action-btn" onClick={() => setSelectedTrip({ "Trip ID": "#TRIP-1004", "Request ID": "#REQ-1005", Driver: "Michael Adams", Vehicle: "N12345W", Pickup: "Windhoek", Destination: "Okahandja", Status: "Pending" })}>View</button><button className="action-btn" onClick={() => setActionTrip({ "Trip ID": "#TRIP-1004", "Request ID": "#REQ-1005", Driver: "Michael Adams", Vehicle: "N12345W", Pickup: "Windhoek", Destination: "Okahandja", Status: "Pending" })}>Actions</button></div>
                  </td>

                </tr>

              </tbody>

            </table>

          </div>

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
          actions={[{ label: "Cancel Trip", onClick: () => alert("Trip cancelled.") }, { label: "Delete Trip", onClick: () => { alert("Trip deleted."); setActionTrip(null); }, danger: true }]}
          onClose={() => setActionTrip(null)}
          onSave={(values) => { alert(`${values["Trip ID"]} was updated.`); setActionTrip(null); }}
        />
      )}

    </div>
  );
}

export default Trips;