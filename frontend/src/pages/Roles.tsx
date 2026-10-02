import { useEffect, useState } from "react";
import "../App.css";
import AdminSidebar from "../components/AdminSidebar";
import FeedbackMessage from "../components/FeedbackMessage";
import TablePagination from "../components/TablePagination";
import { apiRequest } from "../lib/api";
import { useApiList } from "../lib/useApiList";

type Permission = {
  permission_id: string;
  module_name: string;
  key: string;
  action: string;
};

type PermissionModule = {
  module_name: string;
  permissions: Permission[];
};

type RoleRecord = {
  role_id: string;
  name: string;
  description: string | null;
  is_system: boolean;
  is_active: boolean;
  permissions: string[];
};

type RoleDetails = Omit<RoleRecord, "permissions"> & {
  permissions: { permission_id: string; key: string }[];
};

function RolesPermissions() {
  const { rows: roleRecords, loading, error, refresh } = useApiList<RoleRecord>("/roles");
  const [modules, setModules] = useState<PermissionModule[]>([]);
  const [modulesError, setModulesError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingRole, setEditingRole] = useState<RoleRecord | null>(null);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [roleName, setRoleName] = useState("");
  const [description, setDescription] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [feedback, setFeedback] = useState("");
  const [feedbackTone, setFeedbackTone] = useState<"success" | "error">("success");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const permissions = modules.flatMap((module) => module.permissions);
  const roles = roleRecords.map((role) => ({
    ...role,
    description: role.description || "",
    permissionCount: role.permissions.length,
  }));
  const filteredRoles = roles.filter((role) =>
    [role.name, role.description, role.is_system ? "System" : "Custom", role.is_active ? "Active" : "Inactive", String(role.permissionCount)]
      .join(" ")
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );
  const totalPages = Math.max(1, Math.ceil(filteredRoles.length / pageSize));
  const currentPage = Math.min(page, totalPages);

  useEffect(() => {
    apiRequest<PermissionModule[]>("/modules")
      .then(setModules)
      .catch((requestError: unknown) => {
        setModulesError(requestError instanceof Error ? requestError.message : "Unable to load permissions.");
      });
  }, []);

  const openAddRole = () => {
    setEditingRole(null);
    setRoleName("");
    setDescription("");
    setSelectedPermissions([]);
    setShowModal(true);
  };

  const openEditRole = async (role: RoleRecord) => {
    try {
      const details = await apiRequest<RoleDetails>(`/roles/${role.role_id}`);
      setEditingRole(role);
      setRoleName(role.name);
      setDescription(role.description || "");
      setSelectedPermissions(details.permissions.map((permission) => permission.permission_id));
      setShowModal(true);
    } catch (requestError) {
      setFeedbackTone("error");
      setFeedback(requestError instanceof Error ? requestError.message : "Unable to load role.");
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingRole(null);
  };

  const togglePermission = (permissionId: string) => {
    setSelectedPermissions((current) =>
      current.includes(permissionId)
        ? current.filter((id) => id !== permissionId)
        : [...current, permissionId]
    );
  };

  const saveRole = async () => {
    if (!roleName.trim()) {
      setFeedbackTone("error");
      setFeedback("Please enter a role name.");
      return;
    }

    try {
      if (editingRole) {
        await apiRequest(`/roles/${editingRole.role_id}`, {
          method: "PUT",
          body: JSON.stringify({ name: roleName, description }),
        });
        await apiRequest(`/roles/${editingRole.role_id}/permissions`, {
          method: "PUT",
          body: JSON.stringify({ permission_ids: selectedPermissions }),
        });
      } else {
        await apiRequest("/roles", {
          method: "POST",
          body: JSON.stringify({ name: roleName, description, permission_ids: selectedPermissions }),
        });
      }
      closeModal();
      setFeedbackTone("success");
      setFeedback(editingRole ? "Role updated successfully." : "Role created successfully.");
      refresh();
    } catch (requestError) {
      setFeedbackTone("error");
      setFeedback(requestError instanceof Error ? requestError.message : "Unable to save role.");
    }
  };

  const deleteRole = async (role: RoleRecord) => {
    if (!window.confirm(`Delete the ${role.name} role?`)) return;
    try {
      await apiRequest(`/roles/${role.role_id}`, { method: "DELETE" });
      setFeedbackTone("success");
      setFeedback("Role deleted successfully.");
      refresh();
    } catch (requestError) {
      setFeedbackTone("error");
      setFeedback(requestError instanceof Error ? requestError.message : "Unable to delete role.");
    }
  };

  return (
    <div className="admin-page">
      <AdminSidebar />
      <div className="admin-content">
        {feedback && <FeedbackMessage message={feedback} tone={feedbackTone} />}
        {(error || modulesError) && <FeedbackMessage message={error || modulesError} tone="error" />}
        <div className="admin-header">
          <div>
            <h1>Roles &amp; Permissions</h1>
            <p>Manage administrator roles and system permissions.</p>
          </div>
        </div>

        <div className="users-section">
          <div className="users-section-header"><div><h2>Roles</h2></div></div>
          <div className="table-toolbar">
            <input
              type="text"
              className="table-search-input"
              placeholder="Search roles..."
              value={searchTerm}
              onChange={(event) => { setSearchTerm(event.target.value); setPage(1); }}
            />
            <TablePagination page={currentPage} pageSize={pageSize} totalRecords={filteredRoles.length} onPageChange={setPage} onPageSizeChange={(size) => { setPageSize(size); setPage(1); }} />
            <button className="primary-btn" onClick={openAddRole}>+ Add Role</button>
          </div>
          <div className="table-container">
            <table className="users-table">
              <thead><tr><th>Role</th><th>Description</th><th>Type</th><th>Permissions</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {loading ? <tr><td colSpan={6}>Loading roles...</td></tr> : filteredRoles.map((role) => (
                  <tr key={role.role_id}>
                    <td><strong className="role-name">{role.name}</strong></td>
                    <td>{role.description}</td>
                    <td><span className={`role-type ${role.is_system ? "system" : "custom"}`}>{role.is_system ? "System" : "Custom"}</span></td>
                    <td><span className="permission-count">{role.permissionCount}</span></td>
                    <td><span className={`status ${role.is_active ? "active" : "inactive"}`}>{role.is_active ? "Active" : "Inactive"}</span></td>
                    <td><div className="table-actions">
                      <button className="action-btn" onClick={() => void openEditRole(role)} disabled={role.is_system}>Edit</button>
                      <button className="delete-btn" onClick={() => void deleteRole(role)} disabled={role.is_system}>Delete</button>
                    </div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <TablePagination page={currentPage} pageSize={pageSize} totalRecords={filteredRoles.length} onPageChange={setPage} onPageSizeChange={(size) => { setPageSize(size); setPage(1); }} />
        </div>

        <div className="users-section permissions-section">
          <div className="users-section-header"><div><h2>Available Permissions</h2></div></div>
          <div className="permissions-grid">
            {modules.map((module) => (
              <div className="permission-card" key={module.module_name}>
                <div className="permission-card-header"><div className="permission-icon">🔐</div><div><h3>{module.module_name}</h3><span>{module.permissions.length} permissions</span></div></div>
                <div className="permission-list">
                  {module.permissions.map((permission) => (
                    <div className="permission-item" key={permission.permission_id}>
                      <span className="permission-key">{permission.key}</span>
                      <span className="permission-action">{permission.action}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showModal && <div className="modal-overlay" onClick={closeModal}>
        <div className="role-modal" onClick={(event) => event.stopPropagation()}>
          <div className="modal-header"><div><h2>{editingRole ? "Edit Role" : "Add New Role"}</h2><p>Configure the role and its permissions.</p></div><button className="modal-close" onClick={closeModal}>×</button></div>
          <div className="modal-body">
            <div className="form-group"><label>Role Name</label><input value={roleName} onChange={(event) => setRoleName(event.target.value)} required /></div>
            <div className="form-group"><label>Description</label><textarea value={description} onChange={(event) => setDescription(event.target.value)} rows={3} /></div>
            <div className="form-group"><label>Permissions</label><div className="modal-permissions">
              {permissions.map((permission) => <label className="permission-checkbox" key={permission.permission_id}>
                <input type="checkbox" checked={selectedPermissions.includes(permission.permission_id)} onChange={() => togglePermission(permission.permission_id)} />
                <span>{permission.key}</span>
              </label>)}
            </div></div>
          </div>
          <div className="modal-footer"><button className="secondary-btn" onClick={closeModal}>Cancel</button><button className="primary-btn" onClick={() => void saveRole()}>Save Role</button></div>
        </div>
      </div>}
    </div>
  );
}

export default RolesPermissions;
