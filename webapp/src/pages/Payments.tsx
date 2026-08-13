import "../App.css";
import AdminSidebar from "../components/AdminSidebar";

function Payments() {
  return (
    <div className="admin-page">

      <AdminSidebar />

      <div className="admin-content">

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
                    <button className="action-btn">
                      View
                    </button>
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
                    <button className="action-btn">
                      View
                    </button>
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
                    <button className="action-btn">
                      View
                    </button>
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
                    <button className="action-btn">
                      View
                    </button>
                  </td>

                </tr>

              </tbody>

            </table>

          </div>

        </div>

      </div>

    </div>
  );
}

export default Payments;