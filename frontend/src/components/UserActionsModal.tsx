import { useState } from "react";

type ManagedUser = {
  name: string;
  email: string;
  phone: string;
  type: string;
  status: string;
};

type UserActionsModalProps = {
  user: ManagedUser;
  onClose: () => void;
  onUpdate: (values: Pick<ManagedUser, "name" | "email" | "phone">) => void;
  onChangeRole: (role: string) => void;
  onSetPassword: (password: string) => void;
  onDisable: () => void;
  onDelete: () => void;
};

function UserActionsModal({
  user,
  onClose,
  onUpdate,
  onChangeRole,
  onSetPassword,
  onDisable,
  onDelete,
}: UserActionsModalProps) {
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [phone, setPhone] = useState(user.phone);
  const [role, setRole] = useState(user.type);
  const [password, setPassword] = useState("");

  const saveProfile = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onUpdate({ name, email, phone });
  };

  const saveRole = () => {
    onChangeRole(role);
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
              <h3 className="actions-section-title">Change role</h3>
              <select value={role} onChange={(event) => setRole(event.target.value)}>
                <option>Customer</option>
                <option>Driver</option>
                <option>Company</option>
                <option>Admin</option>
              </select>
            </div>
            <button className="secondary-btn" type="button" onClick={saveRole}>Change Role</button>
          </div>

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

          <div className="danger-actions">
            <button className="secondary-btn" type="button" onClick={onDisable} disabled={user.status === "Disabled"}>
              {user.status === "Disabled" ? "User Disabled" : "Disable User"}
            </button>
            <button className="delete-btn" type="button" onClick={() => setShowDeleteConfirmation(true)} disabled={user.status !== "Disabled"}>
              Delete User
            </button>
          </div>
          {user.status !== "Disabled" && <p className="action-help">Disable this user before deleting the account.</p>}
          {showDeleteConfirmation && user.status === "Disabled" && (
            <div className="confirmation-panel">
              <strong>Are you sure you want to delete?</strong>
              <p>This action cannot be undone.</p>
              <div className="confirmation-actions">
                <button className="secondary-btn" type="button" onClick={() => setShowDeleteConfirmation(false)}>Cancel</button>
                <button className="delete-btn" type="button" onClick={onDelete}>Yes, Delete</button>
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="secondary-btn" type="button" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

export default UserActionsModal;
