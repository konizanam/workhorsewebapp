import "../App.css";
import AdminSidebar from "../components/AdminSidebar";
import { useState } from "react";
import ViewDetailsModal from "../components/ViewDetailsModal";
import RecordActionsModal from "../components/RecordActionsModal";
import FeedbackMessage from "../components/FeedbackMessage";
import TablePagination from "../components/TablePagination";

function Requests() {
  const [selectedRequest, setSelectedRequest] = useState<Record<string, string> | null>(null);
  const [actionRequest, setActionRequest] = useState<Record<string, string> | null>(null);
  const [feedback, setFeedback] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const requestRows = [
    { "Request ID": "#REQ-1001", Customer: "John Smith", "Service Type": "Delivery", Pickup: "Windhoek", Destination: "Okahandja", Status: "Pending" },
    { "Request ID": "#REQ-1002", Customer: "ABC Construction", "Service Type": "Heavy Transport", Pickup: "Windhoek", Destination: "Rehoboth", Status: "Accepted" },
    { "Request ID": "#REQ-1003", Customer: "Sarah Williams", "Service Type": "Relocation", Pickup: "Windhoek", Destination: "Katutura", Status: "Completed" },
    { "Request ID": "#REQ-1004", Customer: "NamBuild Supplies", "Service Type": "Material Delivery", Pickup: "Windhoek", Destination: "Ongwediva", Status: "Pending" },
  ];

  const filteredRequests = requestRows.filter((request) =>
    Object.values(request).join(" ").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.max(1, Math.ceil(filteredRequests.length / pageSize));
  const currentPage = Math.min(page, totalPages);

  return (
    <div className="admin-page">

      <AdminSidebar />

      <div className="admin-content">

        {feedback && <FeedbackMessage message={feedback} />}

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


          <div className="table-toolbar">
            <input
              type="text"
              className="table-search-input"
              placeholder="Search requests..."
              value={searchTerm}
              onChange={(event) => {
                setSearchTerm(event.target.value);
                setPage(1);
              }}
            />
            <TablePagination page={currentPage} pageSize={pageSize} totalRecords={filteredRequests.length} onPageChange={setPage} onPageSizeChange={(size) => { setPageSize(size); setPage(1); }} />
          </div>

          <div className="table-container">

            <TablePagination page={currentPage} pageSize={pageSize} totalRecords={filteredRequests.length} onPageChange={setPage} onPageSizeChange={(size) => { setPageSize(size); setPage(1); }} />

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

                {filteredRequests.slice((currentPage - 1) * pageSize, currentPage * pageSize).map((request) => (
                  <tr key={request["Request ID"]}>
                    <td>{request["Request ID"]}</td>
                    <td>{request.Customer}</td>
                    <td>{request["Service Type"]}</td>
                    <td>{request.Pickup}</td>
                    <td>{request.Destination}</td>
                    <td>
                      <span className={`status ${request.Status === "Accepted" || request.Status === "Completed" ? "active" : "pending"}`}>
                        {request.Status}
                      </span>
                    </td>
                    <td>
                      <div className="table-actions"><button className="action-btn" onClick={() => setSelectedRequest(request)}>View</button><button className="action-btn" onClick={() => setActionRequest(request)}>Actions</button></div>
                    </td>
                  </tr>
                ))}

              </tbody>

            </table>

          </div>

          <TablePagination page={currentPage} pageSize={pageSize} totalRecords={filteredRequests.length} onPageChange={setPage} onPageSizeChange={(size) => { setPageSize(size); setPage(1); }} />

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
          actions={[{ label: "Cancel Request", onClick: () => setFeedback("Request cancelled.") }, { label: "Delete Request", onClick: () => { setFeedback("Request deleted."); setActionRequest(null); }, danger: true }]}
          onClose={() => setActionRequest(null)}
          onSave={(values) => { setFeedback(`${values["Request ID"]} was updated.`); setActionRequest(null); }}
        />
      )}

    </div>
  );
}

export default Requests;