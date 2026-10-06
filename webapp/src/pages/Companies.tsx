import "../App.css";
import { useEffect, useState } from "react";
import AdminSidebar from "../components/AdminSidebar";
import AddRecordModal from "../components/AddRecordModal";
import ViewDetailsModal from "../components/ViewDetailsModal";
import RecordActionsModal from "../components/RecordActionsModal";
import FeedbackMessage from "../components/FeedbackMessage";
import TablePagination from "../components/TablePagination";
import { apiRequest } from "../lib/api";

type ApiCompany = {
  user_id: string;
  company_name: string;
  email: string;
  phone_number?: string | null;
  registration_number: string;
  onboarding_status?: string | null;
  status?: string | null;
  Name?: string;
  Email?: string;
  Phone?: string | null;
  "Registration Number"?: string;
  Status?: string;
};

type CompanyListResponse = { data: ApiCompany[] };

const mapCompany = (company: ApiCompany): Record<string, string> => ({
  ID: company.user_id,
  Name: company.Name ?? company.company_name,
  Email: company.Email ?? company.email,
  Phone: company.Phone ?? company.phone_number ?? "",
  "Registration Number": company["Registration Number"] ?? company.registration_number,
  Status: company.Status ?? company.onboarding_status ?? "Submitted",
  "Account Status": company.status ?? "invited",
});

function Companies() {
  const [showModal, setShowModal] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Record<string, string> | null>(null);
  const [actionCompany, setActionCompany] = useState<Record<string, string> | null>(null);
  const [feedback, setFeedback] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isSaving, setIsSaving] = useState(false);

  const [companyRows, setCompanyRows] = useState<Record<string, string>[]>([]);

  useEffect(() => {
    const loadCompanies = async () => {
      try {
        const response = await apiRequest<CompanyListResponse>("/companies?limit=100");
        setCompanyRows((response.data ?? []).map(mapCompany));
      } catch (error) {
        setFeedback(error instanceof Error ? error.message : "Unable to load companies.");
      }
    };

    void loadCompanies();
  }, []);

  const filteredCompanies = companyRows.filter((company) =>
    Object.values(company).join(" ").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.max(1, Math.ceil(filteredCompanies.length / pageSize));
  const currentPage = Math.min(page, totalPages);

  const addCompany = async (values: Record<string, string>) => {
    setIsSaving(true);
    setFeedback("");
    try {
      const created = await apiRequest<ApiCompany>("/companies", {
        method: "POST",
        body: JSON.stringify(values),
      });
      setCompanyRows((current) => [mapCompany(created), ...current]);
      setPage(1);
      setSearchTerm("");
      setShowModal(false);
      setFeedback(`${values.name} was saved successfully.`);
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Unable to save the company.");
    } finally {
      setIsSaving(false);
    }
  };

  const toggleCompanyStatus = async () => {
    if (!actionCompany) return;
    const status = actionCompany["Account Status"] === "disabled" ? "active" : "disabled";
    try {
      await apiRequest<ApiCompany>(`/companies/${actionCompany.ID}`, {
        method: "PUT",
        body: JSON.stringify({ status }),
      });
      setCompanyRows((current) => current.map((company) =>
        company.ID === actionCompany.ID ? { ...company, "Account Status": status } : company
      ));
      setFeedback(`${actionCompany.Name} ${status === "disabled" ? "disabled" : "enabled"}.`);
      setActionCompany(null);
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Unable to update company status.");
    }
  };

  const saveCompany = async (values: Record<string, string>) => {
    if (!actionCompany) return;
    try {
      const updated = await apiRequest<ApiCompany>(`/companies/${actionCompany.ID}`, {
        method: "PUT",
        body: JSON.stringify(values),
      });
      setCompanyRows((current) => current.map((company) =>
        company.ID === actionCompany.ID ? mapCompany(updated) : company
      ));
      setFeedback(`${values.Name ?? actionCompany.Name} was saved.`);
      setActionCompany(null);
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Unable to update the company.");
    }
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


          <TablePagination page={currentPage} pageSize={pageSize} totalRecords={filteredCompanies.length} onPageChange={setPage} onPageSizeChange={(size) => { setPageSize(size); setPage(1); }} />

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

                {filteredCompanies.slice((currentPage - 1) * pageSize, currentPage * pageSize).map((company) => (
                  <tr key={company.ID}>
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
          isSubmitting={isSaving}
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
          actions={[{ label: actionCompany["Account Status"] === "disabled" ? "Enable Company" : "Disable Company", onClick: () => void toggleCompanyStatus() }]}
          onClose={() => setActionCompany(null)}
          onSave={(values) => void saveCompany(values)}
        />
      )}

    </div>
  );
}

export default Companies;