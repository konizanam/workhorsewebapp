import "../App.css";
import AdminSidebar from "../components/AdminSidebar";

function Companies() {
  return (
    <div className="admin-page">

      <AdminSidebar />

      <div className="admin-content">

        {/* Header */}
        <div className="admin-header">

          <div>
            <h1>Companies</h1>
            <p>Manage registered companies.</p>
          </div>

        </div>


        {/* Companies Table */}
        <div className="users-section">

          <div className="users-section-header">

            <h2>All Companies</h2>

            <button className="btn">
              + Add Company
            </button>

          </div>


          <div className="table-container">

            <table className="users-table">

              <thead>

                <tr>
                  <th>Company Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Registration Number</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>

              </thead>


              <tbody>

                <tr>

                  <td>ABC Construction</td>

                  <td>info@abcconstruction.com</td>

                  <td>0612345678</td>

                  <td>REG-458921</td>

                  <td>
                    <span className="status active">
                      Verified
                    </span>
                  </td>

                  <td>
                    <button className="action-btn">
                      View
                    </button>
                  </td>

                </tr>


                <tr>

                  <td>NamBuild Supplies</td>

                  <td>info@nambuild.com</td>

                  <td>0623456789</td>

                  <td>REG-782341</td>

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

                  <td>Heavy Haul Logistics</td>

                  <td>contact@heavyhaul.com</td>

                  <td>0634567890</td>

                  <td>REG-923451</td>

                  <td>
                    <span className="status active">
                      Verified
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

export default Companies;