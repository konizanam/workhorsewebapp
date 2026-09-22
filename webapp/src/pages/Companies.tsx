import "../App.css";
import { useState } from "react";
import AdminSidebar from "../components/AdminSidebar";
import AddRecordModal from "../components/AddRecordModal";
import ViewDetailsModal from "../components/ViewDetailsModal";
import RecordActionsModal from "../components/RecordActionsModal";
import FeedbackMessage from "../components/FeedbackMessage";

function Companies() {
  const [showModal, setShowModal] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Record<string, string> | null>(null);
  const [actionCompany, setActionCompany] = useState<Record<string, string> | null>(null);
  const [feedback, setFeedback] = useState("");

  const addCompany = (values: Record<string, string>) => {
    setShowModal(false);
    setFeedback(`${values.name} was added as a company.`);
  };

  return (
    <div className="admin-page">

      <AdminSidebar />

      <div className="admin-content">

        {feedback && <FeedbackMessage message={feedback} />}

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

            <button className="btn" onClick={() => setShowModal(true)}>
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
                    <div className="table-actions"><button className="action-btn" onClick={() => setSelectedCompany({ Name: "ABC Construction", Email: "info@abcconstruction.com", Phone: "0612345678", "Registration Number": "REG-458921", Status: "Verified" })}>View</button><button className="action-btn" onClick={() => setActionCompany({ Name: "ABC Construction", Email: "info@abcconstruction.com", Phone: "0612345678", "Registration Number": "REG-458921", Status: "Verified" })}>Actions</button></div>
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
                    <div className="table-actions"><button className="action-btn" onClick={() => setSelectedCompany({ Name: "NamBuild Supplies", Email: "info@nambuild.com", Phone: "0623456789", "Registration Number": "REG-782341", Status: "Pending" })}>View</button><button className="action-btn" onClick={() => setActionCompany({ Name: "NamBuild Supplies", Email: "info@nambuild.com", Phone: "0623456789", "Registration Number": "REG-782341", Status: "Pending" })}>Actions</button></div>
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
                    <div className="table-actions"><button className="action-btn" onClick={() => setSelectedCompany({ Name: "Heavy Haul Logistics", Email: "contact@heavyhaul.com", Phone: "0634567890", "Registration Number": "REG-923451", Status: "Verified" })}>View</button><button className="action-btn" onClick={() => setActionCompany({ Name: "Heavy Haul Logistics", Email: "contact@heavyhaul.com", Phone: "0634567890", "Registration Number": "REG-923451", Status: "Verified" })}>Actions</button></div>
                  </td>

                </tr>

              </tbody>

            </table>

          </div>

        </div>

      </div>

      {showModal && (
        <AddRecordModal
          title="Add New Company"
          description="Enter the details for the new company."
          fields={[
            { name: "name", label: "Company Name", placeholder: "e.g. North Star Logistics" },
            { name: "email", label: "Email Address", type: "email", placeholder: "info@example.com" },
            { name: "phone", label: "Phone Number", type: "tel", placeholder: "0612345678" },
            { name: "registration", label: "Registration Number", placeholder: "REG-123456" },
          ]}
          onClose={() => setShowModal(false)}
          onSubmit={addCompany}
        />
      )}

      {selectedCompany && (
        <ViewDetailsModal
          title={selectedCompany.Name}
          details={selectedCompany}
          onClose={() => setSelectedCompany(null)}
        />
      )}

      {actionCompany && (
        <RecordActionsModal
          title={`Manage ${actionCompany.Name}`}
          values={actionCompany}
          fields={[{ key: "Name", label: "Company Name" }, { key: "Email", label: "Email", type: "email" }, { key: "Phone", label: "Phone" }, { key: "Registration Number", label: "Registration Number" }, { key: "Status", label: "Status", options: ["Verified", "Pending", "Disabled"] }]}
          actions={[{ label: "Disable Company", onClick: () => setFeedback("Company disabled.") }, { label: "Delete Company", onClick: () => { setFeedback("Company deleted."); setActionCompany(null); }, danger: true }]}
          onClose={() => setActionCompany(null)}
          onSave={(values) => { setFeedback(`${values.Name} was updated.`); setActionCompany(null); }}
        />
      )}

    </div>
  );
}

export default Companies;