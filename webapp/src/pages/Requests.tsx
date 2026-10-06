import "../App.css";
import AdminSidebar from "../components/AdminSidebar";
import { useEffect, useState } from "react";
import ViewDetailsModal from "../components/ViewDetailsModal";
import RecordActionsModal from "../components/RecordActionsModal";
import FeedbackMessage from "../components/FeedbackMessage";
import TablePagination from "../components/TablePagination";
import { apiRequest } from "../lib/api";

type ApiRequest = {
  request_id: string;
  customer_id: string;
  customer_name?: string;
  Customer?: string;
  service_type?: string;
  "Service Type"?: string;
  pickup: string;
  destination: string;
  status: string;
  Status?: string;
  description?: string | null;
  price?: number | null;
  estimated_weight_kg?: number | null;
  scheduled_date_time?: string | null;
  requires_helpers?: boolean;
};

type RequestListResponse = { data: ApiRequest[] };

const mapRequest = (request: ApiRequest): Record<string, string> => ({
  ID: request.request_id,
  "Request ID": request.request_id,
  Customer: request.Customer ?? request.customer_name ?? request.customer_id,
  "Service Type": request["Service Type"] ?? request.service_type ?? "General",
  Pickup: request.pickup,
  Destination: request.destination,
  Status: request.Status ?? (request.status === "searching" ? "Pending" : request.status[0].toUpperCase() + request.status.slice(1)),
  "Description": request.description ?? "",
  Price: request.price == null ? "" : String(request.price),
  "Estimated Weight (kg)": request.estimated_weight_kg == null ? "" : String(request.estimated_weight_kg),
  "Scheduled Date": request.scheduled_date_time ?? "",
  "Requires Helpers": request.requires_helpers ? "Yes" : "No",
});

function Requests() {
  const [selectedRequest, setSelectedRequest] = useState<Record<string, string> | null>(null);
  const [actionRequest, setActionRequest] = useState<Record<string, string> | null>(null);
  const [feedback, setFeedback] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isSaving, setIsSaving] = useState(false);

  const [requestRows, setRequestRows] = useState<Record<string, string>[]>([]);

  useEffect(() => {
    const loadRequests = async () => {
      try {
        const response = await apiRequest<RequestListResponse>("/requests?limit=100");
        setRequestRows((response.data ?? []).map(mapRequest));
      } catch (error) {
        setFeedback(error instanceof Error ? error.message : "Unable to load requests.");
      }
    };

    void loadRequests();
  }, []);

  const filteredRequests = requestRows.filter((request) =>
    Object.values(request).join(" ").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.max(1, Math.ceil(filteredRequests.length / pageSize));
  const currentPage = Math.min(page, totalPages);

  const saveRequest = async (values: Record<string, string>) => {
    if (!actionRequest) return;
    setIsSaving(true);
    try {
      const updated = await apiRequest<ApiRequest>(`/requests/${actionRequest.ID}`, {
        method: "PUT",
        body: JSON.stringify(values),
      });
      const row = mapRequest({ ...updated, request_id: updated.request_id ?? actionRequest.ID });
      setRequestRows((current) => current.map((request) => request.ID === actionRequest.ID ? row : request));
      setFeedback(`Request ${actionRequest.ID} was saved.`);
      setActionRequest(null);
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Unable to update the request.");
    } finally {
      setIsSaving(false);
    }
  };

  const cancelRequest = async () => {
    if (!actionRequest) return;
    try {
      const updated = await apiRequest<ApiRequest>(`/requests/${actionRequest.ID}`, {
        method: "PUT",
        body: JSON.stringify({ status: "Cancelled" }),
      });
      const row = mapRequest({ ...updated, request_id: updated.request_id ?? actionRequest.ID });
      setRequestRows((current) => current.map((request) => request.ID === actionRequest.ID ? row : request));
      setFeedback(`Request ${actionRequest.ID} was cancelled.`);
      setActionRequest(null);
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Unable to cancel the request.");
    }
  };

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
          </div>

          <TablePagination page={currentPage} pageSize={pageSize} totalRecords={filteredRequests.length} onPageChange={setPage} onPageSizeChange={(size) => { setPageSize(size); setPage(1); }} />

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
                      <div className="table-actions"><button className="action-btn" onClick={() => setSelectedRequest(request)}>View</button><button className="action-btn" onClick={() => request.Status === "Completed" ? window.alert("You cannot edit a completed request.") : setActionRequest(request)}>Edit</button></div>
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
          fields={[{ key: "Customer", label: "Customer" }, { key: "Service Type", label: "Service Type" }, { key: "Pickup", label: "Pickup", type: "location" }, { key: "Destination", label: "Destination", type: "location" }, { key: "Status", label: "Status", options: ["Pending", "Accepted", "Completed", "Cancelled"] }]}
          actions={[{ label: "Cancel Request", onClick: () => void cancelRequest() }]}
          onClose={() => setActionRequest(null)}
          onSave={(values) => void saveRequest(values)}
          isSaving={isSaving}
        />
      )}

    </div>
  );
}

export default Requests;