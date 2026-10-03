import "../App.css";
import { useEffect, useState } from "react";
import AdminSidebar from "../components/AdminSidebar";
import AddRecordModal from "../components/AddRecordModal";
import ViewDetailsModal from "../components/ViewDetailsModal";
import UserActionsModal from "../components/UserActionsModal";
import FeedbackMessage from "../components/FeedbackMessage";
import TablePagination from "../components/TablePagination";
import { apiRequest } from "../lib/api";

type User = {
  id: string;
  name: string;
  email: string;
  phone: string;
  type: string;
  status: string;
  twoFactor: string;
};

type ApiUser = {
  user_id: string;
  first_name?: string | null;
  last_name?: string | null;
  name?: string;
  email: string;
  phone_number?: string | null;
  phone?: string;
  user_type?: string;
  type?: string;
  status?: string;
  display_status?: string;
  two_factor_enabled?: boolean;
  two_factor_display?: string;
};

type UserListResponse = { data: ApiUser[] };
type ApiRole = { role_id: string; name: string };

const mapUser = (user: ApiUser): User => ({
  id: user.user_id,
  name: user.name ?? [user.first_name, user.last_name].filter(Boolean).join(" "),
  email: user.email,
  phone: user.phone ?? user.phone_number ?? "",
  type: (user.type ?? user.user_type ?? "").replace(/^./, (letter) => letter.toUpperCase()),
  status: user.display_status ?? (user.status === "disabled" ? "Disabled" : user.status === "active" ? "Active" : "Pending"),
  twoFactor: user.two_factor_display ?? (user.two_factor_enabled ? "Enabled" : "Disabled"),
});

function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [actionUser, setActionUser] = useState<User | null>(null);
  const [feedback, setFeedback] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [roleOptions, setRoleOptions] = useState<ApiRole[]>([]);
  const [assignedRoles, setAssignedRoles] = useState<ApiRole[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const response = await apiRequest<UserListResponse>("/users?limit=100");
        setUsers((response.data ?? []).map(mapUser));
      } catch (error) {
        setFeedback(error instanceof Error ? error.message : "Unable to load users.");
      }
    };

    void loadUsers();
  }, []);

  const filteredUsers = users.filter((user) =>
    [user.name, user.email, user.phone, user.type, user.status, user.twoFactor]
      .join(" ")
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / pageSize));
  const currentPage = Math.min(page, totalPages);

  const addUser = async (values: Record<string, string>) => {
    setIsSaving(true);
    try {
      const created = await apiRequest<ApiUser>("/users", {
        method: "POST",
        body: JSON.stringify(values),
      });
      setUsers((current) => [mapUser(created), ...current]);
      setShowModal(false);
      setFeedback(`${values.name} was saved successfully.`);
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Unable to save the user.");
    } finally {
      setIsSaving(false);
    }
  };

  const openUserActions = async (user: User) => {
    setActionUser(user);
    try {
      const [roles, assigned] = await Promise.all([
        apiRequest<ApiRole[]>("/roles"),
        apiRequest<ApiRole[]>(`/users/${user.id}/roles`),
      ]);
      setRoleOptions(roles);
      setAssignedRoles(assigned);
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Unable to load user roles.");
    }
  };

  const updateUser = async (values: Pick<User, "name" | "email" | "phone">) => {
    if (!actionUser) return;
    try {
      const updated = await apiRequest<ApiUser>(`/users/${actionUser.id}`, {
        method: "PUT",
        body: JSON.stringify(values),
      });
      const mapped = mapUser(updated);
      setUsers((current) => current.map((user) => user.id === mapped.id ? mapped : user));
      setActionUser(mapped);
      setFeedback(`${values.name} was updated.`);
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Unable to update the user.");
    }
  };

  const assignRole = async (roleId: string) => {
    if (!actionUser) return;
    try {
      await apiRequest(`/users/${actionUser.id}/roles`, {
        method: "POST",
        body: JSON.stringify({ role_id: roleId }),
      });
      setAssignedRoles(await apiRequest<ApiRole[]>(`/users/${actionUser.id}/roles`));
      setFeedback("Role assigned successfully.");
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Unable to assign role.");
    }
  };

  const removeRole = async (roleId: string) => {
    if (!actionUser) return;
    try {
      await apiRequest(`/users/${actionUser.id}/roles/${roleId}`, { method: "DELETE" });
      setAssignedRoles((current) => current.filter((role) => role.role_id !== roleId));
      setFeedback("Role removed successfully.");
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Unable to remove role.");
    }
  };

  const setPassword = async (password: string) => {
    if (!actionUser) return;
    try {
      await apiRequest(`/users/${actionUser.id}`, { method: "PUT", body: JSON.stringify({ password }) });
      setFeedback("Password updated successfully.");
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Unable to update password.");
    }
  };

  const toggleUserStatus = async () => {
    if (!actionUser) return;
    const status = actionUser.status === "Disabled" ? "active" : "disabled";
    try {
      const updated = await apiRequest<ApiUser>(`/users/${actionUser.id}`, {
        method: "PUT",
        body: JSON.stringify({ status }),
      });
      const mapped = mapUser(updated);
      setUsers((current) => current.map((user) => user.id === mapped.id ? mapped : user));
      setActionUser(mapped);
      setFeedback(`User ${status === "active" ? "enabled" : "disabled"}.`);
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Unable to update user status.");
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

          {feedback && <FeedbackMessage message={feedback} />}

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
            <button className="btn" onClick={() => setShowModal(true)}>+ Add User</button>
          </div>

          <TablePagination page={currentPage} pageSize={pageSize} totalRecords={filteredUsers.length} onPageChange={setPage} onPageSizeChange={(size) => { setPageSize(size); setPage(1); }} />

          <div className="table-container">

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
                {filteredUsers.slice((currentPage - 1) * pageSize, currentPage * pageSize).map((user) => (
                  <tr key={user.id}>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>{user.phone}</td>
                    <td><span className={`user-type ${user.type.toLowerCase()}`}>{user.type}</span></td>
                    <td><span className={`status ${user.status.toLowerCase()}`}>{user.status}</span></td>
                    <td>{user.twoFactor}</td>
                    <td>
                      <div className="table-actions">
                        <button className="action-btn" onClick={() => setSelectedUser(user)}>View</button>
                        <button className="action-btn" onClick={() => void openUserActions(user)}>Edit</button>
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
            { name: "name", label: "Full Name", placeholder: "e.g. Alex Morgan" },
            { name: "email", label: "Email Address", type: "email", placeholder: "alex@example.com" },
            { name: "phone", label: "Phone Number", type: "tel", placeholder: "0812345678" },
            { name: "type", label: "User Type", options: ["Admin", "Customer", "Driver"] },
          ]}
          onClose={() => setShowModal(false)}
          onSubmit={addUser}
          isSubmitting={isSaving}
        />
      )}

      {selectedUser && (
        <ViewDetailsModal
          title={selectedUser.name}
          details={{
            Email: selectedUser.email,
            Phone: selectedUser.phone,
            "User Type": selectedUser.type,
            Status: selectedUser.status,
            "Two-Factor Authentication": selectedUser.twoFactor,
          }}
          onClose={() => setSelectedUser(null)}
        />
      )}

      {actionUser && (
        <UserActionsModal
          user={actionUser}
          roles={roleOptions}
          assignedRoles={assignedRoles}
          onClose={() => setActionUser(null)}
          onUpdate={updateUser}
          onAssignRole={assignRole}
          onRemoveRole={removeRole}
          onSetPassword={setPassword}
          onToggleStatus={toggleUserStatus}
        />
      )}

    </div>
  );
}

export default Users;