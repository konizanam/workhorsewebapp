import "../App.css";
import { useState } from "react";
import AdminSidebar from "../components/AdminSidebar";
import AddRecordModal from "../components/AddRecordModal";
import ViewDetailsModal from "../components/ViewDetailsModal";
import RecordActionsModal from "../components/RecordActionsModal";
import FeedbackMessage from "../components/FeedbackMessage";
import TablePagination from "../components/TablePagination";

function Companies() {
  const [showModal, setShowModal] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Record<string, string> | null>(null);
  const [actionCompany, setActionCompany] = useState<Record<string, string> | null>(null);
  const [feedback, setFeedback] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [companyRows, setCompanyRows] = useState([
    { Name: "ABC Construction", Email: "info@abcconstruction.com", Phone: "0612345678", "Registration Number": "REG-458921", Status: "Verified" },
    { Name: "NamBuild Supplies", Email: "info@nambuild.com", Phone: "0623456789", "Registration Number": "REG-782341", Status: "Submitted" },
    { Name: "Heavy Haul Logistics", Email: "contact@heavyhaul.com", Phone: "0634567890", "Registration Number": "REG-923451", Status: "Approved" },
  ]);

  const filteredCompanies = companyRows.filter((company) =>
    Object.values(company).join(" ").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.max(1, Math.ceil(filteredCompanies.length / pageSize));
  const currentPage = Math.min(page, totalPages);

  const addCompany = (values: Record<string, string>) => {
    setCompanyRows((current) => [{
      Name: values.name,
      Email: values.email,
      Phone: values.phone,
      "Registration Number": values.registration,
      Status: "Submitted",
    }, ...current]);
    setPage(1);
    setSearchTerm("");
    setShowModal(false);
    setFeedback(`${values.name} was added as a company.`);
  };

  const toggleCompanyStatus = () => {
    if (!actionCompany) return;
    const status = actionCompany.Status === "Disabled" ? "Verified" : "Disabled";
    setCompanyRows((current) => current.map((company) =>
      company.Email === actionCompany.Email ? { ...company, Status: status } : company
    ));
    setFeedback(`${actionCompany.Name} ${status === "Disabled" ? "disabled" : "enabled"}.`);
    setActionCompany(null);
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

          </div>

          <div className="table-toolbar">
            <input
              type="text"
              className="table-search-input"
              placeholder="Search companies..."
              value={searchTerm}
              onChange={(event) => {
                setSearchTerm(event.target.value);
                setPage(1);
              }}
            />
            <button className="btn" onClick={() => setShowModal(true)}>+ Add Company</button>
          </div>


          <div className="table-container">

            <TablePagination page={currentPage} pageSize={pageSize} totalRecords={filteredCompanies.length} onPageChange={setPage} onPageSizeChange={(size) => { setPageSize(size); setPage(1); }} />

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

                {filteredCompanies.slice((currentPage - 1) * pageSize, currentPage * pageSize).map((company) => (
                  <tr key={company.Email}>
                    <td>{company.Name}</td>
                    <td>{company.Email}</td>
                    <td>{company.Phone}</td>
                    <td>{company["Registration Number"]}</td>
                    <td>
                      <span className={`status ${company.Status.toLowerCase()}`}>
                        {company.Status}
                      </span>
                    </td>
                    <td>
                      <div className="table-actions"><button className="action-btn" onClick={() => setSelectedCompany(company)}>View</button><button className="action-btn" onClick={() => setActionCompany(company)}>Edit</button></div>
                    </td>
                  </tr>
                ))}

              </tbody>

            </table>

          </div>

          <TablePagination page={currentPage} pageSize={pageSize} totalRecords={filteredCompanies.length} onPageChange={setPage} onPageSizeChange={(size) => { setPageSize(size); setPage(1); }} />

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
          fields={[{ key: "Name", label: "Company Name" }, { key: "Email", label: "Email", type: "email" }, { key: "Phone", label: "Phone" }, { key: "Registration Number", label: "Registration Number" }, { key: "Status", label: "Onboarding Status", options: ["Submitted", "Verified", "Approved", "Rejected"] }]}
          actions={[{ label: actionCompany.Status === "Disabled" ? "Enable Company" : "Disable Company", onClick: toggleCompanyStatus }]}
          onClose={() => setActionCompany(null)}
          onSave={(values) => {
            setCompanyRows((current) => current.map((company) =>
              company.Email === actionCompany.Email ? { ...company, ...values } : company
            ));
            setFeedback(`${values.Name} was updated.`);
            setActionCompany(null);
          }}
        />
      )}

    </div>
  );
}

export default Companies;