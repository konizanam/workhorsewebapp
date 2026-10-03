import { useEffect, useState } from "react";
import "../App.css";
import AdminSidebar from "../components/AdminSidebar";
import FeedbackMessage from "../components/FeedbackMessage";
import TablePagination from "../components/TablePagination";
import { apiRequest } from "../lib/api";

interface Permission {
  id: string;
  module: string;
  action: string;
  key: string;
}

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: number;
  type: "System" | "Custom";
  status: "Active" | "Inactive";
  isSystem: boolean;
}

type ApiRole = {
  role_id: string;
  name: string;
  description?: string | null;
  is_system: boolean;
  is_active: boolean;
  permission_count?: number;
  permissions?: string[] | { permission_id: string; key: string }[];
};

type ApiModule = {
  module_name: string;
  permissions: { permission_id: string; key: string; action: string }[];
};

type ApiRoleDetail = ApiRole & {
  permissions?: { permission_id: string; key: string }[];
};

const mapRole = (role: ApiRole): Role => ({
  id: role.role_id,
  name: role.name,
  description: role.description ?? "",
  permissions: role.permission_count ?? role.permissions?.length ?? 0,
  type: role.is_system ? "System" : "Custom",
  status: role.is_active ? "Active" : "Inactive",
  isSystem: role.is_system,
});

function RolesPermissions() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);

  const [showModal, setShowModal] = useState(false);

  const [editingRole, setEditingRole] = useState<Role | null>(null);

  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

  const [roleName, setRoleName] = useState("");
  const [description, setDescription] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [feedback, setFeedback] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isSaving, setIsSaving] = useState(false);

  const loadRolesAndPermissions = async () => {
    const [roleRecords, modules] = await Promise.all([
      apiRequest<ApiRole[]>("/roles"),
      apiRequest<ApiModule[]>("/modules"),
    ]);
    setRoles(roleRecords.map(mapRole));
    setPermissions(modules.flatMap((module) => module.permissions.map((permission) => ({
      id: permission.permission_id,
      module: module.module_name,
      action: permission.action,
      key: permission.key,
    }))));
  };

  useEffect(() => {
    let active = true;
    Promise.all([apiRequest<ApiRole[]>("/roles"), apiRequest<ApiModule[]>("/modules")])
      .then(([roleRecords, modules]) => {
        if (!active) return;
        setRoles(roleRecords.map(mapRole));
        setPermissions(modules.flatMap((module) => module.permissions.map((permission) => ({
          id: permission.permission_id,
          module: module.module_name,
          action: permission.action,
          key: permission.key,
        }))));
      })
      .catch((error: unknown) => {
        if (active) setFeedback(error instanceof Error ? error.message : "Unable to load roles and permissions.");
      });
    return () => { active = false; };
  }, []);

  const filteredRoles = roles.filter((role) =>
    [role.name, role.description, role.type, role.status, String(role.permissions)]
      .join(" ")
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.max(1, Math.ceil(filteredRoles.length / pageSize));
  const currentPage = Math.min(page, totalPages);

  const openAddRole = () => {
    setEditingRole(null);
    setRoleName("");
    setDescription("");
    setSelectedPermissions([]);
    setShowModal(true);
  };

  const openEditRole = async (role: Role) => {
    if (role.isSystem) return;
    try {
      const details = await apiRequest<ApiRoleDetail>(`/roles/${role.id}`);
      setEditingRole(role);
      setRoleName(details.name);
      setDescription(details.description ?? "");
      setSelectedPermissions((details.permissions ?? []).map((permission) => permission.permission_id));
      setShowModal(true);
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Unable to load role details.");
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
      setFeedback("Please enter a role name.");
      return;
    }

    setIsSaving(true);
    try {
      if (editingRole) {
        await apiRequest(`/roles/${editingRole.id}`, {
          method: "PUT",
          body: JSON.stringify({ name: roleName, description }),
        });
        await apiRequest(`/roles/${editingRole.id}/permissions`, {
          method: "PUT",
          body: JSON.stringify({ permission_ids: selectedPermissions }),
        });
      } else {
        await apiRequest("/roles", {
          method: "POST",
          body: JSON.stringify({ name: roleName, description, permission_ids: selectedPermissions }),
        });
      }
      await loadRolesAndPermissions();
      closeModal();
      setFeedback(editingRole ? "Role updated successfully." : "Role created successfully.");
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Unable to save the role.");
    } finally {
      setIsSaving(false);
    }
  };

  const toggleRoleStatus = async (role: Role) => {
    if (role.isSystem) return;
    const is_active = role.status !== "Active";
    try {
      await apiRequest(`/roles/${role.id}`, {
        method: "PUT",
        body: JSON.stringify({ is_active }),
      });
      setRoles((current) => current.map((item) =>
        item.id === role.id ? { ...item, status: is_active ? "Active" : "Inactive" } : item
      ));
      setFeedback(`${role.name} ${is_active ? "enabled" : "disabled"}.`);
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Unable to update role status.");
    }
  };

  const modules = [...new Set(permissions.map((permission) => permission.module))];

  return (
    <div className="admin-page">

      <AdminSidebar />

      <div className="admin-content">

        {feedback && <FeedbackMessage message={feedback} tone={feedback.startsWith("Please") || feedback.startsWith("System") ? "error" : "success"} />}

        {/* Header */}
        <div className="admin-header">

          <div>
            <h1>Roles & Permissions</h1>

            <p>
              Manage administrator roles and system permissions.
            </p>
          </div>

        </div>


        {/* Roles Section */}
        <div className="users-section">

          <div className="users-section-header">

            <div>
              <h2>Roles</h2>

              <p className="section-description">
                Create and manage roles assigned to platform administrators.
              </p>
            </div>

          </div>

          <div className="table-toolbar">
            <input
              type="text"
              className="table-search-input"
              placeholder="Search roles..."
              value={searchTerm}
              onChange={(event) => {
                setSearchTerm(event.target.value);
                setPage(1);
              }}
            />
            <button className="primary-btn" onClick={openAddRole}>+ Add Role</button>
          </div>


          <TablePagination page={currentPage} pageSize={pageSize} totalRecords={filteredRoles.length} onPageChange={setPage} onPageSizeChange={(size) => { setPageSize(size); setPage(1); }} />

          <div className="table-container">

            <table className="users-table">

              <thead>
                <tr>
                  <th>Role</th>
                  <th>Description</th>
                  <th>Type</th>
                  <th>Permissions</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>


              <tbody>

                {filteredRoles.slice((currentPage - 1) * pageSize, currentPage * pageSize).map((role) => (

                  <tr key={role.id}>

                    <td>
                      <strong className="role-name">
                        {role.name}
                      </strong>
                    </td>

                    <td>
                      {role.description}
                    </td>

                    <td>

                      <span
                        className={`role-type ${
                          role.type === "System"
                            ? "system"
                            : "custom"
                        }`}
                      >
                        {role.type}
                      </span>

                    </td>

                    <td>
                      <span className="permission-count">
                        {role.permissions}
                      </span>
                    </td>

                    <td>

                      <span className={`status ${role.status === "Active" ? "active" : "pending"}`}>
                        {role.status}
                      </span>

                    </td>

                    <td>

                      <div className="table-actions">

                        <button
                          className="action-btn"
                          onClick={() => openEditRole(role)}
                          disabled={role.isSystem}
                        >
                          Edit
                        </button>

                        <button
                          className="action-btn"
                          onClick={() => void toggleRoleStatus(role)}
                          disabled={role.isSystem}
                        >
                          {role.status === "Active" ? "Disable" : "Enable"}
                        </button>

                      </div>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

          <TablePagination page={page} pageSize={pageSize} totalRecords={roles.length} onPageChange={setPage} onPageSizeChange={(size) => { setPageSize(size); setPage(1); }} />

        </div>


        {/* Permissions Section */}
        <div className="users-section permissions-section">

          <div className="users-section-header">

            <div>

              <h2>Available Permissions</h2>

              <p className="section-description">
                Permissions are created from system modules and actions.
              </p>

            </div>

          </div>


          <div className="permissions-grid">

            {modules.map((module) => {

              const modulePermissions = permissions.filter(
                (permission) =>
                  permission.module === module
              );

              return (

                <div
                  className="permission-card"
                  key={module}
                >

                  <div className="permission-card-header">

                    <div className="permission-icon">
                      🔐
                    </div>

                    <div>
                      <h3>{module}</h3>

                      <span>
                        {modulePermissions.length} permissions
                      </span>
                    </div>

                  </div>


                  <div className="permission-list">

                    {modulePermissions.map(
                      (permission) => (

                        <div
                          className="permission-item"
                          key={permission.id}
                        >

                          <span className="permission-key">
                            {permission.key}
                          </span>

                          <span className="permission-action">
                            {permission.action}
                          </span>

                        </div>

                      )
                    )}

                  </div>

                </div>

              );
            })}

          </div>

        </div>

      </div>


      {/* Add/Edit Role Modal */}
      {showModal && (

        <div
          className="modal-overlay"
          onClick={closeModal}
        >

          <div
            className="role-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <div className="modal-header">

              <div>
                <h2>
                  {editingRole
                    ? "Edit Role"
                    : "Add New Role"}
                </h2>

                <p>
                  Configure the role and its permissions.
                </p>
              </div>

              <button
                className="modal-close"
                onClick={closeModal}
              >
                ×
              </button>

            </div>


            <div className="modal-body">

              <div className="form-group">

                <label>
                  Role Name
                </label>

                <input
                  type="text"
                  value={roleName}
                  onChange={(event) =>
                    setRoleName(event.target.value)
                  }
                  placeholder="e.g. Operations Manager"
                />

              </div>


              <div className="form-group">

                <label>
                  Description
                </label>

                <textarea
                  value={description}
                  onChange={(event) =>
                    setDescription(event.target.value)
                  }
                  placeholder="Describe what this role is responsible for..."
                  rows={3}
                />

              </div>


              <div className="form-group">

                <label>
                  Permissions
                </label>

                <div className="modal-permissions">

                  {permissions.map(
                    (permission) => (

                      <label
                        className="permission-checkbox"
                        key={permission.id}
                      >

                        <input
                          type="checkbox"
                          checked={selectedPermissions.includes(
                            permission.id
                          )}
                          onChange={() =>
                            togglePermission(
                              permission.id
                            )
                          }
                        />

                        <span>
                          {permission.key}
                        </span>

                      </label>

                    )
                  )}

                </div>

              </div>

            </div>


            <div className="modal-footer">

              <button
                className="secondary-btn"
                onClick={closeModal}
              >
                Cancel
              </button>

              <button
                className="primary-btn"
                onClick={() => void saveRole()}
                disabled={isSaving}
              >
                {isSaving ? "Saving..." : editingRole
                  ? "Save Changes"
                  : "Create Role"}
              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}

export default RolesPermissions;