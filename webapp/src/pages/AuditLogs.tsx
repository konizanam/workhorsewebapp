import { useState } from "react";
import "../App.css";
import AdminSidebar from "../components/AdminSidebar";

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

const initialLogs: AuditLog[] = [
  {
    id: "LOG-1001",
    user: "Admin User",
    permission: "users:update",
    resource: "Users",
    resourceId: "USR-1005",
    method: "PUT",
    endpoint: "/api/users/USR-1005",
    ipAddress: "192.168.1.10",
    createdAt: "13 Aug 2026, 09:32",
    metadata: "Updated user account status",
  },
  {
    id: "LOG-1002",
    user: "Admin User",
    permission: "drivers:verify",
    resource: "Drivers",
    resourceId: "DRV-1002",
    method: "PUT",
    endpoint: "/api/drivers/DRV-1002/verify",
    ipAddress: "192.168.1.10",
    createdAt: "13 Aug 2026, 09:18",
    metadata: "Driver verification approved",
  },
  {
    id: "LOG-1003",
    user: "Operations Manager",
    permission: "trips:update",
    resource: "Trips",
    resourceId: "TRIP-1001",
    method: "PUT",
    endpoint: "/api/trips/TRIP-1001",
    ipAddress: "192.168.1.25",
    createdAt: "13 Aug 2026, 08:54",
    metadata: "Trip status changed to in_transit",
  },
  {
    id: "LOG-1004",
    user: "Admin User",
    permission: "companies:create",
    resource: "Companies",
    resourceId: "CMP-1004",
    method: "POST",
    endpoint: "/api/companies",
    ipAddress: "192.168.1.10",
    createdAt: "12 Aug 2026, 16:42",
    metadata: "Created new company account",
  },
  {
    id: "LOG-1005",
    user: "Finance Manager",
    permission: "payments:update",
    resource: "Payments",
    resourceId: "PAY-1003",
    method: "PUT",
    endpoint: "/api/payments/PAY-1003",
    ipAddress: "192.168.1.35",
    createdAt: "12 Aug 2026, 15:20",
    metadata: "Payment marked as successful",
  },
  {
    id: "LOG-1006",
    user: "Admin User",
    permission: "vehicles:update",
    resource: "Vehicles",
    resourceId: "VEH-1008",
    method: "PUT",
    endpoint: "/api/vehicles/VEH-1008",
    ipAddress: "192.168.1.10",
    createdAt: "12 Aug 2026, 14:05",
    metadata: "Vehicle information updated",
  },
  {
    id: "LOG-1007",
    user: "Operations Manager",
    permission: "requests:read",
    resource: "Requests",
    resourceId: "REQ-1005",
    method: "GET",
    endpoint: "/api/requests/REQ-1005",
    ipAddress: "192.168.1.25",
    createdAt: "12 Aug 2026, 13:47",
    metadata: "Viewed transport request",
  },
  {
    id: "LOG-1008",
    user: "Admin User",
    permission: "roles:update",
    resource: "Roles",
    resourceId: "ROLE-1002",
    method: "PUT",
    endpoint: "/api/roles/ROLE-1002",
    ipAddress: "192.168.1.10",
    createdAt: "12 Aug 2026, 11:30",
    metadata: "Updated role permissions",
  },
];

function AuditLogs() {
  const [logs] = useState<AuditLog[]>(initialLogs);

  const [search, setSearch] = useState("");

  const [methodFilter, setMethodFilter] = useState("All");

  const [selectedLog, setSelectedLog] =
    useState<AuditLog | null>(null);

  const filteredLogs = logs.filter((log) => {
    const searchValue = search.toLowerCase();

    const matchesSearch =
      log.id.toLowerCase().includes(searchValue) ||
      log.user.toLowerCase().includes(searchValue) ||
      log.permission.toLowerCase().includes(searchValue) ||
      log.resource.toLowerCase().includes(searchValue) ||
      log.resourceId.toLowerCase().includes(searchValue) ||
      log.endpoint.toLowerCase().includes(searchValue) ||
      log.ipAddress.toLowerCase().includes(searchValue);

    const matchesMethod =
      methodFilter === "All" ||
      log.method === methodFilter;

    return matchesSearch && matchesMethod;
  });

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
                onChange={(event) =>
                  setSearch(event.target.value)
                }
              />

            </div>


            <div className="audit-filter">

              <label>Method</label>

              <select
                value={methodFilter}
                onChange={(event) =>
                  setMethodFilter(event.target.value)
                }
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

            Showing {filteredLogs.length} of {logs.length} logs

          </div>


          {/* Table */}
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