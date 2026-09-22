import "../App.css";
import { useState } from "react";
import AdminSidebar from "../components/AdminSidebar";
import AddRecordModal from "../components/AddRecordModal";
import ViewDetailsModal from "../components/ViewDetailsModal";
import UserActionsModal from "../components/UserActionsModal";
import FeedbackMessage from "../components/FeedbackMessage";
import TablePagination from "../components/TablePagination";

type User = {
  id: number;
  name: string;
  email: string;
  phone: string;
  type: string;
  status: string;
  twoFactor: string;
};

const initialUsers: User[] = [
  { id: 1, name: "John Smith", email: "john@example.com", phone: "0812345678", type: "Customer", status: "Active", twoFactor: "Enabled" },
  { id: 2, name: "Michael Adams", email: "michael@example.com", phone: "0856781234", type: "Driver", status: "Active", twoFactor: "Enabled" },
  { id: 3, name: "Sarah Williams", email: "sarah@example.com", phone: "0823456789", type: "Company", status: "Pending", twoFactor: "Disabled" },
  { id: 4, name: "Admin User", email: "admin@workhorse.com", phone: "0811111111", type: "Admin", status: "Active", twoFactor: "Enabled" },
];

function Users() {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [actionUser, setActionUser] = useState<User | null>(null);
  const [feedback, setFeedback] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const filteredUsers = users.filter((user) =>
    [user.name, user.email, user.phone, user.type, user.status, user.twoFactor]
      .join(" ")
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / pageSize));
  const currentPage = Math.min(page, totalPages);

  const addUser = (values: Record<string, string>) => {
    setUsers((current) => [
      ...current,
      {
        id: Date.now(),
        name: values.name,
        email: values.email,
        phone: values.phone,
        type: values.type,
        status: "Pending",
        twoFactor: "Disabled",
      },
    ]);
    setShowModal(false);
    setFeedback(`${values.name} was added successfully.`);
  };

  const updateUser = (values: Pick<User, "name" | "email" | "phone">) => {
    setUsers((current) => current.map((user) =>
      user.id === actionUser?.id ? { ...user, ...values } : user
    ));
    setActionUser((current) => current ? { ...current, ...values } : current);
  };

  const changeRole = (type: string) => {
    setUsers((current) => current.map((user) =>
      user.id === actionUser?.id ? { ...user, type } : user
    ));
    setActionUser((current) => current ? { ...current, type } : current);
  };

  const setPassword = () => {
    setFeedback("Password updated successfully.");
  };

  const disableUser = () => {
    setUsers((current) => current.map((user) =>
      user.id === actionUser?.id ? { ...user, status: "Disabled" } : user
    ));
    setActionUser((current) => current ? { ...current, status: "Disabled" } : current);
  };

  const deleteUser = () => {
    if (actionUser?.status !== "Disabled") {
      setFeedback("Disable the user before deleting the account.");
      return;
    }

    setUsers((current) => current.filter((user) => user.id !== actionUser.id));
    setActionUser(null);
    setFeedback("User deleted successfully.");
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
            <TablePagination page={currentPage} pageSize={pageSize} totalRecords={filteredUsers.length} onPageChange={setPage} onPageSizeChange={(size) => { setPageSize(size); setPage(1); }} />
            <button className="btn" onClick={() => setShowModal(true)}>+ Add User</button>
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
            { name: "name", label: "Full Name", placeholder: "e.g. Alex Morgan" },
            { name: "email", label: "Email Address", type: "email", placeholder: "alex@example.com" },
            { name: "phone", label: "Phone Number", type: "tel", placeholder: "0812345678" },
            { name: "type", label: "User Type", placeholder: "e.g. Customer" },
          ]}
          onClose={() => setShowModal(false)}
          onSubmit={addUser}
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
          onClose={() => setActionUser(null)}
          onUpdate={updateUser}
          onChangeRole={changeRole}
          onSetPassword={setPassword}
          onDisable={disableUser}
          onDelete={deleteUser}
        />
      )}

    </div>
  );
}

export default Users;