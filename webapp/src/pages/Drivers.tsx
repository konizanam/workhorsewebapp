import "../App.css";
import { useState } from "react";
import AdminSidebar from "../components/AdminSidebar";
import AddRecordModal from "../components/AddRecordModal";

function Drivers() {
  const [showModal, setShowModal] = useState(false);

  const addDriver = (values: Record<string, string>) => {
    setShowModal(false);
    alert(`${values.name} was added as a driver.`);
  };

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

            <button className="btn" onClick={() => setShowModal(true)}>
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

      {showModal && (
        <AddRecordModal
          title="Add New Driver"
          description="Enter the details for the new driver."
          fields={[
            { name: "name", label: "Full Name", placeholder: "e.g. Alex Morgan" },
            { name: "email", label: "Email Address", type: "email", placeholder: "alex@example.com" },
            { name: "phone", label: "Phone Number", type: "tel", placeholder: "0812345678" },
            { name: "license", label: "License Number", placeholder: "N12345W" },
          ]}
          onClose={() => setShowModal(false)}
          onSubmit={addDriver}
        />
      )}

    </div>
  );
}

export default Drivers;