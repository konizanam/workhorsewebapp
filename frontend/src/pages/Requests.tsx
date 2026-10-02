import "../App.css";
import AdminSidebar from "../components/AdminSidebar";
import { useState } from "react";
import ViewDetailsModal from "../components/ViewDetailsModal";
import RecordActionsModal from "../components/RecordActionsModal";
import FeedbackMessage from "../components/FeedbackMessage";
import TablePagination from "../components/TablePagination";
import { apiRequest } from "../lib/api";
import { useApiList } from "../lib/useApiList";

type RequestRecord = {
  request_id: string;
  customer_id: string;
  pickup: string;
  destination: string;
  description: string | null;
  estimated_weight_kg: number | null;
  scheduled_date_time: string | null;
  requires_helpers: boolean;
  status: string;
  price: number | null;
};

function Requests() {
  const [selectedRequest, setSelectedRequest] = useState<RequestRecord | null>(null);
  const [actionRequest, setActionRequest] = useState<RequestRecord | null>(null);
  const [feedback, setFeedback] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const { rows: requestRows, loading, error, refresh } = useApiList<RequestRecord>("/requests?limit=100");

  const filteredRequests = requestRows.filter((request) =>
    Object.values(request).join(" ").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const saveRequest = async (values: Record<string, string>) => {
    if (!actionRequest) return;
    try {
      await apiRequest(`/requests/${actionRequest.request_id}`, {
        method: "PUT",
        body: JSON.stringify({ pickup: values.pickup, destination: values.destination, description: values.description, status: values.status }),
      });
      setActionRequest(null);
      setFeedback("Request updated successfully.");
      refresh();
    } catch (requestError) {
      setFeedback(requestError instanceof Error ? requestError.message : "Unable to update request.");
    }
  };

  const cancelRequest = async (request: RequestRecord) => {
    try {
      await apiRequest(`/requests/${request.request_id}`, { method: "PUT", body: JSON.stringify({ status: "cancelled" }) });
      setActionRequest(null);
      setFeedback("Request cancelled.");
      refresh();
    } catch (requestError) {
      setFeedback(requestError instanceof Error ? requestError.message : "Unable to cancel request.");
    }
  };

  const deleteRequest = async (request: RequestRecord) => {
    try {
      await apiRequest(`/requests/${request.request_id}`, { method: "DELETE" });
      setActionRequest(null);
      setFeedback("Request deleted.");
      refresh();
    } catch (requestError) {
      setFeedback(requestError instanceof Error ? requestError.message : "Unable to delete request.");
    }
  };

  const totalPages = Math.max(1, Math.ceil(filteredRequests.length / pageSize));
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
                  <th>Customer ID</th>
                  <th>Pickup</th>
                  <th>Destination</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>

              </thead>


              <tbody>

                {loading ? <tr><td colSpan={7}>Loading requests...</td></tr> : filteredRequests.slice((currentPage - 1) * pageSize, currentPage * pageSize).map((request) => (
                  <tr key={request.request_id}>
                    <td>{request.request_id}</td>
                    <td>{request.customer_id}</td>
                    <td>{request.pickup}</td>
                    <td>{request.destination}</td>
                    <td>
                      <span className={`status ${request.status}`}>
                        {request.status}
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
          title={selectedRequest.request_id}
          details={{
            "Request ID": selectedRequest.request_id,
            "Customer ID": selectedRequest.customer_id,
            Pickup: selectedRequest.pickup,
            Destination: selectedRequest.destination,
            Description: selectedRequest.description || "-",
            "Estimated Weight (kg)": String(selectedRequest.estimated_weight_kg ?? "-"),
            "Scheduled At": selectedRequest.scheduled_date_time || "-",
            "Requires Helpers": selectedRequest.requires_helpers ? "Yes" : "No",
            Status: selectedRequest.status,
            Price: String(selectedRequest.price ?? "-"),
          }}
          onClose={() => setSelectedRequest(null)}
        />
      )}

      {actionRequest && (
        <RecordActionsModal
          title={`Manage ${actionRequest.request_id}`}
          values={{ pickup: actionRequest.pickup, destination: actionRequest.destination, description: actionRequest.description || "", status: actionRequest.status }}
          fields={[
            { key: "pickup", label: "Pickup" },
            { key: "destination", label: "Destination" },
            { key: "description", label: "Description" },
            { key: "status", label: "Status", options: ["searching", "matched", "accepted", "declined", "cancelled"] },
          ]}
          actions={[{ label: "Cancel Request", onClick: () => void cancelRequest(actionRequest) }, { label: "Delete Request", onClick: () => void deleteRequest(actionRequest), danger: true }]}
          onClose={() => setActionRequest(null)}
          onSave={saveRequest}
        />
      )}

    </div>
  );
}

export default Requests;