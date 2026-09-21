import "../App.css";
import AdminSidebar from "../components/AdminSidebar";
import { useState } from "react";
import ViewDetailsModal from "../components/ViewDetailsModal";
import RecordActionsModal from "../components/RecordActionsModal";

function Requests() {
  const [selectedRequest, setSelectedRequest] = useState<Record<string, string> | null>(null);
  const [actionRequest, setActionRequest] = useState<Record<string, string> | null>(null);

  return (
    <div className="admin-page">

      <AdminSidebar />

      <div className="admin-content">

        {/* Header */}
        <div className="admin-header">

          <div>
            <h1>Requests</h1>
            <p>Manage transport requests.</p>
          </div>

        </div>


        {/* Requests Table */}
        <div className="users-section">

          <div className="users-section-header">

            <h2>All Requests</h2>

          </div>


          <div className="table-container">

            <table className="users-table">

              <thead>

                <tr>
                  <th>Request ID</th>
                  <th>Customer</th>
                  <th>Service Type</th>
                  <th>Pickup</th>
                  <th>Destination</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>

              </thead>


              <tbody>

                <tr>

                  <td>#REQ-1001</td>

                  <td>John Smith</td>

                  <td>Delivery</td>

                  <td>Windhoek</td>

                  <td>Okahandja</td>

                  <td>
                    <span className="status pending">
                      Pending
                    </span>
                  </td>

                  <td>
                    <div className="table-actions"><button className="action-btn" onClick={() => setSelectedRequest({ "Request ID": "#REQ-1001", Customer: "John Smith", "Service Type": "Delivery", Pickup: "Windhoek", Destination: "Okahandja", Status: "Pending" })}>View</button><button className="action-btn" onClick={() => setActionRequest({ "Request ID": "#REQ-1001", Customer: "John Smith", "Service Type": "Delivery", Pickup: "Windhoek", Destination: "Okahandja", Status: "Pending" })}>Actions</button></div>
                  </td>

                </tr>


                <tr>

                  <td>#REQ-1002</td>

                  <td>ABC Construction</td>

                  <td>Heavy Transport</td>

                  <td>Windhoek</td>

                  <td>Rehoboth</td>

                  <td>
                    <span className="status active">
                      Accepted
                    </span>
                  </td>

                  <td>
                    <div className="table-actions"><button className="action-btn" onClick={() => setSelectedRequest({ "Request ID": "#REQ-1002", Customer: "ABC Construction", "Service Type": "Heavy Transport", Pickup: "Windhoek", Destination: "Rehoboth", Status: "Accepted" })}>View</button><button className="action-btn" onClick={() => setActionRequest({ "Request ID": "#REQ-1002", Customer: "ABC Construction", "Service Type": "Heavy Transport", Pickup: "Windhoek", Destination: "Rehoboth", Status: "Accepted" })}>Actions</button></div>
                  </td>

                </tr>


                <tr>

                  <td>#REQ-1003</td>

                  <td>Sarah Williams</td>

                  <td>Relocation</td>

                  <td>Windhoek</td>

                  <td>Katutura</td>

                  <td>
                    <span className="status active">
                      Completed
                    </span>
                  </td>

                  <td>
                    <div className="table-actions"><button className="action-btn" onClick={() => setSelectedRequest({ "Request ID": "#REQ-1003", Customer: "Sarah Williams", "Service Type": "Relocation", Pickup: "Windhoek", Destination: "Katutura", Status: "Completed" })}>View</button><button className="action-btn" onClick={() => setActionRequest({ "Request ID": "#REQ-1003", Customer: "Sarah Williams", "Service Type": "Relocation", Pickup: "Windhoek", Destination: "Katutura", Status: "Completed" })}>Actions</button></div>
                  </td>

                </tr>


                <tr>

                  <td>#REQ-1004</td>

                  <td>NamBuild Supplies</td>

                  <td>Material Delivery</td>

                  <td>Windhoek</td>

                  <td>Ongwediva</td>

                  <td>
                    <span className="status pending">
                      Pending
                    </span>
                  </td>

                  <td>
                    <div className="table-actions"><button className="action-btn" onClick={() => setSelectedRequest({ "Request ID": "#REQ-1004", Customer: "NamBuild Supplies", "Service Type": "Material Delivery", Pickup: "Windhoek", Destination: "Ongwediva", Status: "Pending" })}>View</button><button className="action-btn" onClick={() => setActionRequest({ "Request ID": "#REQ-1004", Customer: "NamBuild Supplies", "Service Type": "Material Delivery", Pickup: "Windhoek", Destination: "Ongwediva", Status: "Pending" })}>Actions</button></div>
                  </td>

                </tr>

              </tbody>

            </table>

          </div>

        </div>

      </div>

      {selectedRequest && (
        <ViewDetailsModal
          title={selectedRequest["Request ID"]}
          details={selectedRequest}
          onClose={() => setSelectedRequest(null)}
        />
      )}

      {actionRequest && (
        <RecordActionsModal
          title={`Manage ${actionRequest["Request ID"]}`}
          values={actionRequest}
          fields={[{ key: "Customer", label: "Customer" }, { key: "Service Type", label: "Service Type" }, { key: "Pickup", label: "Pickup" }, { key: "Destination", label: "Destination" }, { key: "Status", label: "Status", options: ["Pending", "Accepted", "Completed", "Cancelled"] }]}
          actions={[{ label: "Cancel Request", onClick: () => alert("Request cancelled.") }, { label: "Delete Request", onClick: () => { alert("Request deleted."); setActionRequest(null); }, danger: true }]}
          onClose={() => setActionRequest(null)}
          onSave={(values) => { alert(`${values["Request ID"]} was updated.`); setActionRequest(null); }}
        />
      )}

    </div>
  );
}

export default Requests;