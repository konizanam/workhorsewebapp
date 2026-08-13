import "../App.css";
import AdminSidebar from "../components/AdminSidebar";

function Drivers() {
  return (
    <div className="admin-page">

      <AdminSidebar />

      <div className="admin-content">

        {/* Header */}
        <div className="admin-header">

          <div>
            <h1>Drivers</h1>
            <p>Manage registered drivers and their status.</p>
          </div>

        </div>


        {/* Drivers Table */}
        <div className="users-section">

          <div className="users-section-header">

            <h2>All Drivers</h2>

            <button className="btn">
              + Add Driver
            </button>

          </div>


          <div className="table-container">

            <table className="users-table">

              <thead>

                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>License Number</th>
                  <th>Rating</th>
                  <th>Availability</th>
                  <th>Actions</th>
                </tr>

              </thead>


              <tbody>

                <tr>

                  <td>Michael Adams</td>

                  <td>michael@example.com</td>

                  <td>0856781234</td>

                  <td>N58921W</td>

                  <td>4.8</td>

                  <td>
                    <span className="status active">
                      Available
                    </span>
                  </td>

                  <td>
                    <button className="action-btn">
                      View
                    </button>
                  </td>

                </tr>


                <tr>

                  <td>David Smith</td>

                  <td>david@example.com</td>

                  <td>0812345678</td>

                  <td>N7841W</td>

                  <td>4.5</td>

                  <td>
                    <span className="status pending">
                      Unavailable
                    </span>
                  </td>

                  <td>
                    <button className="action-btn">
                      View
                    </button>
                  </td>

                </tr>


                <tr>

                  <td>James Wilson</td>

                  <td>james@example.com</td>

                  <td>0823456789</td>

                  <td>N923451W</td>

                  <td>4.9</td>

                  <td>
                    <span className="status active">
                      Available
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

export default Drivers;