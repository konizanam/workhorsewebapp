import "../App.css";
import AdminSidebar from "../components/AdminSidebar";

function Trips() {
  return (
    <div className="admin-page">

      <AdminSidebar />

      <div className="admin-content">

        {/* Header */}
        <div className="admin-header">

          <div>
            <h1>Trips</h1>
            <p>Monitor and manage transport trips.</p>
          </div>

        </div>


        {/* Trips Table */}
        <div className="users-section">

          <div className="users-section-header">

            <h2>All Trips</h2>

          </div>


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

                <tr>

                  <td>#TRIP-1001</td>

                  <td>#REQ-1002</td>

                  <td>Michael Adams</td>

                  <td>N12345W</td>

                  <td>Windhoek</td>

                  <td>Rehoboth</td>

                  <td>
                    <span className="status active">
                      In Progress
                    </span>
                  </td>

                  <td>
                    <button className="action-btn">
                      View
                    </button>
                  </td>

                </tr>


                <tr>

                  <td>#TRIP-1002</td>

                  <td>#REQ-1003</td>

                  <td>James Wilson</td>

                  <td>N67890W</td>

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

                  <td>#TRIP-1003</td>

                  <td>#REQ-1004</td>

                  <td>David Smith</td>

                  <td>N24680W</td>

                  <td>Windhoek</td>

                  <td>Ongwediva</td>

                  <td>
                    <span className="status pending">
                      Assigned
                    </span>
                  </td>

                  <td>
                    <button className="action-btn">
                      View
                    </button>
                  </td>

                </tr>


                <tr>

                  <td>#TRIP-1004</td>

                  <td>#REQ-1005</td>

                  <td>Michael Adams</td>

                  <td>N12345W</td>

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

              </tbody>

            </table>

          </div>

        </div>

      </div>

    </div>
  );
}

export default Trips;