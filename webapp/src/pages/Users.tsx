import "../App.css";
import AdminSidebar from "../components/AdminSidebar";

function Users() {
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


        {/* Users Table */}
        <div className="users-section">

          <div className="users-section-header">

            <h2>All Users</h2>

            <button className="btn">
              + Add User
            </button>

          </div>


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

                <tr>

                  <td>John Smith</td>

                  <td>john@example.com</td>

                  <td>0812345678</td>

                  <td>
                    <span className="user-type customer">
                      Customer
                    </span>
                  </td>

                  <td>
                    <span className="status active">
                      Active
                    </span>
                  </td>

                  <td>Enabled</td>

                  <td>
                    <button className="action-btn">
                      View
                    </button>
                  </td>

                </tr>


                <tr>

                  <td>Michael Adams</td>

                  <td>michael@example.com</td>

                  <td>0856781234</td>

                  <td>
                    <span className="user-type driver">
                      Driver
                    </span>
                  </td>

                  <td>
                    <span className="status active">
                      Active
                    </span>
                  </td>

                  <td>Enabled</td>

                  <td>
                    <button className="action-btn">
                      View
                    </button>
                  </td>

                </tr>


                <tr>

                  <td>Sarah Williams</td>

                  <td>sarah@example.com</td>

                  <td>0823456789</td>

                  <td>
                    <span className="user-type company">
                      Company
                    </span>
                  </td>

                  <td>
                    <span className="status pending">
                      Pending
                    </span>
                  </td>

                  <td>Disabled</td>

                  <td>
                    <button className="action-btn">
                      View
                    </button>
                  </td>

                </tr>


                <tr>

                  <td>Admin User</td>

                  <td>admin@workhorse.com</td>

                  <td>0811111111</td>

                  <td>
                    <span className="user-type admin">
                      Admin
                    </span>
                  </td>

                  <td>
                    <span className="status active">
                      Active
                    </span>
                  </td>

                  <td>Enabled</td>

                  <td>
                    <button className="action-btn">
                      View
                    </button>
                  </td>

                </tr>

              </tbody>

            </table>

          </div>

        </div>

      </div>

    </div>
  );
}

export default Users;