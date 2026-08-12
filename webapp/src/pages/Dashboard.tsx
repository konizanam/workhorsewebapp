import "../App.css";
import AdminSidebar from "../components/AdminSidebar";


function AdminDashboard() {
  return (
    <div className="admin-page">
      <AdminSidebar />

      <div className="admin-content">

        {/* Header */}
        <div className="admin-header">
          <div>
            <h1>Admin Dashboard</h1>
            <p>Welcome back, Admin.</p>
          </div>

          <div className="admin-profile">
            <span>👤</span>
            <span>Admin</span>
          </div>
        </div>


        {/* Statistics */}
        <div className="dashboard-cards">

          <div className="dashboard-card">
            <div className="card-icon">
              👥
            </div>

            <div>
              <p>Total Users</p>
              <h2>1,250</h2>
            </div>
          </div>


          <div className="dashboard-card">
            <div className="card-icon">
              🚚
            </div>

            <div>
              <p>Drivers</p>
              <h2>320</h2>
            </div>
          </div>


          <div className="dashboard-card">
            <div className="card-icon">
              🏢
            </div>

            <div>
              <p>Companies</p>
              <h2>85</h2>
            </div>
          </div>


          <div className="dashboard-card">
            <div className="card-icon">
              📦
            </div>

            <div>
              <p>Requests</p>
              <h2>540</h2>
            </div>
          </div>


          <div className="dashboard-card">
            <div className="card-icon">
              🚛
            </div>

            <div>
              <p>Active Trips</p>
              <h2>42</h2>
            </div>
          </div>


          <div className="dashboard-card">
            <div className="card-icon">
              ⏳
            </div>

            <div>
              <p>Pending Verification</p>
              <h2>18</h2>
            </div>
          </div>

        </div>


        {/* Recent Activity */}
        <div className="dashboard-section">

          <h2>Recent Activity</h2>

          <div className="activity-list">

            <div className="activity-item">
              <span>👤</span>
              <p>New customer registered</p>
            </div>

            <div className="activity-item">
              <span>🚚</span>
              <p>New driver registration submitted</p>
            </div>

            <div className="activity-item">
              <span>📦</span>
              <p>New transport request created</p>
            </div>

            <div className="activity-item">
              <span>🏢</span>
              <p>Company verification pending</p>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}

export default AdminDashboard;