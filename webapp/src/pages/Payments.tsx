import "../App.css";
import AdminSidebar from "../components/AdminSidebar";
import { useState } from "react";
import ViewDetailsModal from "../components/ViewDetailsModal";
import RecordActionsModal from "../components/RecordActionsModal";
import FeedbackMessage from "../components/FeedbackMessage";

function Payments() {
  const [selectedPayment, setSelectedPayment] = useState<Record<string, string> | null>(null);
  const [actionPayment, setActionPayment] = useState<Record<string, string> | null>(null);
  const [feedback, setFeedback] = useState("");

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

                <tr>

                  <td>#PAY-1001</td>

                  <td>#REQ-1002</td>

                  <td>John Smith</td>

                  <td>N$ 2,500.00</td>

                  <td>Card</td>

                  <td>
                    <span className="status active">
                      Completed
                    </span>
                  </td>

                  <td>12 Aug 2026</td>

                  <td>
                    <div className="table-actions"><button className="action-btn" onClick={() => setSelectedPayment({ "Payment ID": "#PAY-1001", "Request ID": "#REQ-1002", Customer: "John Smith", Amount: "N$ 2,500.00", "Payment Method": "Card", Status: "Completed", "Payment Date": "12 Aug 2026" })}>View</button><button className="action-btn" onClick={() => setActionPayment({ "Payment ID": "#PAY-1001", "Request ID": "#REQ-1002", Customer: "John Smith", Amount: "N$ 2,500.00", "Payment Method": "Card", Status: "Completed", "Payment Date": "12 Aug 2026" })}>Actions</button></div>
                  </td>

                </tr>


                <tr>

                  <td>#PAY-1002</td>

                  <td>#REQ-1003</td>

                  <td>Sarah Williams</td>

                  <td>N$ 1,200.00</td>

                  <td>Mobile Money</td>

                  <td>
                    <span className="status pending">
                      Pending
                    </span>
                  </td>

                  <td>12 Aug 2026</td>

                  <td>
                    <div className="table-actions"><button className="action-btn" onClick={() => setSelectedPayment({ "Payment ID": "#PAY-1002", "Request ID": "#REQ-1003", Customer: "Sarah Williams", Amount: "N$ 1,200.00", "Payment Method": "Mobile Money", Status: "Pending", "Payment Date": "12 Aug 2026" })}>View</button><button className="action-btn" onClick={() => setActionPayment({ "Payment ID": "#PAY-1002", "Request ID": "#REQ-1003", Customer: "Sarah Williams", Amount: "N$ 1,200.00", "Payment Method": "Mobile Money", Status: "Pending", "Payment Date": "12 Aug 2026" })}>Actions</button></div>
                  </td>

                </tr>


                <tr>

                  <td>#PAY-1003</td>

                  <td>#REQ-1004</td>

                  <td>ABC Construction</td>

                  <td>N$ 5,800.00</td>

                  <td>Bank Transfer</td>

                  <td>
                    <span className="status active">
                      Completed
                    </span>
                  </td>

                  <td>11 Aug 2026</td>

                  <td>
                    <div className="table-actions"><button className="action-btn" onClick={() => setSelectedPayment({ "Payment ID": "#PAY-1003", "Request ID": "#REQ-1004", Customer: "ABC Construction", Amount: "N$ 5,800.00", "Payment Method": "Bank Transfer", Status: "Completed", "Payment Date": "11 Aug 2026" })}>View</button><button className="action-btn" onClick={() => setActionPayment({ "Payment ID": "#PAY-1003", "Request ID": "#REQ-1004", Customer: "ABC Construction", Amount: "N$ 5,800.00", "Payment Method": "Bank Transfer", Status: "Completed", "Payment Date": "11 Aug 2026" })}>Actions</button></div>
                  </td>

                </tr>


                <tr>

                  <td>#PAY-1004</td>

                  <td>#REQ-1005</td>

                  <td>NamBuild Supplies</td>

                  <td>N$ 3,400.00</td>

                  <td>Card</td>

                  <td>
                    <span className="status pending">
                      Pending
                    </span>
                  </td>

                  <td>11 Aug 2026</td>

                  <td>
                    <div className="table-actions"><button className="action-btn" onClick={() => setSelectedPayment({ "Payment ID": "#PAY-1004", "Request ID": "#REQ-1005", Customer: "NamBuild Supplies", Amount: "N$ 3,400.00", "Payment Method": "Card", Status: "Pending", "Payment Date": "11 Aug 2026" })}>View</button><button className="action-btn" onClick={() => setActionPayment({ "Payment ID": "#PAY-1004", "Request ID": "#REQ-1005", Customer: "NamBuild Supplies", Amount: "N$ 3,400.00", "Payment Method": "Card", Status: "Pending", "Payment Date": "11 Aug 2026" })}>Actions</button></div>
                  </td>

                </tr>

              </tbody>

            </table>

          </div>

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
          actions={[{ label: "Refund Payment", onClick: () => setFeedback("Payment marked for refund.") }, { label: "Delete Payment", onClick: () => { setFeedback("Payment deleted."); setActionPayment(null); }, danger: true }]}
          onClose={() => setActionPayment(null)}
          onSave={(values) => { setFeedback(`${values["Payment ID"]} was updated.`); setActionPayment(null); }}
        />
      )}

    </div>
  );
}

export default Payments;