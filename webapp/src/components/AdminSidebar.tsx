import { Link } from "react-router-dom";

function AdminSidebar() {
  return (
    <aside className="admin-sidebar">

      <div className="sidebar-logo">
        <h2>Workhorse</h2>
      </div>


      <nav className="sidebar-nav">

        <Link to="/Dashboard" className="sidebar-link">
          <span>📊</span>
          Dashboard
        </Link>


        <Link to="/Users" className="sidebar-link">
          <span>👥</span>
          Users
        </Link>


        <Link to="/Drivers" className="sidebar-link">
          <span>🚚</span>
          Drivers
        </Link>


        <Link to="/Companies" className="sidebar-link">
          <span>🏢</span>
          Companies
        </Link>


        <Link to="/Requests" className="sidebar-link">
          <span>📦</span>
          Requests
        </Link>


        <Link to="/Trips" className="sidebar-link">
          <span>🚛</span>
          Trips
        </Link>


        <Link to="/Payments" className="sidebar-link">
          <span>💳</span>
          Payments
        </Link>


        <Link to="/Roles" className="sidebar-link">
          <span>🔐</span>
          Roles & Permissions
        </Link>


        <Link to="/AuditLogs" className="sidebar-link">
          <span>📋</span>
          Audit Logs
        </Link>

      </nav>


      <div className="sidebar-bottom">

        <Link to="/Settings" className="sidebar-link">
          <span>⚙️</span>
          Settings
        </Link>


        <Link to="/" className="sidebar-link logout">
          <span>🚪</span>
          Logout
        </Link>

      </div>

    </aside>
  );
}

export default AdminSidebar;