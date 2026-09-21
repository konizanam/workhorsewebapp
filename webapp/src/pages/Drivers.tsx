import "../App.css";
import { useState } from "react";
import AdminSidebar from "../components/AdminSidebar";
import AddRecordModal from "../components/AddRecordModal";
import ViewDetailsModal from "../components/ViewDetailsModal";
import RecordActionsModal from "../components/RecordActionsModal";

function Drivers() {
  const [showModal, setShowModal] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState<Record<string, string> | null>(null);
  const [actionDriver, setActionDriver] = useState<Record<string, string> | null>(null);

  const addDriver = (values: Record<string, string>) => {
    setShowModal(false);
    alert(`${values.name} was added as a driver.`);
  };

  return (
    <div className="admin-page">

      <AdminSidebar />

      <div className="admin-content">

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

            <button className="btn" onClick={() => setShowModal(true)}>
              + Add Driver
            </button>

          </div>


          <div className="table-container">

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

                <tr>

                  <td>Michael Adams</td>

                  <td>michael@example.com</td>

                  <td>0856781234</td>

                  <td>N58921W</td>

                  <td>4.8</td>

                  <td>
                    <span className="status active">
                      Available
                    </span>
                  </td>

                  <td>
                    <div className="table-actions"><button className="action-btn" onClick={() => setSelectedDriver({ Name: "Michael Adams", Email: "michael@example.com", Phone: "0856781234", "License Number": "N58921W", Rating: "4.8", Availability: "Available" })}>View</button><button className="action-btn" onClick={() => setActionDriver({ Name: "Michael Adams", Email: "michael@example.com", Phone: "0856781234", "License Number": "N58921W", Rating: "4.8", Availability: "Available" })}>Actions</button></div>
                  </td>

                </tr>


                <tr>

                  <td>David Smith</td>

                  <td>david@example.com</td>

                  <td>0812345678</td>

                  <td>N7841W</td>

                  <td>4.5</td>

                  <td>
                    <span className="status pending">
                      Unavailable
                    </span>
                  </td>

                  <td>
                    <div className="table-actions"><button className="action-btn" onClick={() => setSelectedDriver({ Name: "David Smith", Email: "david@example.com", Phone: "0812345678", "License Number": "N7841W", Rating: "4.5", Availability: "Unavailable" })}>View</button><button className="action-btn" onClick={() => setActionDriver({ Name: "David Smith", Email: "david@example.com", Phone: "0812345678", "License Number": "N7841W", Rating: "4.5", Availability: "Unavailable" })}>Actions</button></div>
                  </td>

                </tr>


                <tr>

                  <td>James Wilson</td>

                  <td>james@example.com</td>

                  <td>0823456789</td>

                  <td>N923451W</td>

                  <td>4.9</td>

                  <td>
                    <span className="status active">
                      Available
                    </span>
                  </td>

                  <td>
                    <div className="table-actions"><button className="action-btn" onClick={() => setSelectedDriver({ Name: "James Wilson", Email: "james@example.com", Phone: "0823456789", "License Number": "N923451W", Rating: "4.9", Availability: "Available" })}>View</button><button className="action-btn" onClick={() => setActionDriver({ Name: "James Wilson", Email: "james@example.com", Phone: "0823456789", "License Number": "N923451W", Rating: "4.9", Availability: "Available" })}>Actions</button></div>
                  </td>

                </tr>

              </tbody>

            </table>

          </div>

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
          actions={[{ label: "Disable Driver", onClick: () => alert("Driver disabled.") }, { label: "Delete Driver", onClick: () => { alert("Driver deleted."); setActionDriver(null); }, danger: true }]}
          onClose={() => setActionDriver(null)}
          onSave={(values) => { alert(`${values.Name} was updated.`); setActionDriver(null); }}
        />
      )}

    </div>
  );
}

export default Drivers;