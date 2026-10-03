import "../App.css";
import AdminSidebar from "../components/AdminSidebar";
import { useEffect, useState } from "react";
import ViewDetailsModal from "../components/ViewDetailsModal";
import RecordActionsModal from "../components/RecordActionsModal";
import FeedbackMessage from "../components/FeedbackMessage";
import TablePagination from "../components/TablePagination";
import { apiRequest } from "../lib/api";

const supportStatuses = ["Open", "Resolved", "Cancelled", "Escalated"] as const;
type SupportTicketStatus = typeof supportStatuses[number];
type ApiTicketStatus = "open" | "resolved" | "cancelled" | "escalated";

type ApiTripRecord = {
  trip_id: string;
  request_id?: string | null;
  driver_id?: string | null;
  vehicle_id?: string | null;
  driver_name?: string | null;
  plate_number?: string | null;
  pickup?: string | null;
  destination?: string | null;
  Driver?: string | null;
  Vehicle?: string | null;
  Pickup?: string | null;
  Destination?: string | null;
  "Trip ID"?: string;
  "Request ID"?: string;
  Status?: string;
  status?: string | null;
};

type ApiSupportTicket = {
  ticket_id: string;
  trip_id: string;
  requester_id: string;
  requester_email?: string | null;
  requester_name?: string | null;
  subject: string;
  description: string;
  status: ApiTicketStatus;
  resolution_notes?: string | null;
  created_at: string;
  updated_at?: string;
};

type SupportTicket = {
  id: string;
  tripId: string;
  requester: string;
  email: string;
  subject: string;
  description: string;
  createdAt: string;
  status: SupportTicketStatus;
};

type TripListResponse = {
  data: ApiTripRecord[];
  pagination: { page: number; limit: number; total: number };
};

const toDisplayStatus = (value?: string | null): SupportTicketStatus => {
  switch ((value ?? "open").toLowerCase()) {
    case "resolved":
      return "Resolved";
    case "cancelled":
      return "Cancelled";
    case "escalated":
      return "Escalated";
    default:
      return "Open";
  }
};

const toApiStatus = (value: SupportTicketStatus): ApiTicketStatus => {
  switch (value) {
    case "Resolved":
      return "resolved";
    case "Cancelled":
      return "cancelled";
    case "Escalated":
      return "escalated";
    default:
      return "open";
  }
};

const displayTripStatus = (value?: string | null) => {
  switch ((value ?? "accepted").toLowerCase()) {
    case "accepted":
    case "driver_arriving":
      return "Assigned";
    case "driver_arrived":
    case "loading":
    case "in_transit":
    case "unloading":
      return "In Progress";
    case "completed":
      return "Completed";
    case "cancelled":
      return "Cancelled";
    default:
      return "Pending";
  }
};

const mapTripToRow = (trip: ApiTripRecord): Record<string, string> => ({
  ID: trip.trip_id,
  "Trip ID": trip["Trip ID"] ?? trip.trip_id,
  "Request ID": trip.request_id ?? "—",
  "Driver": trip.Driver ?? trip.driver_name ?? (trip.driver_id ? `Driver ${trip.driver_id.slice(0, 8)}` : "Unassigned"),
  "Vehicle": trip.Vehicle ?? trip.plate_number ?? (trip.vehicle_id ? `Vehicle ${trip.vehicle_id.slice(0, 8)}` : "Unassigned"),
  "Pickup": trip.Pickup ?? trip.pickup ?? "—",
  "Destination": trip.Destination ?? trip.destination ?? "—",
  "Status": displayTripStatus(trip.status),
});

const mapApiTicketToSupportTicket = (ticket: ApiSupportTicket): SupportTicket => ({
  id: ticket.ticket_id,
  tripId: ticket.trip_id,
  requester: ticket.requester_name ?? ticket.requester_email ?? "Trip participant",
  email: ticket.requester_email ?? "",
  subject: ticket.subject,
  description: ticket.description,
  createdAt: ticket.created_at,
  status: toDisplayStatus(ticket.status),
});

function Trips() {
  const [selectedTrip, setSelectedTrip] = useState<Record<string, string> | null>(null);
  const [actionTrip, setActionTrip] = useState<Record<string, string> | null>(null);
  const [ticketTrip, setTicketTrip] = useState<Record<string, string> | null>(null);
  const [feedback, setFeedback] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [tripRows, setTripRows] = useState<Record<string, string>[]>([]);
  const [tripTickets, setTripTickets] = useState<Record<string, SupportTicket[]>>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const loadTrips = async () => {
      try {
        const response = await apiRequest<TripListResponse>("/trips?limit=100");
        setTripRows((response.data ?? []).map(mapTripToRow));
      } catch (error) {
        setFeedback(error instanceof Error ? error.message : "Unable to load trips.");
      }
    };

    void loadTrips();
  }, []);

  useEffect(() => {
    if (!selectedTrip) return;
    const tripId = selectedTrip["Trip ID"];

    const loadTickets = async () => {
      try {
        const response = await apiRequest<ApiSupportTicket[]>(`/trips/${tripId}/tickets`);
        setTripTickets((current) => ({
          ...current,
          [tripId]: (response ?? []).map(mapApiTicketToSupportTicket),
        }));
      } catch (error) {
        setFeedback(error instanceof Error ? error.message : "Unable to load support tickets.");
      }
    };

    void loadTickets();
  }, [selectedTrip]);

  const createSupportTicket = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!ticketTrip) return;

    const form = new FormData(event.currentTarget);
    const subject = String(form.get("subject") ?? "").trim();
    const description = String(form.get("description") ?? "").trim();
    const requester = String(form.get("requester") ?? "").trim();
    const email = String(form.get("email") ?? "").trim();

    if (!subject || !description) {
      setFeedback("Subject and description are required.");
      return;
    }

    const tripId = ticketTrip["Trip ID"];

    try {
      const createdTicket = await apiRequest<ApiSupportTicket>(`/trips/${tripId}/tickets`, {
        method: "POST",
        body: JSON.stringify({ subject, description, requester, email }),
      });

      const nextTicket = mapApiTicketToSupportTicket({
        ...createdTicket,
        requester_email: createdTicket.requester_email || email,
        requester_name: createdTicket.requester_name || requester,
      });

      setTripTickets((current) => ({
        ...current,
        [tripId]: [nextTicket, ...(current[tripId] ?? [])],
      }));
      setFeedback(`Ticket ${nextTicket.id} was submitted for trip ${tripId}.`);
      setTicketTrip(null);
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Unable to submit the ticket.");
    }
  };

  const saveTrip = async (values: Record<string, string>, cancel = false) => {
    if (!actionTrip) return;
    setIsSaving(true);
    const nextValues = { ...values, Status: cancel ? "Cancelled" : values.Status };
    try {
      const updated = await apiRequest<ApiTripRecord>(`/trips/${actionTrip.ID}`, {
        method: "PUT",
        body: JSON.stringify(nextValues),
      });
      const row = mapTripToRow(updated);
      setTripRows((current) => current.map((trip) => trip.ID === actionTrip.ID ? row : trip));
      setFeedback(cancel ? `Trip ${actionTrip["Trip ID"]} was cancelled.` : `Trip ${actionTrip["Trip ID"]} was saved.`);
      setActionTrip(null);
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Unable to update the trip.");
    } finally {
      setIsSaving(false);
    }
  };

  const updateTicketStatus = async (ticketId: string, status: SupportTicketStatus) => {
    const tripId = selectedTrip?.["Trip ID"];
    if (!tripId) return;

    const currentTicket = (tripTickets[tripId] ?? []).find((ticket) => ticket.id === ticketId);
    if (!currentTicket || currentTicket.status === "Escalated") return;

    try {
      const updatedTicket = await apiRequest<ApiSupportTicket>(`/trips/${tripId}/tickets/${ticketId}`, {
        method: "PUT",
        body: JSON.stringify({ status: toApiStatus(status) }),
      });

      setTripTickets((current) => ({
        ...current,
        [tripId]: (current[tripId] ?? []).map((ticket) =>
          ticket.id === ticketId ? mapApiTicketToSupportTicket(updatedTicket) : ticket
        ),
      }));

      setFeedback(
        status === "Escalated"
          ? `Ticket ${ticketId} was escalated into a support case.`
          : `Ticket ${ticketId} was marked ${status.toLowerCase()}.`
      );
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Unable to update the ticket status.");
    }
  };

  const filteredTrips = tripRows.filter((trip) =>
    Object.values(trip).join(" ").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.max(1, Math.ceil(filteredTrips.length / pageSize));
  const currentPage = Math.min(page, totalPages);

  const selectedTripTickets = selectedTrip ? tripTickets[selectedTrip["Trip ID"]] ?? [] : [];

  return (
    <div className="admin-page">
      <AdminSidebar />

      <div className="admin-content">
        {feedback && <FeedbackMessage message={feedback} />}

        <div className="admin-header">
          <div>
            <h1>Trips</h1>
            <p>Monitor and manage transport trips.</p>
          </div>
        </div>

        <div className="users-section">
          <div className="users-section-header">
            <h2>All Trips</h2>
          </div>

          <div className="table-toolbar">
            <input
              type="text"
              className="table-search-input"
              placeholder="Search trips..."
              value={searchTerm}
              onChange={(event) => {
                setSearchTerm(event.target.value);
                setPage(1);
              }}
            />
          </div>

          <TablePagination page={currentPage} pageSize={pageSize} totalRecords={filteredTrips.length} onPageChange={setPage} onPageSizeChange={(size) => { setPageSize(size); setPage(1); }} />

          <div className="table-container">
            <table className="users-table">
              <thead>
                <tr>
                  <th>Trip ID</th>
                  <th>Request ID</th>
                  <th>Driver</th>
                  <th>Vehicle</th>
                  <th>Pickup</th>
                  <th>Destination</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredTrips.slice((currentPage - 1) * pageSize, currentPage * pageSize).map((trip) => (
                  <tr key={trip["Trip ID"]}>
                    <td>{trip["Trip ID"]}</td>
                    <td>{trip["Request ID"]}</td>
                    <td>{trip.Driver}</td>
                    <td>{trip.Vehicle}</td>
                    <td>{trip.Pickup}</td>
                    <td>{trip.Destination}</td>
                    <td>
                      <span className={`status ${trip.Status === "Completed" || trip.Status === "In Progress" ? "active" : "pending"}`}>
                        {trip.Status}
                      </span>
                    </td>
                    <td>
                      <div className="table-actions">
                        <button className="action-btn" onClick={() => setSelectedTrip(trip)}>View</button>
                        <button className="action-btn" onClick={() => trip.Status === "Completed" ? window.alert("You cannot edit a completed trip.") : setActionTrip(trip)}>Edit</button>
                        <button className="action-btn" onClick={() => setTicketTrip(trip)}>Support ticket</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <TablePagination page={currentPage} pageSize={pageSize} totalRecords={filteredTrips.length} onPageChange={setPage} onPageSizeChange={(size) => { setPageSize(size); setPage(1); }} />
        </div>
      </div>

      {selectedTrip && (
        <ViewDetailsModal
          title={selectedTrip["Trip ID"]}
          details={selectedTrip}
          onClose={() => setSelectedTrip(null)}
        >
          <section className="driver-cases support-ticket-section">
            <div className="driver-cases-header">
              <div>
                <h3>Support tickets</h3>
                <p>Tickets and escalation updates for this trip.</p>
              </div>
              <button className="action-btn" type="button" onClick={() => setTicketTrip(selectedTrip)}>New ticket</button>
            </div>

            {selectedTripTickets.length > 0 ? (
              <div className="table-container">
                <table className="users-table cases-table support-ticket-table">
                  <thead>
                    <tr>
                      <th>Ticket</th>
                      <th>Requester</th>
                      <th>Submitted</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedTripTickets.map((ticket) => (
                      <tr key={ticket.id}>
                        <td>
                          <strong>{ticket.subject}</strong>
                          <br />
                          <small>{ticket.id}</small>
                          <p>{ticket.description}</p>
                        </td>
                        <td>
                          {ticket.requester}
                          <br />
                          <small>{ticket.email}</small>
                        </td>
                        <td>{new Date(ticket.createdAt).toLocaleString()}</td>
                        <td>
                          <select
                            aria-label={`Status for ${ticket.id}`}
                            className="case-status-select"
                            value={ticket.status}
                            disabled={ticket.status === "Escalated"}
                            onChange={(event) => void updateTicketStatus(ticket.id, event.target.value as SupportTicketStatus)}
                          >
                            {supportStatuses.map((status) => (
                              <option key={status} value={status} disabled={status === "Open"}>{status}</option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="cases-empty">No support tickets for this trip yet.</p>
            )}
          </section>
        </ViewDetailsModal>
      )}

      {ticketTrip && (
        <div className="modal-overlay" onClick={() => setTicketTrip(null)}>
          <form
            className="role-modal support-ticket-form"
            role="dialog"
            aria-modal="true"
            aria-labelledby="support-ticket-title"
            onClick={(event) => event.stopPropagation()}
            onSubmit={(event) => void createSupportTicket(event)}
          >
            <div className="modal-header">
              <div>
                <h2 id="support-ticket-title">New support ticket</h2>
                <p>Trip {ticketTrip["Trip ID"]}</p>
              </div>
              <button className="modal-close" type="button" onClick={() => setTicketTrip(null)}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label htmlFor="support-requester">Your name</label>
                <input id="support-requester" name="requester" required />
              </div>
              <div className="form-group">
                <label htmlFor="support-email">Email</label>
                <input id="support-email" name="email" type="email" required />
              </div>
              <div className="form-group">
                <label htmlFor="support-subject">Subject</label>
                <input id="support-subject" name="subject" required maxLength={120} />
              </div>
              <div className="form-group">
                <label htmlFor="support-description">What happened?</label>
                <textarea id="support-description" name="description" required maxLength={2000} rows={5} />
              </div>
            </div>
            <div className="modal-footer">
              <button className="secondary-btn" type="button" onClick={() => setTicketTrip(null)}>Cancel</button>
              <button className="primary-btn" type="submit">Submit ticket</button>
            </div>
          </form>
        </div>
      )}

      {actionTrip && (
        <RecordActionsModal
          title={`Manage ${actionTrip["Trip ID"]}`}
          values={actionTrip}
          fields={[
            { key: "Driver", label: "Driver" },
            { key: "Vehicle", label: "Vehicle" },
            { key: "Pickup", label: "Pickup", type: "location" },
            { key: "Destination", label: "Destination", type: "location" },
            { key: "Status", label: "Status", options: ["Pending", "Assigned", "In Progress", "Completed", "Cancelled"] },
          ]}
          actions={[{ label: "Cancel Trip", onClick: () => void saveTrip(actionTrip, true) }]}
          onClose={() => setActionTrip(null)}
          onSave={(values) => void saveTrip(values)}
          isSaving={isSaving}
        />
      )}
    </div>
  );
}

export default Trips;