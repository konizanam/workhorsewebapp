import { Link } from "react-router-dom";
import { useState } from "react";

function AdminSidebar() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside className={`admin-sidebar${collapsed ? " collapsed" : ""}`}>

      <div className="sidebar-logo">
        <img src="/logo.png" alt="Workhorse" />
        <button
          className="sidebar-toggle"
          type="button"
          onClick={() => setCollapsed((current) => !current)}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? "»" : "«"}
        </button>
      </div>


      <nav className="sidebar-nav">

        <Link to="/Dashboard" className="sidebar-link">
          <span>📊</span>
          <b>Dashboard</b>
        </Link>


        <Link to="/Users" className="sidebar-link">
          <span>👥</span>
          <b>Users</b>
        </Link>


        <Link to="/Drivers" className="sidebar-link">
          <span>🚚</span>
          <b>Drivers</b>
        </Link>


        <Link to="/Companies" className="sidebar-link">
          <span>🏢</span>
          <b>Companies</b>
        </Link>


        <Link to="/Requests" className="sidebar-link">
          <span>📦</span>
          <b>Requests</b>
        </Link>


        <Link to="/Trips" className="sidebar-link">
          <span>🚛</span>
          <b>Trips</b>
        </Link>


        <Link to="/Payments" className="sidebar-link">
          <span>💳</span>
          <b>Payments</b>
        </Link>


        <Link to="/Roles" className="sidebar-link">
          <span>🔐</span>
          <b>Roles & Permissions</b>
        </Link>


        <Link to="/AuditLogs" className="sidebar-link">
          <span>📋</span>
          <b>Audit Logs</b>
        </Link>

      </nav>


      <div className="sidebar-bottom">

        <Link to="/Settings" className="sidebar-link">
          <span>⚙️</span>
          <b>Settings</b>
        </Link>


        <Link to="/" className="sidebar-link logout">
          <span>🚪</span>
          <b>Logout</b>
        </Link>

      </div>

    </aside>
  );
}

export default AdminSidebar;