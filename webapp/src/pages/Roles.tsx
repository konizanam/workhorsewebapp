import { useState } from "react";
import "../App.css";
import AdminSidebar from "../components/AdminSidebar";

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
}

const permissions: Permission[] = [
  {
    id: "1",
    module: "Users",
    action: "Create",
    key: "users:create",
  },
  {
    id: "2",
    module: "Users",
    action: "Read",
    key: "users:read",
  },
  {
    id: "3",
    module: "Users",
    action: "Update",
    key: "users:update",
  },
  {
    id: "4",
    module: "Users",
    action: "Delete",
    key: "users:delete",
  },

  {
    id: "5",
    module: "Drivers",
    action: "Create",
    key: "drivers:create",
  },
  {
    id: "6",
    module: "Drivers",
    action: "Read",
    key: "drivers:read",
  },
  {
    id: "7",
    module: "Drivers",
    action: "Update",
    key: "drivers:update",
  },
  {
    id: "8",
    module: "Drivers",
    action: "Delete",
    key: "drivers:delete",
  },

  {
    id: "9",
    module: "Companies",
    action: "Create",
    key: "companies:create",
  },
  {
    id: "10",
    module: "Companies",
    action: "Read",
    key: "companies:read",
  },
  {
    id: "11",
    module: "Companies",
    action: "Update",
    key: "companies:update",
  },
  {
    id: "12",
    module: "Companies",
    action: "Delete",
    key: "companies:delete",
  },

  {
    id: "13",
    module: "Vehicles",
    action: "Create",
    key: "vehicles:create",
  },
  {
    id: "14",
    module: "Vehicles",
    action: "Read",
    key: "vehicles:read",
  },
  {
    id: "15",
    module: "Vehicles",
    action: "Update",
    key: "vehicles:update",
  },
  {
    id: "16",
    module: "Vehicles",
    action: "Delete",
    key: "vehicles:delete",
  },

  {
    id: "17",
    module: "Requests",
    action: "Create",
    key: "requests:create",
  },
  {
    id: "18",
    module: "Requests",
    action: "Read",
    key: "requests:read",
  },
  {
    id: "19",
    module: "Requests",
    action: "Update",
    key: "requests:update",
  },
  {
    id: "20",
    module: "Requests",
    action: "Delete",
    key: "requests:delete",
  },

  {
    id: "21",
    module: "Trips",
    action: "Create",
    key: "trips:create",
  },
  {
    id: "22",
    module: "Trips",
    action: "Read",
    key: "trips:read",
  },
  {
    id: "23",
    module: "Trips",
    action: "Update",
    key: "trips:update",
  },
  {
    id: "24",
    module: "Trips",
    action: "Delete",
    key: "trips:delete",
  },

  {
    id: "25",
    module: "Payments",
    action: "Read",
    key: "payments:read",
  },
  {
    id: "26",
    module: "Payments",
    action: "Update",
    key: "payments:update",
  },

  {
    id: "27",
    module: "Audit Logs",
    action: "Read",
    key: "audit_logs:read",
  },
];

const initialRoles: Role[] = [
  {
    id: "1",
    name: "Super Admin",
    description: "Full access to all platform features.",
    permissions: 27,
    type: "System",
    status: "Active",
  },
  {
    id: "2",
    name: "Administrator",
    description: "Manages users, drivers, companies and trips.",
    permissions: 20,
    type: "System",
    status: "Active",
  },
  {
    id: "3",
    name: "Operations Manager",
    description: "Manages requests, trips and drivers.",
    permissions: 14,
    type: "Custom",
    status: "Active",
  },
  {
    id: "4",
    name: "Finance Manager",
    description: "Manages payments and financial records.",
    permissions: 6,
    type: "Custom",
    status: "Active",
  },
];

function RolesPermissions() {
  const [roles, setRoles] = useState<Role[]>(initialRoles);

  const [showModal, setShowModal] = useState(false);

  const [editingRole, setEditingRole] = useState<Role | null>(null);

  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

  const [roleName, setRoleName] = useState("");
  const [description, setDescription] = useState("");

  const openAddRole = () => {
    setEditingRole(null);
    setRoleName("");
    setDescription("");
    setSelectedPermissions([]);
    setShowModal(true);
  };

  const openEditRole = (role: Role) => {
    setEditingRole(role);
    setRoleName(role.name);
    setDescription(role.description);

    const rolePermissions = permissions
      .slice(0, role.permissions)
      .map((permission) => permission.id);

    setSelectedPermissions(rolePermissions);

    setShowModal(true);
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

  const saveRole = () => {
    if (!roleName.trim()) {
      alert("Please enter a role name.");
      return;
    }

    if (editingRole) {
      setRoles((current) =>
        current.map((role) =>
          role.id === editingRole.id
            ? {
                ...role,
                name: roleName,
                description,
                permissions: selectedPermissions.length,
              }
            : role
        )
      );
    } else {
      const newRole: Role = {
        id: Date.now().toString(),
        name: roleName,
        description,
        permissions: selectedPermissions.length,
        type: "Custom",
        status: "Active",
      };

      setRoles((current) => [...current, newRole]);
    }

    closeModal();
  };

  const deleteRole = (role: Role) => {
    if (role.type === "System") {
      alert("System roles cannot be deleted.");
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete the "${role.name}" role?`
    );

    if (confirmed) {
      setRoles((current) =>
        current.filter((item) => item.id !== role.id)
      );
    }
  };

  const modules = [...new Set(permissions.map((permission) => permission.module))];

  return (
    <div className="admin-page">

      <AdminSidebar />

      <div className="admin-content">

        {/* Header */}
        <div className="admin-header">

          <div>
            <h1>Roles & Permissions</h1>

            <p>
              Manage administrator roles and system permissions.
            </p>
          </div>

          <button
            className="primary-btn"
            onClick={openAddRole}
          >
            + Add Role
          </button>

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

                {roles.map((role) => (

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

                      <span className="status active">
                        {role.status}
                      </span>

                    </td>

                    <td>

                      <div className="table-actions">

                        <button
                          className="action-btn"
                          onClick={() => openEditRole(role)}
                        >
                          Edit
                        </button>

                        <button
                          className="delete-btn"
                          onClick={() => deleteRole(role)}
                        >
                          Delete
                        </button>

                      </div>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

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
                onClick={saveRole}
              >
                {editingRole
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