import "../App.css";
import AdminSidebar from "../components/AdminSidebar";
import { useEffect, useState } from "react";
import ViewDetailsModal from "../components/ViewDetailsModal";
import RecordActionsModal from "../components/RecordActionsModal";
import FeedbackMessage from "../components/FeedbackMessage";
import TablePagination from "../components/TablePagination";
import { apiRequest } from "../lib/api";

type ApiPayment = {
  payment_id: string;
  "Payment ID"?: string;
  "Request ID"?: string;
  Customer?: string;
  amount: number | string;
  Amount?: number | string;
  method: string;
  "Payment Method"?: string;
  status: string;
  Status?: string;
  paid_at?: string | null;
  "Payment Date"?: string | null;
};

type PaymentListResponse = { data: ApiPayment[] };

const mapPayment = (payment: ApiPayment): Record<string, string> => ({
  ID: payment.payment_id,
  "Payment ID": payment["Payment ID"] ?? payment.payment_id,
  "Request ID": payment["Request ID"] ?? "",
  Customer: payment.Customer ?? "",
  Amount: String(payment.Amount ?? payment.amount),
  "Payment Method": payment["Payment Method"] ?? payment.method,
  Status: payment.Status ?? (payment.status === "successful" ? "Completed" : payment.status[0].toUpperCase() + payment.status.slice(1)),
  "Payment Date": payment["Payment Date"] ?? payment.paid_at ?? "",
});

function Payments() {
  const [selectedPayment, setSelectedPayment] = useState<Record<string, string> | null>(null);
  const [actionPayment, setActionPayment] = useState<Record<string, string> | null>(null);
  const [feedback, setFeedback] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isSaving, setIsSaving] = useState(false);

  const [paymentRows, setPaymentRows] = useState<Record<string, string>[]>([]);

  useEffect(() => {
    const loadPayments = async () => {
      try {
        const response = await apiRequest<PaymentListResponse>("/payments?limit=100");
        setPaymentRows((response.data ?? []).map(mapPayment));
      } catch (error) {
        setFeedback(error instanceof Error ? error.message : "Unable to load payments.");
      }
    };

    void loadPayments();
  }, []);

  const filteredPayments = paymentRows.filter((payment) =>
    Object.values(payment).join(" ").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.max(1, Math.ceil(filteredPayments.length / pageSize));
  const currentPage = Math.min(page, totalPages);

  const savePayment = async (values: Record<string, string>) => {
    if (!actionPayment) return;
    setIsSaving(true);
    try {
      const updated = await apiRequest<ApiPayment>(`/payments/${actionPayment.ID}`, {
        method: "PUT",
        body: JSON.stringify(values),
      });
      const row = mapPayment({
        ...updated,
        payment_id: updated.payment_id ?? actionPayment.ID,
        Customer: actionPayment.Customer,
        "Request ID": actionPayment["Request ID"],
      });
      setPaymentRows((current) => current.map((payment) => payment.ID === actionPayment.ID ? row : payment));
      setFeedback(`Payment ${actionPayment.ID} was saved.`);
      setActionPayment(null);
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Unable to update the payment.");
    } finally {
      setIsSaving(false);
    }
  };

  const refundPayment = async () => {
    if (!actionPayment) return;
    try {
      const updated = await apiRequest<ApiPayment>(`/payments/${actionPayment.ID}`, {
        method: "PUT",
        body: JSON.stringify({ status: "refunded" }),
      });
      const row = mapPayment({
        ...updated,
        payment_id: updated.payment_id ?? actionPayment.ID,
        Customer: actionPayment.Customer,
        "Request ID": actionPayment["Request ID"],
      });
      setPaymentRows((current) => current.map((payment) => payment.ID === actionPayment.ID ? row : payment));
      setFeedback(`Payment ${actionPayment.ID} was marked for refund.`);
      setActionPayment(null);
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Unable to refund the payment.");
    }
  };

  return (
    <div className="admin-page">

      <AdminSidebar />

      <div className="admin-content">

        {feedback && <FeedbackMessage message={feedback} />}

        {/* Header */}
        <div className="admin-header">

          <div>
            <h1>Payments</h1>
            <p>Monitor and manage customer payments.</p>
          </div>

        </div>


        {/* Payments Table */}
        <div className="users-section">

          <div className="users-section-header">

            <h2>All Payments</h2>

          </div>


          <div className="table-toolbar">
            <input
              type="text"
              className="table-search-input"
              placeholder="Search payments..."
              value={searchTerm}
              onChange={(event) => {
                setSearchTerm(event.target.value);
                setPage(1);
              }}
            />
          </div>

          <TablePagination page={currentPage} pageSize={pageSize} totalRecords={filteredPayments.length} onPageChange={setPage} onPageSizeChange={(size) => { setPageSize(size); setPage(1); }} />

          <div className="table-container">

            <table className="users-table">

              <thead>

                <tr>
                  <th>Payment ID</th>
                  <th>Request ID</th>
                  <th>Customer</th>
                  <th>Amount</th>
                  <th>Payment Method</th>
                  <th>Status</th>
                  <th>Payment Date</th>
                  <th>Actions</th>
                </tr>

              </thead>


              <tbody>

                {filteredPayments.slice((currentPage - 1) * pageSize, currentPage * pageSize).map((payment) => (
                  <tr key={payment["Payment ID"]}>
                    <td>{payment["Payment ID"]}</td>
                    <td>{payment["Request ID"]}</td>
                    <td>{payment.Customer}</td>
                    <td>{payment.Amount}</td>
                    <td>{payment["Payment Method"]}</td>
                    <td>
                      <span className={`status ${payment.Status === "Completed" ? "active" : "pending"}`}>
                        {payment.Status}
                      </span>
                    </td>
                    <td>{payment["Payment Date"]}</td>
                    <td>
                      <div className="table-actions"><button className="action-btn" onClick={() => setSelectedPayment(payment)}>View</button><button className="action-btn" onClick={() => setActionPayment(payment)}>Edit</button></div>
                    </td>
                  </tr>
                ))}

              </tbody>

            </table>

          </div>

          <TablePagination page={currentPage} pageSize={pageSize} totalRecords={filteredPayments.length} onPageChange={setPage} onPageSizeChange={(size) => { setPageSize(size); setPage(1); }} />

        </div>

      </div>

      {selectedPayment && (
        <ViewDetailsModal
          title={selectedPayment["Payment ID"]}
          details={selectedPayment}
          onClose={() => setSelectedPayment(null)}
        />
      )}

      {actionPayment && (
        <RecordActionsModal
          title={`Manage ${actionPayment["Payment ID"]}`}
          values={actionPayment}
          fields={[{ key: "Customer", label: "Customer" }, { key: "Amount", label: "Amount" }, { key: "Payment Method", label: "Payment Method", options: ["Card", "Mobile Money", "Bank Transfer"] }, { key: "Status", label: "Status", options: ["Pending", "Completed", "Failed", "Refunded"] }]}
          actions={[{ label: "Refund Payment", onClick: () => void refundPayment() }]}
          onClose={() => setActionPayment(null)}
          onSave={(values) => void savePayment(values)}
          isSaving={isSaving}
        />
      )}

    </div>
  );
}

export default Payments;