import { useState } from "react";
import "../App.css";
import AdminSidebar from "../components/AdminSidebar";
import FeedbackMessage from "../components/FeedbackMessage";
import TablePagination from "../components/TablePagination";
import { useApiList } from "../lib/useApiList";

type AuditLog = {
  log_id: string;
  actor: string;
  permission_key: string | null;
  resource_type: string | null;
  resource_id: string | null;
  method: string | null;
  endpoint: string | null;
  ip_address: string | null;
  metadata: unknown;
  created_at: string;
};

function AuditLogs() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [methodFilter, setMethodFilter] = useState("All");
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const query = new URLSearchParams({ page: String(page), limit: String(pageSize), search, method: methodFilter });
  const { rows: logs, total, loading, error } = useApiList<AuditLog>(`/audit-logs?${query.toString()}`);

  const getMethodClass = (method: string | null) => {
    switch (method) {
      case "GET": return "method-badge get";
      case "POST": return "method-badge post";
      case "PUT": return "method-badge put";
      case "DELETE": return "method-badge delete";
      default: return "method-badge";
    }
  };

  const formatMetadata = (metadata: unknown) => {
    if (metadata == null) return "-";
    return typeof metadata === "string" ? metadata : JSON.stringify(metadata);
  };

  return (
    <div className="admin-page">
      <AdminSidebar />
      <div className="admin-content">
        <div className="admin-header"><div><h1>Audit Logs</h1><p>Monitor and review administrator activity across the platform.</p></div></div>
        {error && <FeedbackMessage message={error} tone="error" />}
        <div className="users-section">
          <div className="users-section-header"><div><h2>System Activity</h2><p className="section-description">A record of permission-gated actions performed on the platform.</p></div></div>
          <div className="audit-filters">
            <div className="audit-search"><input type="text" placeholder="Search logs..." value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} /></div>
            <div className="audit-filter"><label>Method</label><select value={methodFilter} onChange={(event) => { setMethodFilter(event.target.value); setPage(1); }}>
              <option value="All">All Methods</option><option value="GET">GET</option><option value="POST">POST</option><option value="PUT">PUT</option><option value="DELETE">DELETE</option>
            </select></div>
          </div>
          <div className="audit-results">Showing {logs.length} of {total} logs</div>
          <div className="table-container">
            <TablePagination page={page} pageSize={pageSize} totalRecords={total} onPageChange={setPage} onPageSizeChange={(size) => { setPageSize(size); setPage(1); }} />
            <table className="users-table audit-table">
              <thead><tr><th>Log ID</th><th>User</th><th>Permission</th><th>Resource</th><th>Method</th><th>Endpoint</th><th>IP Address</th><th>Date / Time</th><th>Actions</th></tr></thead>
              <tbody>
                {loading ? <tr><td colSpan={9}>Loading audit logs...</td></tr> : logs.length ? logs.map((log) => (
                  <tr key={log.log_id}>
                    <td><strong className="log-id">#{log.log_id}</strong></td>
                    <td>{log.actor}</td>
                    <td><span className="permission-key-badge">{log.permission_key || "-"}</span></td>
                    <td><div className="resource-cell"><span>{log.resource_type || "-"}</span><small>{log.resource_id || "-"}</small></div></td>
                    <td><span className={getMethodClass(log.method)}>{log.method || "-"}</span></td>
                    <td><span className="endpoint">{log.endpoint || "-"}</span></td>
                    <td>{log.ip_address || "-"}</td>
                    <td>{new Date(log.created_at).toLocaleString()}</td>
                    <td><button className="action-btn" onClick={() => setSelectedLog(log)}>View</button></td>
                  </tr>
                )) : <tr><td colSpan={9} className="empty-table">No audit logs found.</td></tr>}
              </tbody>
            </table>
          </div>
          <TablePagination page={page} pageSize={pageSize} totalRecords={total} onPageChange={setPage} onPageSizeChange={(size) => { setPageSize(size); setPage(1); }} />
        </div>
      </div>
      {selectedLog && <div className="modal-overlay" onClick={() => setSelectedLog(null)}>
        <div className="audit-modal" onClick={(event) => event.stopPropagation()}>
          <div className="modal-header"><div><h2>Audit Log Details</h2><p>#{selectedLog.log_id}</p></div><button className="modal-close" onClick={() => setSelectedLog(null)}>×</button></div>
          <div className="audit-details">
            <div className="audit-detail-item"><span>User</span><strong>{selectedLog.actor}</strong></div>
            <div className="audit-detail-item"><span>Permission</span><strong>{selectedLog.permission_key || "-"}</strong></div>
            <div className="audit-detail-item"><span>Resource Type</span><strong>{selectedLog.resource_type || "-"}</strong></div>
            <div className="audit-detail-item"><span>Resource ID</span><strong>{selectedLog.resource_id || "-"}</strong></div>
            <div className="audit-detail-item"><span>HTTP Method</span><strong>{selectedLog.method || "-"}</strong></div>
            <div className="audit-detail-item"><span>IP Address</span><strong>{selectedLog.ip_address || "-"}</strong></div>
            <div className="audit-detail-item full-width"><span>Endpoint</span><strong>{selectedLog.endpoint || "-"}</strong></div>
            <div className="audit-detail-item full-width"><span>Date / Time</span><strong>{new Date(selectedLog.created_at).toLocaleString()}</strong></div>
            <div className="audit-metadata"><span>Metadata</span><div>{formatMetadata(selectedLog.metadata)}</div></div>
          </div>
          <div className="modal-footer"><button className="secondary-btn" onClick={() => setSelectedLog(null)}>Close</button></div>
        </div>
      </div>}
    </div>
  );
}

export default AuditLogs;
