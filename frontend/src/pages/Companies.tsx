import "../App.css";
import { useState } from "react";
import AdminSidebar from "../components/AdminSidebar";
import AddRecordModal from "../components/AddRecordModal";
import ViewDetailsModal from "../components/ViewDetailsModal";
import RecordActionsModal from "../components/RecordActionsModal";
import FeedbackMessage from "../components/FeedbackMessage";
import TablePagination from "../components/TablePagination";
import { apiRequest } from "../lib/api";
import { useApiList } from "../lib/useApiList";

type Company = {
  user_id: string;
  company_name: string;
  registration_number: string;
  email: string;
  phone_number: string | null;
  status: string;
  verification_status: string;
};

function Companies() {
  const [showModal, setShowModal] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [actionCompany, setActionCompany] = useState<Company | null>(null);
  const [feedback, setFeedback] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const { rows: companyRows, loading, error, refresh } = useApiList<Company>("/companies?limit=100");

  const filteredCompanies = companyRows.filter((company) =>
    Object.values(company).join(" ").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.max(1, Math.ceil(filteredCompanies.length / pageSize));
  const currentPage = Math.min(page, totalPages);

  const addCompany = async (values: Record<string, string>) => {
    try {
      await apiRequest("/companies", {
        method: "POST",
        body: JSON.stringify({
          company_name: values.company_name,
          registration_number: values.registration_number,
          email: values.email,
          phone_number: values.phone_number,
          password: values.password,
        }),
      });
      setShowModal(false);
      setFeedback(`${values.company_name} was added as a company.`);
      refresh();
    } catch (requestError) {
      setFeedback(requestError instanceof Error ? requestError.message : "Unable to create company.");
    }
  };

  const saveCompany = async (values: Record<string, string>) => {
    if (!actionCompany) return;
    try {
      await apiRequest(`/companies/${actionCompany.user_id}`, {
        method: "PUT",
        body: JSON.stringify({
          company_name: values.company_name,
          registration_number: values.registration_number,
          phone_number: values.phone_number,
          status: values.status,
        }),
      });
      setActionCompany(null);
      setFeedback("Company updated successfully.");
      refresh();
    } catch (requestError) {
      setFeedback(requestError instanceof Error ? requestError.message : "Unable to update company.");
    }
  };

  const verifyCompany = async (company: Company, verificationStatus: "verified" | "rejected") => {
    try {
      await apiRequest(`/companies/${company.user_id}/verify`, {
        method: "PUT",
        body: JSON.stringify({ verification_status: verificationStatus }),
      });
      setActionCompany(null);
      setFeedback(`Company ${verificationStatus}.`);
      refresh();
    } catch (requestError) {
      setFeedback(requestError instanceof Error ? requestError.message : "Unable to update verification.");
    }
  };

  const removeCompany = async (company: Company) => {
    try {
      await apiRequest(`/companies/${company.user_id}`, { method: "DELETE" });
      setActionCompany(null);
      setFeedback("Company deleted successfully.");
      refresh();
    } catch (requestError) {
      setFeedback(requestError instanceof Error ? requestError.message : "Unable to delete company.");
    }
  };

  return (
    <div className="admin-page">

      <AdminSidebar />

      <div className="admin-content">

        {feedback && <FeedbackMessage message={feedback} />}
        {error && <FeedbackMessage message={error} tone="error" />}

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
            <TablePagination page={currentPage} pageSize={pageSize} totalRecords={filteredCompanies.length} onPageChange={setPage} onPageSizeChange={(size) => { setPageSize(size); setPage(1); }} />
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

                {loading ? <tr><td colSpan={6}>Loading companies...</td></tr> : filteredCompanies.slice((currentPage - 1) * pageSize, currentPage * pageSize).map((company) => (
                  <tr key={company.user_id}>
                    <td>{company.company_name}</td>
                    <td>{company.email}</td>
                    <td>{company.phone_number || "-"}</td>
                    <td>{company.registration_number}</td>
                    <td>
                      <span className={`status ${company.verification_status}`}>
                        {company.verification_status}
                      </span>
                    </td>
                    <td>
                      <div className="table-actions"><button className="action-btn" onClick={() => setSelectedCompany(company)}>View</button><button className="action-btn" onClick={() => setActionCompany(company)}>Actions</button></div>
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
            { name: "company_name", label: "Company Name", placeholder: "e.g. North Star Logistics" },
            { name: "email", label: "Email Address", type: "email", placeholder: "info@example.com" },
            { name: "phone_number", label: "Phone Number", type: "tel", placeholder: "0612345678" },
            { name: "registration_number", label: "Registration Number", placeholder: "REG-123456" },
            { name: "password", label: "Temporary Password (8+ characters)", type: "password" },
          ]}
          onClose={() => setShowModal(false)}
          onSubmit={addCompany}
        />
      )}

      {selectedCompany && (
        <ViewDetailsModal
          title={selectedCompany.company_name}
          details={{
            "Company ID": selectedCompany.user_id,
            Email: selectedCompany.email,
            Phone: selectedCompany.phone_number || "-",
            "Registration Number": selectedCompany.registration_number,
            "Verification Status": selectedCompany.verification_status,
            "Account Status": selectedCompany.status,
          }}
          onClose={() => setSelectedCompany(null)}
        />
      )}

      {actionCompany && (
        <RecordActionsModal
          title={`Manage ${actionCompany.company_name}`}
          values={{
            company_name: actionCompany.company_name,
            phone_number: actionCompany.phone_number || "",
            registration_number: actionCompany.registration_number,
            status: actionCompany.status,
          }}
          fields={[
            { key: "company_name", label: "Company Name" },
            { key: "phone_number", label: "Phone Number" },
            { key: "registration_number", label: "Registration Number" },
            { key: "status", label: "Account Status", options: ["active", "suspended", "invited"] },
          ]}
          actions={[
            { label: "Verify", onClick: () => void verifyCompany(actionCompany, "verified") },
            { label: "Reject Verification", onClick: () => void verifyCompany(actionCompany, "rejected") },
            { label: "Delete Company", onClick: () => void removeCompany(actionCompany), danger: true },
          ]}
          onClose={() => setActionCompany(null)}
          onSave={saveCompany}
        />
      )}

    </div>
  );
}

export default Companies;