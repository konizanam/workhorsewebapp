import "../App.css";
import AdminSidebar from "../components/AdminSidebar";
import { useState } from "react";
import ViewDetailsModal from "../components/ViewDetailsModal";
import RecordActionsModal from "../components/RecordActionsModal";
import FeedbackMessage from "../components/FeedbackMessage";
import TablePagination from "../components/TablePagination";

function Payments() {
  const [selectedPayment, setSelectedPayment] = useState<Record<string, string> | null>(null);
  const [actionPayment, setActionPayment] = useState<Record<string, string> | null>(null);
  const [feedback, setFeedback] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const paymentRows: Record<string, string>[] = [];

  const filteredPayments = paymentRows.filter((payment) =>
    Object.values(payment).join(" ").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.max(1, Math.ceil(filteredPayments.length / pageSize));
  const currentPage = Math.min(page, totalPages);

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
          actions={[{ label: "Refund Payment", onClick: () => setFeedback("Payment marked for refund.") }]}
          onClose={() => setActionPayment(null)}
          onSave={(values) => { setFeedback(`${values["Payment ID"]} was updated.`); setActionPayment(null); }}
        />
      )}

    </div>
  );
}

export default Payments;