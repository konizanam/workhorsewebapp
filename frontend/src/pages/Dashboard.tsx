import { useEffect, useState } from "react";
import "../App.css";
import AdminSidebar from "../components/AdminSidebar";
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
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    apiRequest<DashboardSummary>("/dashboard/summary")
      .then(setSummary)
      .catch((requestError: unknown) => setError(requestError instanceof Error ? requestError.message : "Unable to load dashboard."));
  }, []);

  const metrics = [
    ["👥", "Total Users", summary?.users],
    ["🚚", "Drivers", summary?.drivers],
    ["🏢", "Companies", summary?.companies],
    ["📦", "Requests", summary?.requests],
    ["🚛", "Active Trips", summary?.activeTrips],
    ["⏳", "Pending Verification", summary?.pendingVerifications],
  ] as const;

  return (
    <div className="admin-page">
      <AdminSidebar />
      <main className="admin-content">
        <div className="admin-header">
          <div><h1>Admin Dashboard</h1><p>Live platform overview.</p></div>
          <div className="admin-profile"><span>👤</span><span>Admin</span></div>
        </div>
        {error && <FeedbackMessage message={error} tone="error" />}
        <div className="dashboard-cards">
          {metrics.map(([icon, label, value]) => (
            <div className="dashboard-card" key={label}>
              <div className="card-icon">{icon}</div>
              <div><p>{label}</p><h2>{value ?? "-"}</h2></div>
            </div>
          ))}
        </div>
        <section className="dashboard-section">
          <h2>Recent Activity</h2>
          <div className="activity-list">
            {summary?.activity.map((event) => (
              <div className="activity-item" key={event.log_id}>
                <span>{event.method}</span>
                <p>{event.actor} {event.method} {event.endpoint} <small>{new Date(event.created_at).toLocaleString()}</small></p>
              </div>
            ))}
            {!summary?.activity.length && <p>{summary ? "No recent activity." : "Loading activity..."}</p>}
          </div>
        </section>
      </main>
    </div>
  );
}

export default AdminDashboard;
