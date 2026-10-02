import "../App.css";
import AdminSidebar from "../components/AdminSidebar";
import { useState } from "react";
import ViewDetailsModal from "../components/ViewDetailsModal";
import RecordActionsModal from "../components/RecordActionsModal";
import FeedbackMessage from "../components/FeedbackMessage";
import TablePagination from "../components/TablePagination";
import { apiRequest } from "../lib/api";
import { useApiList } from "../lib/useApiList";

type Payment = {
  payment_id: string;
  trip_id: string;
  customer_id: string;
  method: string;
  amount: number;
  status: string;
  paid_at: string | null;
};

function Payments() {
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [actionPayment, setActionPayment] = useState<Payment | null>(null);
  const [feedback, setFeedback] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const { rows: paymentRows, loading, error, refresh } = useApiList<Payment>("/payments?limit=100");

  const filteredPayments = paymentRows.filter((payment) =>
    Object.values(payment).join(" ").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const savePayment = async (values: Record<string, string>) => {
    if (!actionPayment) return;
    try {
      await apiRequest(`/payments/${actionPayment.payment_id}`, {
        method: "PUT",
        body: JSON.stringify({ method: values.method, amount: Number(values.amount), status: values.status }),
      });
      setActionPayment(null);
      setFeedback("Payment updated successfully.");
      refresh();
    } catch (requestError) {
      setFeedback(requestError instanceof Error ? requestError.message : "Unable to update payment.");
    }
  };

  const refundPayment = async (payment: Payment) => {
    try {
      await apiRequest(`/payments/${payment.payment_id}`, { method: "PUT", body: JSON.stringify({ status: "refunded" }) });
      setActionPayment(null);
      setFeedback("Payment marked as refunded.");
      refresh();
    } catch (requestError) {
      setFeedback(requestError instanceof Error ? requestError.message : "Unable to refund payment.");
    }
  };

  const totalPages = Math.max(1, Math.ceil(filteredPayments.length / pageSize));
  const currentPage = Math.min(page, totalPages);

  return (
    <div className="admin-page">

      <AdminSidebar />

      <div className="admin-content">

        {feedback && <FeedbackMessage message={feedback} />}
        {error && <FeedbackMessage message={error} tone="error" />}

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
            <TablePagination page={currentPage} pageSize={pageSize} totalRecords={filteredPayments.length} onPageChange={setPage} onPageSizeChange={(size) => { setPageSize(size); setPage(1); }} />
          </div>

          <div className="table-container">

            <TablePagination page={currentPage} pageSize={pageSize} totalRecords={filteredPayments.length} onPageChange={setPage} onPageSizeChange={(size) => { setPageSize(size); setPage(1); }} />

            <table className="users-table">

              <thead>

                <tr>
                  <th>Payment ID</th>
                  <th>Trip ID</th>
                  <th>Customer ID</th>
                  <th>Amount</th>
                  <th>Payment Method</th>
                  <th>Status</th>
                  <th>Paid At</th>
                  <th>Actions</th>
                </tr>

              </thead>


              <tbody>

                {loading ? <tr><td colSpan={8}>Loading payments...</td></tr> : filteredPayments.slice((currentPage - 1) * pageSize, currentPage * pageSize).map((payment) => (
                  <tr key={payment.payment_id}>
                    <td>{payment.payment_id}</td>
                    <td>{payment.trip_id}</td>
                    <td>{payment.customer_id}</td>
                    <td>{payment.amount}</td>
                    <td>{payment.method}</td>
                    <td>
                      <span className={`status ${payment.status}`}>
                        {payment.status}
                      </span>
                    </td>
                    <td>{payment.paid_at || "-"}</td>
                    <td>
                      <div className="table-actions"><button className="action-btn" onClick={() => setSelectedPayment(payment)}>View</button><button className="action-btn" onClick={() => setActionPayment(payment)}>Actions</button></div>
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
          title={selectedPayment.payment_id}
          details={{
            "Payment ID": selectedPayment.payment_id,
            "Trip ID": selectedPayment.trip_id,
            "Customer ID": selectedPayment.customer_id,
            Amount: String(selectedPayment.amount),
            Method: selectedPayment.method,
            Status: selectedPayment.status,
            "Paid At": selectedPayment.paid_at || "-",
          }}
          onClose={() => setSelectedPayment(null)}
        />
      )}

      {actionPayment && (
        <RecordActionsModal
          title={`Manage ${actionPayment.payment_id}`}
          values={{ method: actionPayment.method, amount: String(actionPayment.amount), status: actionPayment.status }}
          fields={[
            { key: "method", label: "Payment Method", options: ["cash", "card", "bank_transfer", "mobile", "business_account"] },
            { key: "amount", label: "Amount", type: "number" },
            { key: "status", label: "Status", options: ["pending", "successful", "failed", "refunded"] },
          ]}
          actions={[{ label: "Refund Payment", onClick: () => void refundPayment(actionPayment), danger: true }]}
          onClose={() => setActionPayment(null)}
          onSave={savePayment}
        />
      )}

    </div>
  );
}

export default Payments;