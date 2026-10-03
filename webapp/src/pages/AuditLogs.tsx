import { useEffect, useState } from "react";
import "../App.css";
import AdminSidebar from "../components/AdminSidebar";
import TablePagination from "../components/TablePagination";
import { apiRequest } from "../lib/api";

interface AuditLog {
  id: string;
  user: string;
  permission: string;
  resource: string;
  resourceId: string;
  method: string;
  endpoint: string;
  ipAddress: string;
  createdAt: string;
  metadata: string;
}

type ApiAuditLog = {
  log_id: string;
  permission_key?: string | null;
  resource_type?: string | null;
  resource_id?: string | null;
  method: string;
  endpoint?: string | null;
  ip_address?: string | null;
  created_at: string;
  actor?: string;
  metadata?: unknown;
};

type AuditLogResponse = {
  data: ApiAuditLog[];
  pagination: { total: number };
};

const mapAuditLog = (log: ApiAuditLog): AuditLog => ({
  id: log.log_id,
  user: log.actor ?? "Unknown",
  permission: log.permission_key ?? "",
  resource: log.resource_type ?? "",
  resourceId: log.resource_id ?? "",
  method: log.method,
  endpoint: log.endpoint ?? "",
  ipAddress: log.ip_address ?? "",
  createdAt: new Date(log.created_at).toLocaleString(),
  metadata: typeof log.metadata === "string" ? log.metadata : JSON.stringify(log.metadata ?? {}),
});

function AuditLogs() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [totalLogs, setTotalLogs] = useState(0);
  const [feedback, setFeedback] = useState("");

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [methodFilter, setMethodFilter] = useState("All");

  const [selectedLog, setSelectedLog] =
    useState<AuditLog | null>(null);

  useEffect(() => {
    const loadLogs = async () => {
      const query = new URLSearchParams({ page: String(page), limit: String(pageSize) });
      if (search.trim()) query.set("search", search.trim());
      if (methodFilter !== "All") query.set("method", methodFilter);
      try {
        const response = await apiRequest<AuditLogResponse>(`/audit-logs?${query.toString()}`);
        setLogs((response.data ?? []).map(mapAuditLog));
        setTotalLogs(response.pagination?.total ?? 0);
      } catch (error) {
        setFeedback(error instanceof Error ? error.message : "Unable to load audit logs.");
      }
    };

    void loadLogs();
  }, [page, pageSize, search, methodFilter]);

  const filteredLogs = logs;

  const getMethodClass = (method: string) => {
    switch (method) {
      case "GET":
        return "method-badge get";

      case "POST":
        return "method-badge post";

      case "PUT":
        return "method-badge put";

      case "DELETE":
        return "method-badge delete";

      default:
        return "method-badge";
    }
  };

  return (
    <div className="admin-page">

      <AdminSidebar />

      <div className="admin-content">

        {/* Header */}
        <div className="admin-header">

          <div>
            <h1>Audit Logs</h1>

            <p>
              Monitor and review administrator activity across the platform.
            </p>
          </div>

        </div>


        {/* Audit Logs Section */}
        <div className="users-section">

          <div className="users-section-header">

            <div>
              <h2>System Activity</h2>

              <p className="section-description">
                A record of permission-gated actions performed on the platform.
              </p>
            </div>

          </div>


          {/* Filters */}
          <div className="audit-filters">

            <div className="audit-search">

              <input
                type="text"
                placeholder="Search logs..."
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
              />

            </div>


            <div className="audit-filter">

              <label>Method</label>

              <select
                value={methodFilter}
                onChange={(event) => {
                  setMethodFilter(event.target.value);
                  setPage(1);
                }}
              >
                <option value="All">All Methods</option>
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="DELETE">DELETE</option>
              </select>

            </div>

          </div>


          {/* Results */}
          <div className="audit-results">

            Showing {Math.min((page - 1) * pageSize + filteredLogs.length, totalLogs)} of {totalLogs} logs

          </div>
          {feedback && <p className="error">{feedback}</p>}


          {/* Table */}
          <TablePagination page={page} pageSize={pageSize} totalRecords={totalLogs} onPageChange={setPage} onPageSizeChange={(size) => { setPageSize(size); setPage(1); }} />

          <div className="table-container">

            <table className="users-table audit-table">

              <thead>

                <tr>
                  <th>Log ID</th>
                  <th>User</th>
                  <th>Permission</th>
                  <th>Resource</th>
                  <th>Method</th>
                  <th>Endpoint</th>
                  <th>IP Address</th>
                  <th>Date / Time</th>
                  <th>Actions</th>
                </tr>

              </thead>


              <tbody>

                {filteredLogs.length > 0 ? (

                  filteredLogs.map((log) => (

                    <tr key={log.id}>

                      <td>
                        <strong className="log-id">
                          #{log.id}
                        </strong>
                      </td>


                      <td>
                        {log.user}
                      </td>


                      <td>
                        <span className="permission-key-badge">
                          {log.permission}
                        </span>
                      </td>


                      <td>

                        <div className="resource-cell">

                          <span>
                            {log.resource}
                          </span>

                          <small>
                            #{log.resourceId}
                          </small>

                        </div>

                      </td>


                      <td>

                        <span
                          className={getMethodClass(
                            log.method
                          )}
                        >
                          {log.method}
                        </span>

                      </td>


                      <td>

                        <span className="endpoint">
                          {log.endpoint}
                        </span>

                      </td>


                      <td>
                        {log.ipAddress}
                      </td>


                      <td>
                        {log.createdAt}
                      </td>


                      <td>

                        <button
                          className="action-btn"
                          onClick={() =>
                            setSelectedLog(log)
                          }
                        >
                          View
                        </button>

                      </td>

                    </tr>

                  ))

                ) : (

                  <tr>

                    <td
                      colSpan={9}
                      className="empty-table"
                    >
                      No audit logs found.
                    </td>

                  </tr>

                )}

              </tbody>

            </table>

          </div>

          <TablePagination page={page} pageSize={pageSize} totalRecords={filteredLogs.length} onPageChange={setPage} onPageSizeChange={(size) => { setPageSize(size); setPage(1); }} />

        </div>

      </div>


      {/* Log Details Modal */}
      {selectedLog && (

        <div
          className="modal-overlay"
          onClick={() => setSelectedLog(null)}
        >

          <div
            className="audit-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <div className="modal-header">

              <div>

                <h2>Audit Log Details</h2>

                <p>
                  #{selectedLog.id}
                </p>

              </div>

              <button
                className="modal-close"
                onClick={() =>
                  setSelectedLog(null)
                }
              >
                ×
              </button>

            </div>


            <div className="audit-details">

              <div className="audit-detail-item">

                <span>User</span>

                <strong>
                  {selectedLog.user}
                </strong>

              </div>


              <div className="audit-detail-item">

                <span>Permission</span>

                <strong>
                  {selectedLog.permission}
                </strong>

              </div>


              <div className="audit-detail-item">

                <span>Resource Type</span>

                <strong>
                  {selectedLog.resource}
                </strong>

              </div>


              <div className="audit-detail-item">

                <span>Resource ID</span>

                <strong>
                  {selectedLog.resourceId}
                </strong>

              </div>


              <div className="audit-detail-item">

                <span>HTTP Method</span>

                <strong>
                  {selectedLog.method}
                </strong>

              </div>


              <div className="audit-detail-item">

                <span>IP Address</span>

                <strong>
                  {selectedLog.ipAddress}
                </strong>

              </div>


              <div className="audit-detail-item full-width">

                <span>Endpoint</span>

                <strong>
                  {selectedLog.endpoint}
                </strong>

              </div>


              <div className="audit-detail-item full-width">

                <span>Date / Time</span>

                <strong>
                  {selectedLog.createdAt}
                </strong>

              </div>


              <div className="audit-metadata">

                <span>Metadata</span>

                <div>
                  {selectedLog.metadata}
                </div>

              </div>

            </div>


            <div className="modal-footer">

              <button
                className="secondary-btn"
                onClick={() =>
                  setSelectedLog(null)
                }
              >
                Close
              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}

export default AuditLogs;