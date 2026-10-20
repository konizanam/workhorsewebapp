import "../App.css";
import { useEffect, useState } from "react";
import AdminSidebar from "../components/AdminSidebar";
import AddRecordModal from "../components/AddRecordModal";
import ViewDetailsModal from "../components/ViewDetailsModal";
import RecordActionsModal from "../components/RecordActionsModal";
import FeedbackMessage from "../components/FeedbackMessage";
import { useFeedback } from "../lib/feedback";
import TablePagination from "../components/TablePagination";
import TableToolbar from "../components/TableToolbar";
import { useTableControls } from "../lib/useTableControls";
import { apiRequest } from "../lib/api";

type ApiCompany = {
  user_id: string;
  company_name: string;
  email: string;
  phone_number?: string | null;
  registration_number: string;
  physical_address?: string | null;
  city?: string | null;
  region?: string | null;
  postal_code?: string | null;
  onboarding_status?: string | null;
  status?: string | null;
  Name?: string;
  Email?: string;
  Phone?: string | null;
  "Registration Number"?: string;
  "Physical Address"?: string | null;
  "City / Town"?: string | null;
  Region?: string | null;
  "Postal Code"?: string | null;
  Status?: string;
};

const NAMIBIAN_REGIONS = [
  "Erongo", "Hardap", "//Karas", "Kavango East", "Kavango West", "Khomas", "Kunene",
  "Ohangwena", "Omaheke", "Omusati", "Oshana", "Oshikoto", "Otjozondjupa", "Zambezi",
];

type CompanyListResponse = { data: ApiCompany[] };

const mapCompany = (company: ApiCompany): Record<string, string> => ({
  ID: company.user_id,
  Name: company.Name ?? company.company_name,
  Email: company.Email ?? company.email,
  Phone: company.Phone ?? company.phone_number ?? "",
  "Registration Number": company["Registration Number"] ?? company.registration_number,
  "Physical Address": company["Physical Address"] ?? company.physical_address ?? "",
  "City / Town": company["City / Town"] ?? company.city ?? "",
  Region: company.Region ?? company.region ?? "",
  "Postal Code": company["Postal Code"] ?? company.postal_code ?? "",
  Status: company.Status ?? company.onboarding_status ?? "Submitted",
  "Account Status": company.status ?? "invited",
});

function Companies() {
  const [showModal, setShowModal] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Record<string, string> | null>(null);
  const [actionCompany, setActionCompany] = useState<Record<string, string> | null>(null);
  const { feedback, notify } = useFeedback();
  const [isSaving, setIsSaving] = useState(false);

  const [companyRows, setCompanyRows] = useState<Record<string, string>[]>([]);

  useEffect(() => {
    const loadCompanies = async () => {
      try {
        const response = await apiRequest<CompanyListResponse>("/companies?limit=100");
        setCompanyRows((response.data ?? []).map(mapCompany));
      } catch (error) {
        notify.error(error, "Unable to load companies.");
      }
    };

    void loadCompanies();
  }, [notify]);

  const table = useTableControls(companyRows, {
    searchText: (company) => Object.values(company).join(" "),
    filters: [
      { key: "status", label: "Status", allLabel: "All statuses", getValue: (row) => row["Status"] ?? "" },
      { key: "region", label: "Region", allLabel: "All regions", getValue: (row) => row["Region"] ?? "" },
    ],
  });

  const addCompany = async (values: Record<string, string>) => {
    setIsSaving(true);
    notify.clear();
    try {
      const created = await apiRequest<ApiCompany>("/companies", {
        method: "POST",
        body: JSON.stringify(values),
      });
      setCompanyRows((current) => [mapCompany(created), ...current]);
      table.reset();
      setShowModal(false);
      notify.success(`${values.name} was saved successfully.`);
    } catch (error) {
      notify.error(error, "Unable to save the company.");
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
      notify.success(`${actionCompany.Name} ${status === "disabled" ? "disabled" : "enabled"}.`);
      setActionCompany(null);
    } catch (error) {
      notify.error(error, "Unable to update company status.");
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
      notify.success(`${values.Name ?? actionCompany.Name} was saved.`);
      setActionCompany(null);
    } catch (error) {
      notify.error(error, "Unable to update the company.");
    }
  };

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

        {feedback && <FeedbackMessage key={feedback.id} tone={feedback.tone} message={feedback.message} onDismiss={notify.clear} />}


        {/* Companies Table */}
        <div className="users-section">

          <div className="users-section-header">

            <h2>All Companies</h2>

            <button type="button" className="btn" onClick={() => setShowModal(true)}>+ Add Company</button>
          </div>

          <TableToolbar {...table.toolbar} searchPlaceholder="Search companies..." />

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

                {table.pageRows.map((company) => (
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

          <TablePagination {...table.pagination} />

        </div>

      </div>

      {showModal && (
        <AddRecordModal
          title="Add New Company"
          description="Enter the details for the new company."
          fields={[
            { name: "name", label: "Company Name", placeholder: "e.g. North Star Logistics", section: "Company details" },
            { name: "registration", label: "Registration Number", placeholder: "e.g. CC/2015/04521", section: "Company details" },
            { name: "email", label: "Email Address", type: "email", placeholder: "info@example.com", section: "Contact details" },
            { name: "phone", label: "Phone Number", type: "tel", placeholder: "0612345678", section: "Contact details" },
            { name: "address", label: "Physical Address", placeholder: "e.g. 14 Nasmith Street, Southern Industrial", section: "Physical address" },
            { name: "City", label: "City / Town", placeholder: "e.g. Windhoek", section: "Physical address" },
            { name: "Region", label: "Region", options: NAMIBIAN_REGIONS, section: "Physical address" },
            { name: "Postal Code", label: "Postal Code", placeholder: "e.g. 9000", required: false, section: "Physical address" },
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
          fields={[
            { key: "Name", label: "Company Name", section: "Company details" },
            { key: "Registration Number", label: "Registration Number", section: "Company details" },
            { key: "Status", label: "Onboarding Status", options: ["Submitted", "Verified", "Approved", "Rejected"], section: "Company details" },
            { key: "Email", label: "Email", type: "email", section: "Contact details" },
            { key: "Phone", label: "Phone", section: "Contact details" },
            { key: "Physical Address", label: "Physical Address", section: "Physical address" },
            { key: "City / Town", label: "City / Town", section: "Physical address" },
            { key: "Region", label: "Region", options: NAMIBIAN_REGIONS, section: "Physical address" },
            { key: "Postal Code", label: "Postal Code", required: false, section: "Physical address" },
          ]}
          actions={[{ label: actionCompany["Account Status"] === "disabled" ? "Enable Company" : "Disable Company", onClick: () => void toggleCompanyStatus() }]}
          onClose={() => setActionCompany(null)}
          onSave={(values) => void saveCompany(values)}
        />
      )}

    </div>
  );
}

export default Companies;