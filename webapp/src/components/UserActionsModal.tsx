import { useState } from "react";

type ManagedUser = {
  id: string;
  name: string;
  email: string;
  phone: string;
  type: string;
  status: string;
};

type RoleOption = { role_id: string; name: string };

type UserActionsModalProps = {
  user: ManagedUser;
  roles: RoleOption[];
  assignedRoles: RoleOption[];
  onClose: () => void;
  onUpdate: (values: Pick<ManagedUser, "name" | "email" | "phone">) => void;
  onSetPassword: (password: string) => void;
  onAssignRole: (roleId: string) => void;
  onRemoveRole: (roleId: string) => void;
  onToggleStatus: () => void;
};

function UserActionsModal({
  user,
  roles,
  assignedRoles,
  onClose,
  onUpdate,
  onSetPassword,
  onAssignRole,
  onRemoveRole,
  onToggleStatus,
}: UserActionsModalProps) {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [phone, setPhone] = useState(user.phone);
  const [roleId, setRoleId] = useState("");
  const [password, setPassword] = useState("");

  const saveProfile = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onUpdate({ name, email, phone });
  };

  const savePassword = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (password.trim()) {
      onSetPassword(password);
      setPassword("");
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="role-modal user-actions-modal" onClick={(event) => event.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2>Manage {user.name}</h2>
            <p>Update this user account and access.</p>
          </div>
          <button className="modal-close" type="button" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          <form onSubmit={saveProfile}>
            <h3 className="actions-section-title">Update details</h3>
            <div className="actions-form-grid">
              <div className="form-group">
                <label htmlFor="user-name">Full Name</label>
                <input id="user-name" value={name} onChange={(event) => setName(event.target.value)} required />
              </div>
              <div className="form-group">
                <label htmlFor="user-email">Email Address</label>
                <input id="user-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
              </div>
              <div className="form-group">
                <label htmlFor="user-phone">Phone Number</label>
                <input id="user-phone" value={phone} onChange={(event) => setPhone(event.target.value)} required />
              </div>
            </div>
            <button className="primary-btn" type="submit">Update User</button>
          </form>

          <div className="action-control-row">
            <div>
              <h3 className="actions-section-title">Assigned roles</h3>
              <select value={roleId} onChange={(event) => setRoleId(event.target.value)}>
                <option value="">Select a role</option>
                {roles.map((role) => (
                  <option key={role.role_id} value={role.role_id}>{role.name}</option>
                ))}
              </select>
            </div>
            <button className="secondary-btn" type="button" disabled={!roleId} onClick={() => {
              onAssignRole(roleId);
              setRoleId("");
            }}>Assign Role</button>
          </div>

          {assignedRoles.map((role) => (
            <div className="action-control-row" key={role.role_id}>
              <span>{role.name}</span>
              <button className="secondary-btn" type="button" onClick={() => onRemoveRole(role.role_id)}>
                Remove Role
              </button>
            </div>
          ))}

          <form className="action-control-row" onSubmit={savePassword}>
            <div>
              <h3 className="actions-section-title">Set password</h3>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter a new password"
                minLength={8}
                required
              />
            </div>
            <button className="secondary-btn" type="submit">Set Password</button>
          </form>

          <div className="account-status-actions">
            <button className="secondary-btn" type="button" onClick={onToggleStatus}>
              {user.status === "Disabled" ? "Enable User" : "Disable User"}
            </button>
          </div>
        </div>

        <div className="modal-footer">
          <button className="secondary-btn" type="button" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

export default UserActionsModal;
