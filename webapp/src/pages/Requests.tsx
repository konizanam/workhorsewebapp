import "../App.css";
import AdminSidebar from "../components/AdminSidebar";

function Requests() {
  return (
    <div className="admin-page">

      <AdminSidebar />

      <div className="admin-content">

        {/* Header */}
        <div className="admin-header">

          <div>
            <h1>Requests</h1>
            <p>Manage transport requests.</p>
          </div>

        </div>


        {/* Requests Table */}
        <div className="users-section">

          <div className="users-section-header">

            <h2>All Requests</h2>

          </div>


          <div className="table-container">

            <table className="users-table">

              <thead>

                <tr>
                  <th>Request ID</th>
                  <th>Customer</th>
                  <th>Service Type</th>
                  <th>Pickup</th>
                  <th>Destination</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>

              </thead>


              <tbody>

                <tr>

                  <td>#REQ-1001</td>

                  <td>John Smith</td>

                  <td>Delivery</td>

                  <td>Windhoek</td>

                  <td>Okahandja</td>

                  <td>
                    <span className="status pending">
                      Pending
                    </span>
                  </td>

                  <td>
                    <button className="action-btn">
                      View
                    </button>
                  </td>

                </tr>


                <tr>

                  <td>#REQ-1002</td>

                  <td>ABC Construction</td>

                  <td>Heavy Transport</td>

                  <td>Windhoek</td>

                  <td>Rehoboth</td>

                  <td>
                    <span className="status active">
                      Accepted
                    </span>
                  </td>

                  <td>
                    <button className="action-btn">
                      View
                    </button>
                  </td>

                </tr>


                <tr>

                  <td>#REQ-1003</td>

                  <td>Sarah Williams</td>

                  <td>Relocation</td>

                  <td>Windhoek</td>

                  <td>Katutura</td>

                  <td>
                    <span className="status active">
                      Completed
                    </span>
                  </td>

                  <td>
                    <button className="action-btn">
                      View
                    </button>
                  </td>

                </tr>


                <tr>

                  <td>#REQ-1004</td>

                  <td>NamBuild Supplies</td>

                  <td>Material Delivery</td>

                  <td>Windhoek</td>

                  <td>Ongwediva</td>

                  <td>
                    <span className="status pending">
                      Pending
                    </span>
                  </td>

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

export default Requests;