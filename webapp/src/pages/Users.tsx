import "../App.css";
import { useEffect, useState } from "react";
import AdminSidebar from "../components/AdminSidebar";
import AddRecordModal from "../components/AddRecordModal";
import ViewDetailsModal from "../components/ViewDetailsModal";
import UserActionsModal from "../components/UserActionsModal";
import FeedbackMessage from "../components/FeedbackMessage";
import { useFeedback } from "../lib/feedback";
import TablePagination from "../components/TablePagination";
import TableToolbar from "../components/TableToolbar";
import { useTableControls } from "../lib/useTableControls";
import { apiRequest } from "../lib/api";

type User = {
  id: string;
  name: string;
  firstName: string;
  initials: string;
  surname: string;
  email: string;
  phone: string;
  type: string;
  status: string;
  twoFactor: string;
};

type ApiUser = {
  user_id: string;
  first_name?: string | null;
  initials?: string | null;
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
  name: user.name ?? [user.first_name, user.initials, user.last_name].filter(Boolean).join(" "),
  firstName: user.first_name ?? "",
  initials: user.initials ?? "",
  surname: user.last_name ?? "",
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
  const { feedback, notify } = useFeedback();
  const [roleOptions, setRoleOptions] = useState<ApiRole[]>([]);
  const [assignedRoles, setAssignedRoles] = useState<ApiRole[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const response = await apiRequest<UserListResponse>("/users?limit=100");
        setUsers((response.data ?? []).map(mapUser));
      } catch (error) {
        notify.error(error, "Unable to load users.");
      }
    };

    void loadUsers();
  }, [notify]);

  const table = useTableControls(users, {
    searchText: (user) => [user.name, user.email, user.phone, user.type, user.status, user.twoFactor].join(" "),
    filters: [
      { key: "type", label: "User type", allLabel: "All user types", getValue: (user) => user.type },
      { key: "status", label: "Status", allLabel: "All statuses", getValue: (user) => user.status },
      { key: "twoFactor", label: "2FA", allLabel: "All 2FA", getValue: (user) => user.twoFactor },
    ],
  });

  const addUser = async (values: Record<string, string>) => {
    setIsSaving(true);
    try {
      const created = await apiRequest<ApiUser>("/users", {
        method: "POST",
        body: JSON.stringify(values),
      });
      setUsers((current) => [mapUser(created), ...current]);
      setShowModal(false);
      notify.success(`${values.first_name} ${values.last_name} was saved successfully.`);
    } catch (error) {
      notify.error(error, "Unable to save the user.");
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
      notify.error(error, "Unable to load user roles.");
    }
  };

  const updateUser = async (values: { first_name: string; initials: string; last_name: string; email: string; phone: string }) => {
    if (!actionUser) return;
    try {
      const updated = await apiRequest<ApiUser>(`/users/${actionUser.id}`, {
        method: "PUT",
        body: JSON.stringify(values),
      });
      const mapped = mapUser(updated);
      setUsers((current) => current.map((user) => user.id === mapped.id ? mapped : user));
      setActionUser(mapped);
      notify.success(`${values.first_name} ${values.last_name} was updated.`);
    } catch (error) {
      notify.error(error, "Unable to update the user.");
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
      notify.success("Role assigned successfully.");
    } catch (error) {
      notify.error(error, "Unable to assign role.");
    }
  };

  const removeRole = async (roleId: string) => {
    if (!actionUser) return;
    try {
      await apiRequest(`/users/${actionUser.id}/roles/${roleId}`, { method: "DELETE" });
      setAssignedRoles((current) => current.filter((role) => role.role_id !== roleId));
      notify.success("Role removed successfully.");
    } catch (error) {
      notify.error(error, "Unable to remove role.");
    }
  };

  const setPassword = async (password: string) => {
    if (!actionUser) return;
    try {
      await apiRequest(`/users/${actionUser.id}`, { method: "PUT", body: JSON.stringify({ password }) });
      notify.success("Password updated successfully.");
    } catch (error) {
      notify.error(error, "Unable to update password.");
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
      notify.success(`User ${status === "active" ? "enabled" : "disabled"}.`);
    } catch (error) {
      notify.error(error, "Unable to update user status.");
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


        </div>

        {feedback && <FeedbackMessage key={feedback.id} tone={feedback.tone} message={feedback.message} onDismiss={notify.clear} />}


        {/* Users Table */}
        <div className="users-section">

          <div className="users-section-header">

            <h2>All Users</h2>

            <button type="button" className="btn" onClick={() => setShowModal(true)}>+ Add User</button>
          </div>

          <TableToolbar {...table.toolbar} searchPlaceholder="Search users..." />

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
                {table.pageRows.map((user) => (
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

          <TablePagination {...table.pagination} />

        </div>

      </div>

      {showModal && (
        <AddRecordModal
          title="Add New User"
          description="Enter the details for the new user."
          fields={[
            { name: "first_name", label: "First Name", placeholder: "e.g. Alex", section: "Personal details" },
            { name: "initials", label: "Initials", placeholder: "e.g. J.K.", required: false, section: "Personal details" },
            { name: "last_name", label: "Surname", placeholder: "e.g. Morgan", section: "Personal details" },
            { name: "email", label: "Email Address", type: "email", placeholder: "alex@example.com", section: "Contact details" },
            { name: "phone", label: "Phone Number", type: "tel", placeholder: "0812345678", section: "Contact details" },
            { name: "type", label: "User Type", options: ["Admin", "Customer"], section: "Account" },
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