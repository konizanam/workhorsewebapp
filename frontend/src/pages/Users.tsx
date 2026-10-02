import "../App.css";
import { useState } from "react";
import AdminSidebar from "../components/AdminSidebar";
import AddRecordModal from "../components/AddRecordModal";
import ViewDetailsModal from "../components/ViewDetailsModal";
import RecordActionsModal from "../components/RecordActionsModal";
import FeedbackMessage from "../components/FeedbackMessage";
import TablePagination from "../components/TablePagination";
import { apiRequest } from "../lib/api";
import { useApiList } from "../lib/useApiList";

type User = {
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  email: string;
  phone_number: string | null;
  user_type: string;
  status: string;
  two_factor_enabled: boolean;
};

const fullName = (user: User) => [user.first_name, user.last_name].filter(Boolean).join(" ") || user.email;

function Users() {
  const { rows: users, loading, error, refresh } = useApiList<User>("/users?limit=100");
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [actionUser, setActionUser] = useState<User | null>(null);
  const [feedback, setFeedback] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const filteredUsers = users.filter((user) =>
    [fullName(user), user.email, user.phone_number, user.user_type, user.status, user.two_factor_enabled]
      .join(" ")
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / pageSize));
  const currentPage = Math.min(page, totalPages);

  const addUser = async (values: Record<string, string>) => {
    try {
      const user = await apiRequest<User>("/users", {
        method: "POST",
        body: JSON.stringify({
          user_type: "admin",
          first_name: values.first_name,
          last_name: values.last_name,
          email: values.email,
          phone_number: values.phone_number,
          password: values.password,
        }),
      });
      setShowModal(false);
      setFeedback(`${fullName(user)} was added successfully.`);
      refresh();
    } catch (requestError) {
      setFeedback(requestError instanceof Error ? requestError.message : "Unable to create user.");
    }
  };

  const updateUser = async (values: Record<string, string>) => {
    if (!actionUser) return;
    try {
      await apiRequest(`/users/${actionUser.user_id}`, {
        method: "PUT",
        body: JSON.stringify({
          first_name: values.first_name,
          last_name: values.last_name,
          phone_number: values.phone_number,
          status: values.status,
          two_factor_enabled: values.two_factor_enabled === "true",
        }),
      });
      setActionUser(null);
      setFeedback("User updated successfully.");
      refresh();
    } catch (requestError) {
      setFeedback(requestError instanceof Error ? requestError.message : "Unable to update user.");
    }
  };

  const deleteUser = async () => {
    if (!actionUser) return;
    try {
      await apiRequest(`/users/${actionUser.user_id}`, { method: "DELETE" });
      setActionUser(null);
      setFeedback("User deleted successfully.");
      refresh();
    } catch (requestError) {
      setFeedback(requestError instanceof Error ? requestError.message : "Unable to delete user.");
    }
  };

  return (
    <div className="admin-page">

      <AdminSidebar />

      <div className="admin-content">

        {/* Header */}
        <div className="admin-header">

          <div>
            <h1>Users</h1>
            <p>Manage all registered users.</p>
          </div>

          {feedback && <FeedbackMessage message={feedback} tone={error || feedback.startsWith("Unable") ? "error" : "success"} />}
          {error && <FeedbackMessage message={error} tone="error" />}

        </div>


        {/* Users Table */}
        <div className="users-section">

          <div className="users-section-header">

            <h2>All Users</h2>

          </div>

          <div className="table-toolbar">
            <input
              type="text"
              className="table-search-input"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(event) => {
                setSearchTerm(event.target.value);
                setPage(1);
              }}
            />
            <TablePagination page={currentPage} pageSize={pageSize} totalRecords={filteredUsers.length} onPageChange={setPage} onPageSizeChange={(size) => { setPageSize(size); setPage(1); }} />
            <button className="btn" onClick={() => setShowModal(true)}>+ Add Admin</button>
          </div>

          <div className="table-container">

            <TablePagination page={currentPage} pageSize={pageSize} totalRecords={filteredUsers.length} onPageChange={setPage} onPageSizeChange={(size) => { setPageSize(size); setPage(1); }} />

            <table className="users-table">

              <thead>

                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>User Type</th>
                  <th>Status</th>
                  <th>2FA</th>
                  <th>Actions</th>
                </tr>

              </thead>


              <tbody>
                {loading ? <tr><td colSpan={7}>Loading users...</td></tr> : filteredUsers.slice((currentPage - 1) * pageSize, currentPage * pageSize).map((user) => (
                  <tr key={user.user_id}>
                    <td>{fullName(user)}</td>
                    <td>{user.email}</td>
                    <td>{user.phone_number || "-"}</td>
                    <td><span className={`user-type ${user.user_type}`}>{user.user_type}</span></td>
                    <td><span className={`status ${user.status}`}>{user.status}</span></td>
                    <td>{user.two_factor_enabled ? "Enabled" : "Disabled"}</td>
                    <td>
                      <div className="table-actions">
                        <button className="action-btn" onClick={() => setSelectedUser(user)}>View</button>
                        <button className="action-btn" onClick={() => setActionUser(user)}>Actions</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>

            </table>

          </div>

          <TablePagination page={currentPage} pageSize={pageSize} totalRecords={filteredUsers.length} onPageChange={setPage} onPageSizeChange={(size) => { setPageSize(size); setPage(1); }} />

        </div>

      </div>

      {showModal && (
        <AddRecordModal
          title="Add New User"
          description="Enter the details for the new user."
          fields={[
            { name: "first_name", label: "First Name", placeholder: "Alex" },
            { name: "last_name", label: "Last Name", placeholder: "Morgan" },
            { name: "email", label: "Email Address", type: "email", placeholder: "alex@example.com" },
            { name: "phone_number", label: "Phone Number", type: "tel", placeholder: "0812345678" },
            { name: "password", label: "Temporary Password (8+ characters)", type: "password" },
          ]}
          onClose={() => setShowModal(false)}
          onSubmit={addUser}
        />
      )}

      {selectedUser && (
        <ViewDetailsModal
          title={fullName(selectedUser)}
          details={{
            "User ID": selectedUser.user_id,
            Email: selectedUser.email,
            Phone: selectedUser.phone_number || "-",
            "User Type": selectedUser.user_type,
            Status: selectedUser.status,
            "Two-Factor Authentication": selectedUser.two_factor_enabled ? "Enabled" : "Disabled",
          }}
          onClose={() => setSelectedUser(null)}
        />
      )}

      {actionUser && (
        <RecordActionsModal
          title={`Manage ${fullName(actionUser)}`}
          values={{
            first_name: actionUser.first_name || "",
            last_name: actionUser.last_name || "",
            phone_number: actionUser.phone_number || "",
            status: actionUser.status,
            two_factor_enabled: String(actionUser.two_factor_enabled),
          }}
          fields={[
            { key: "first_name", label: "First Name" },
            { key: "last_name", label: "Last Name" },
            { key: "phone_number", label: "Phone Number" },
            { key: "status", label: "Status", options: ["active", "suspended", "invited"] },
            { key: "two_factor_enabled", label: "Two-Factor Authentication", options: ["true", "false"] },
          ]}
          onClose={() => setActionUser(null)}
          onSave={updateUser}
          actions={[{ label: "Delete User", onClick: deleteUser, danger: true }]}
        />
      )}

    </div>
  );
}

export default Users;