import "../App.css";
import AdminSidebar from "../components/AdminSidebar";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { ReactNode } from "react";
import type { IconType } from "react-icons";
import {
  FiActivity,
  FiArrowRight,
  FiBriefcase,
  FiCheckCircle,
  FiChevronRight,
  FiClock,
  FiDollarSign,
  FiPackage,
  FiTruck,
  FiUserCheck,
  FiUsers,
} from "react-icons/fi";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import FeedbackMessage from "../components/FeedbackMessage";
import { useFeedback } from "../lib/feedback";
import { apiRequest } from "../lib/api";

type CountBy = { count: number };

type AwaitingClient = {
  id: string;
  type: "driver" | "company";
  name: string;
  email: string;
  phone?: string | null;
  waiting_since: string;
  pending_documents: number;
  licence_pending: boolean;
  reference?: string | null;
};

type DashboardSummary = {
  users: number;
  drivers: number;
  companies: number;
  requests: number;
  activeTrips: number;
  pendingVerifications: number;
  awaitingVerification?: AwaitingClient[];
  activity: { log_id: string; actor: string; method: string; endpoint: string; created_at: string }[];
  completedTrips?: number;
  onlineDrivers?: number;
  revenue?: { total: number; last30: number };
  pendingPayments?: { count: number; amount: number };
  currency?: string;
  requestsByStatus?: (CountBy & { status: string })[];
  tripsByStatus?: (CountBy & { status: string })[];
  usersByType?: (CountBy & { type: string })[];
  days?: number;
  daily?: { day: string; requests: number; completedTrips: number; revenue: number }[];
};

// Chart tokens: data in brand navy, recessive grid and axis text.
const CHART = {
  series: "#1c3e70",
  grid: "#e3e7ee",
  axis: "#6b7686",
  fontSize: 11,
};

const humanize = (value: string) => value.replace(/_/g, " ").replace(/^./, (letter) => letter.toUpperCase());

const formatDay = (day: string) =>
  new Date(`${day}T00:00:00`).toLocaleDateString(undefined, { day: "numeric", month: "short" });

const compactNumber = (value: number) =>
  new Intl.NumberFormat(undefined, { notation: "compact", maximumFractionDigits: 1 }).format(value);

function formatMoney(value: number, currency: string, compact = false) {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      notation: compact ? "compact" : "standard",
      maximumFractionDigits: compact ? 1 : 0,
    }).format(value);
  } catch {
    return `${currency} ${value.toLocaleString()}`;
  }
}

const PERIODS = [7, 14, 30, 90];

/** A key figure that links to the page where the records live. */
function StatCard({ icon: Icon, label, value, caption, to }: { icon: IconType; label: string; value: ReactNode; caption?: string; to: string }) {
  return (
    <Link className="dashboard-card dashboard-card-link" to={to}>
      <span className="card-icon"><Icon aria-hidden="true" /></span>
      <div className="stat-body">
        <p className="stat-label">{label}</p>
        <p className="stat-value">{value}</p>
        {caption && <p className="stat-caption">{caption}</p>}
      </div>
      <FiChevronRight className="stat-arrow" aria-hidden="true" />
    </Link>
  );
}

function ChartCard({ title, subtitle, isEmpty, emptyText, to, children }: {
  title: string;
  subtitle: string;
  isEmpty: boolean;
  emptyText: string;
  to?: string;
  children: ReactNode;
}) {
  return (
    <section className="chart-card" aria-label={title}>
      <header className="chart-card-header">
        <div>
          <h2>{title}</h2>
          <p>{subtitle}</p>
        </div>
        {to && <Link className="chart-link" to={to}>View all <FiArrowRight aria-hidden="true" /></Link>}
      </header>
      <div className="chart-body">
        {children}
        {isEmpty && <p className="chart-empty">{emptyText}</p>}
      </div>
    </section>
  );
}

type TooltipEntry = { value?: number | string; payload?: Record<string, unknown> };

function ChartTooltip({ active, payload, label, format, labelFormat }: {
  active?: boolean;
  payload?: TooltipEntry[];
  label?: string | number;
  format: (value: number) => string;
  labelFormat?: (label: string) => string;
}) {
  if (!active || !payload?.length) return null;
  const text = String(label ?? payload[0].payload?.label ?? "");
  return (
    <div className="chart-tooltip">
      <span>{labelFormat ? labelFormat(text) : text}</span>
      <strong>{format(Number(payload[0].value ?? 0))}</strong>
    </div>
  );
}

function BreakdownChart({ title, subtitle, rows, unit, to }: {
  title: string;
  subtitle: string;
  rows: { label: string; count: number }[];
  unit: string;
  to: string;
}) {
  const height = Math.max(140, rows.length * 34 + 20);
  return (
    <ChartCard title={title} subtitle={subtitle} isEmpty={rows.length === 0} emptyText="No data for this period." to={to}>
      {rows.length > 0 && (
        <ResponsiveContainer width="100%" height={height}>
          <BarChart data={rows} layout="vertical" margin={{ top: 4, right: 36, bottom: 4, left: 0 }} barCategoryGap={8}>
            <CartesianGrid horizontal={false} stroke={CHART.grid} />
            <XAxis type="number" allowDecimals={false} tickFormatter={compactNumber} tick={{ fill: CHART.axis, fontSize: CHART.fontSize }} axisLine={false} tickLine={false} />
            <YAxis type="category" dataKey="label" width={96} tick={{ fill: CHART.axis, fontSize: CHART.fontSize }} axisLine={false} tickLine={false} />
            <Tooltip cursor={{ fill: "rgba(28, 62, 112, 0.05)" }} content={<ChartTooltip format={(value) => `${value.toLocaleString()} ${unit}`} />} />
            <Bar dataKey="count" fill={CHART.series} maxBarSize={20} radius={[0, 4, 4, 0]} isAnimationActive={false}>
              <LabelList dataKey="count" position="right" fill={CHART.axis} fontSize={CHART.fontSize} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </ChartCard>
  );
}

const daysSince = (since: string, now: number) => Math.floor((now - new Date(since).getTime()) / 86400000);

function waitingLabel(days: number) {
  if (days <= 0) return "Since today";
  return `Waiting ${days} ${days === 1 ? "day" : "days"}`;
}

/** Drivers and companies waiting to be verified, longest waiting first. */
function VerificationQueue({ clients, total }: { clients: AwaitingClient[]; total: number }) {
  // Read the clock once, when the section first shows.
  const [now] = useState(() => Date.now());
  return (
    <section className="dashboard-section verification-queue" aria-label="Waiting for verification">
      <header className="chart-card-header">
        <div>
          <h2>Waiting for verification</h2>
          <p>Drivers and companies whose onboarding needs review, longest waiting first</p>
        </div>
        <span className="queue-count">{total} waiting</span>
      </header>

      {clients.length === 0 ? (
        <p className="chart-empty-inline">Everyone has been verified.</p>
      ) : (
        <ul className="verification-list">
          {clients.map((client) => {
            const isDriver = client.type === "driver";
            const days = daysSince(client.waiting_since, now);
            const outstanding = isDriver
              ? [
                  client.licence_pending ? "Licence registration" : null,
                  client.pending_documents > 0 ? `${client.pending_documents} ${client.pending_documents === 1 ? "document" : "documents"}` : null,
                ].filter(Boolean)
              : ["Company registration"];
            return (
              <li className="verification-item" key={`${client.type}-${client.id}`}>
                <span className={`verification-icon type-${client.type}`} aria-hidden="true">
                  {isDriver ? <FiUserCheck /> : <FiBriefcase />}
                </span>
                <div className="verification-main">
                  <div className="verification-name">
                    <strong>{client.name}</strong>
                    <span className="verification-type">{isDriver ? "Driver" : "Company"}</span>
                  </div>
                  <span className="verification-contact">
                    {[client.email, client.phone, client.reference].filter(Boolean).join(" · ")}
                  </span>
                </div>
                <div className="verification-outstanding">
                  {(outstanding.length ? outstanding : ["Onboarding review"]).map((item) => (
                    <span className="status-badge status-submitted" key={item}>{item}</span>
                  ))}
                </div>
                <span
                  className={`verification-wait${days > 7 ? " is-overdue" : ""}`}
                  title={new Date(client.waiting_since).toLocaleString()}
                >
                  <FiClock aria-hidden="true" /> {waitingLabel(days)}
                </span>
                <Link
                  className="primary-btn btn-sm"
                  to={`/${isDriver ? "Drivers" : "Companies"}?search=${encodeURIComponent(client.email)}`}
                >
                  Review
                </Link>
              </li>
            );
          })}
        </ul>
      )}
      {total > clients.length && (
        <p className="verification-more">Showing the {clients.length} longest waiting of {total}.</p>
      )}
    </section>
  );
}

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
  const { feedback, notify } = useFeedback();
  const [days, setDays] = useState(14);

  useEffect(() => {
    const loadSummary = async () => {
      try {
        setSummary(await apiRequest<DashboardSummary>(`/dashboard/summary?days=${days}`));
      } catch (error) {
        notify.error(error, "Unable to load dashboard data.");
      }
    };

    void loadSummary();
  }, [days, notify]);

  const currency = summary.currency ?? "NAD";
  const daily = summary.daily ?? [];
  const period = `last ${days} days`;
  const requestsInPeriod = daily.reduce((total, day) => total + day.requests, 0);
  const revenueInPeriod = daily.reduce((total, day) => total + day.revenue, 0);

  return (
    <div className="admin-page">
      <AdminSidebar />

      <div className="admin-content">

        <div className="admin-header">
          <div>
            <h1>Admin Dashboard</h1>
            <p>An overview of activity across the Workhorse platform.</p>
          </div>
        </div>

        {feedback && <FeedbackMessage key={feedback.id} tone={feedback.tone} message={feedback.message} onDismiss={notify.clear} />}

        {/* Key figures */}
        <div className="dashboard-cards">
          <StatCard to="/Users" icon={FiUsers} label="Total users" value={summary.users.toLocaleString()} caption={`${summary.companies.toLocaleString()} companies`} />
          <StatCard to="/Drivers" icon={FiUserCheck} label="Drivers" value={summary.drivers.toLocaleString()} caption={`${(summary.onlineDrivers ?? 0).toLocaleString()} online now`} />
          <StatCard to="/Requests" icon={FiPackage} label="Requests" value={summary.requests.toLocaleString()} caption={`${requestsInPeriod.toLocaleString()} in the ${period}`} />
          <StatCard to="/Trips" icon={FiTruck} label="Active trips" value={summary.activeTrips.toLocaleString()} caption="Accepted and in progress" />
          <StatCard to="/Payments" icon={FiDollarSign} label="Revenue, last 30 days" value={formatMoney(summary.revenue?.last30 ?? 0, currency)} caption={`${formatMoney(summary.revenue?.total ?? 0, currency)} all time`} />
          <StatCard to="/Payments" icon={FiClock} label="Pending payments" value={(summary.pendingPayments?.count ?? 0).toLocaleString()} caption={`${formatMoney(summary.pendingPayments?.amount ?? 0, currency)} outstanding`} />
          <StatCard to="/Trips" icon={FiCheckCircle} label="Completed trips" value={(summary.completedTrips ?? 0).toLocaleString()} caption="Delivered successfully" />
          <StatCard to="/Drivers" icon={FiBriefcase} label="Pending verification" value={summary.pendingVerifications.toLocaleString()} caption="Drivers and companies awaiting review" />
        </div>

        {/* Clients waiting to be verified */}
        <VerificationQueue clients={summary.awaitingVerification ?? []} total={summary.pendingVerifications} />

        {/* Chart filters: one period for every chart below */}
        <div className="chart-filters">
          <h2>Trends</h2>
          <label className="chart-period">
            Period
            <select value={days} onChange={(event) => setDays(Number(event.target.value))}>
              {PERIODS.map((value) => <option key={value} value={value}>Last {value} days</option>)}
            </select>
          </label>
        </div>

        {/* Trends */}
        <div className="dashboard-charts dashboard-charts-2">
          <ChartCard
            title="Requests"
            subtitle={`New transport requests per day, ${period} · ${requestsInPeriod.toLocaleString()} total`}
            isEmpty={requestsInPeriod === 0}
            emptyText={`No requests in the ${period}.`}
            to="/Requests"
          >
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={daily} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
                <CartesianGrid vertical={false} stroke={CHART.grid} />
                <XAxis dataKey="day" tickFormatter={formatDay} tick={{ fill: CHART.axis, fontSize: CHART.fontSize }} axisLine={{ stroke: CHART.grid }} tickLine={false} minTickGap={16} />
                <YAxis allowDecimals={false} tickFormatter={compactNumber} tick={{ fill: CHART.axis, fontSize: CHART.fontSize }} axisLine={false} tickLine={false} />
                <Tooltip cursor={{ stroke: CHART.axis, strokeWidth: 1 }} content={<ChartTooltip labelFormat={formatDay} format={(value) => `${value.toLocaleString()} requests`} />} />
                <Area type="monotone" dataKey="requests" stroke={CHART.series} strokeWidth={2} fill={CHART.series} fillOpacity={0.1} activeDot={{ r: 4, stroke: "#ffffff", strokeWidth: 2 }} isAnimationActive={false} />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard
            title="Revenue"
            subtitle={`Successful payments per day, ${period} · ${formatMoney(revenueInPeriod, currency)} total`}
            isEmpty={revenueInPeriod === 0}
            emptyText={`No payments in the ${period}.`}
            to="/Payments"
          >
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={daily} margin={{ top: 8, right: 8, bottom: 0, left: -8 }}>
                <CartesianGrid vertical={false} stroke={CHART.grid} />
                <XAxis dataKey="day" tickFormatter={formatDay} tick={{ fill: CHART.axis, fontSize: CHART.fontSize }} axisLine={{ stroke: CHART.grid }} tickLine={false} minTickGap={16} />
                <YAxis tickFormatter={(value: number) => formatMoney(value, currency, true)} tick={{ fill: CHART.axis, fontSize: CHART.fontSize }} axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: "rgba(28, 62, 112, 0.05)" }} content={<ChartTooltip labelFormat={formatDay} format={(value) => formatMoney(value, currency)} />} />
                <Bar dataKey="revenue" fill={CHART.series} maxBarSize={24} radius={[4, 4, 0, 0]} isAnimationActive={false} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* Breakdowns */}
        <div className="dashboard-charts dashboard-charts-3">
          <BreakdownChart
            title="Requests by status"
            subtitle={`Requests created in the ${period}`}
            unit="requests"
            to="/Requests"
            rows={(summary.requestsByStatus ?? []).map((row) => ({ label: humanize(row.status), count: row.count }))}
          />
          <BreakdownChart
            title="Trips by status"
            subtitle={`Trips started in the ${period}`}
            unit="trips"
            to="/Trips"
            rows={(summary.tripsByStatus ?? []).map((row) => ({ label: humanize(row.status), count: row.count }))}
          />
          <BreakdownChart
            title="Users by type"
            subtitle="All registered accounts"
            unit="users"
            to="/Users"
            rows={(summary.usersByType ?? []).map((row) => ({ label: humanize(row.type), count: row.count }))}
          />
        </div>

        {/* Recent activity */}
        <section className="dashboard-section">
          <header className="chart-card-header">
            <div>
              <h2>Recent activity</h2>
              <p>The latest actions recorded in the audit log</p>
            </div>
            <Link className="chart-link" to="/AuditLogs">View all <FiArrowRight aria-hidden="true" /></Link>
          </header>

          {summary.activity.length === 0 ? (
            <p className="chart-empty-inline">No recent activity.</p>
          ) : (
            <ul className="activity-list">
              {summary.activity.map((item) => (
                <li className="activity-row" key={item.log_id}>
                  <span className="activity-icon"><FiActivity aria-hidden="true" /></span>
                  <span className="activity-text">
                    <strong>{item.actor}</strong> <span className={`activity-method method-${item.method.toLowerCase()}`}>{item.method}</span> {item.endpoint}
                  </span>
                  <time dateTime={item.created_at}>{new Date(item.created_at).toLocaleString()}</time>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

export default AdminDashboard;
