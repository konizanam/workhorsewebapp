import "../App.css";
import AdminSidebar from "../components/AdminSidebar";
import { useEffect, useState } from "react";
import FeedbackMessage from "../components/FeedbackMessage";
import { apiRequest } from "../lib/api";

type DashboardSummary = {
  users: number;
  drivers: number;
  companies: number;
  requests: number;
  activeTrips: number;
  pendingVerifications: number;
  activity: { log_id: string; actor: string; method: string; endpoint: string; created_at: string }[];
};


function AdminDashboard() {
  const [summary, setSummary] = useState<DashboardSummary>({
    users: 0,
    drivers: 0,
    companies: 0,
    requests: 0,
    activeTrips: 0,
    pendingVerifications: 0,
    activity: [],
  });
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    const loadSummary = async () => {
      try {
        setSummary(await apiRequest<DashboardSummary>("/dashboard/summary"));
      } catch (error) {
        setFeedback(error instanceof Error ? error.message : "Unable to load dashboard data.");
      }
    };

    void loadSummary();
  }, []);

  return (
    <div className="admin-page">
      <AdminSidebar />

      <div className="admin-content">
        {feedback && <FeedbackMessage message={feedback} />}

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
              <h2>{summary.users}</h2>
            </div>
          </div>


          <div className="dashboard-card">
            <div className="card-icon">
              🚚
            </div>

            <div>
              <p>Drivers</p>
              <h2>{summary.drivers}</h2>
            </div>
          </div>


          <div className="dashboard-card">
            <div className="card-icon">
              🏢
            </div>

            <div>
              <p>Companies</p>
              <h2>{summary.companies}</h2>
            </div>
          </div>


          <div className="dashboard-card">
            <div className="card-icon">
              📦
            </div>

            <div>
              <p>Requests</p>
              <h2>{summary.requests}</h2>
            </div>
          </div>


          <div className="dashboard-card">
            <div className="card-icon">
              🚛
            </div>

            <div>
              <p>Active Trips</p>
              <h2>{summary.activeTrips}</h2>
            </div>
          </div>


          <div className="dashboard-card">
            <div className="card-icon">
              ⏳
            </div>

            <div>
              <p>Pending Verification</p>
              <h2>{summary.pendingVerifications}</h2>
            </div>
          </div>

        </div>


        {/* Recent Activity */}
        <div className="dashboard-section">

          <h2>Recent Activity</h2>

          <div className="activity-list">
            {summary.activity.length === 0 ? <p>No recent activity.</p> : summary.activity.map((item) => (
              <p key={item.log_id}>
                {item.actor} {item.method} {item.endpoint} · {new Date(item.created_at).toLocaleString()}
              </p>
            ))}
          </div>

        </div>

      </div>

    </div>
  );
}

export default AdminDashboard;