import { useState } from "react";
import AdminSidebar from "../components/AdminSidebar";
import FeedbackMessage from "../components/FeedbackMessage";

const Settings = () => {
  const [notifications, setNotifications] = useState({
    newUsers: true,
    bookings: true,
    payments: true,
    systemAlerts: true,
  });

  const [security, setSecurity] = useState({
    twoFactor: true,
    loginAlerts: true,
  });

  const [platform, setPlatform] = useState({
    platformName: "Workhorse",
    supportEmail: "support@workhorse.com",
    supportPhone: "+264 81 000 0000",
    timezone: "Africa/Windhoek",
    currency: "NAD",
  });
  const [feedback, setFeedback] = useState("");

  const handlePlatformChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    setPlatform((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleNotificationChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, checked } = e.target;

    setNotifications((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  const handleSecurityChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, checked } = e.target;

    setSecurity((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  const handleSave = () => {
    setFeedback("Settings saved successfully.");
  };

  return (
    <div className="admin-page">

      {/* Sidebar */}
      <AdminSidebar />

      {/* Main Content */}
      <main className="admin-content">

        <div className="settings-page">

          {/* Page Header */}
          <div className="admin-header settings-header">
            <div>
              <h1>Settings</h1>
            <p>
              Manage platform configuration, notifications and security
              preferences.
            </p>
            </div>
          </div>

          {feedback && <FeedbackMessage message={feedback} />}

          {/* Platform Settings */}
          <section className="users-section settings-section">

            <div className="settings-section-header">
              <h2>Platform Settings</h2>
              <p>
                Configure the basic information used across the Workhorse
                platform.
              </p>
            </div>

            <div className="settings-form-grid">

              <div className="settings-field">
                <label>Platform Name</label>

                <input
                  type="text"
                  name="platformName"
                  value={platform.platformName}
                  onChange={handlePlatformChange}
                />
              </div>

              <div className="settings-field">
                <label>Support Email</label>

                <input
                  type="email"
                  name="supportEmail"
                  value={platform.supportEmail}
                  onChange={handlePlatformChange}
                />
              </div>

              <div className="settings-field">
                <label>Support Phone</label>

                <input
                  type="text"
                  name="supportPhone"
                  value={platform.supportPhone}
                  onChange={handlePlatformChange}
                />
              </div>

              <div className="settings-field">
                <label>Time Zone</label>

                <select
                  name="timezone"
                  value={platform.timezone}
                  onChange={handlePlatformChange}
                >
                  <option value="Africa/Windhoek">
                    Africa/Windhoek
                  </option>

                  <option value="Africa/Johannesburg">
                    Africa/Johannesburg
                  </option>

                  <option value="UTC">
                    UTC
                  </option>
                </select>
              </div>

              <div className="settings-field">
                <label>Currency</label>

                <select
                  name="currency"
                  value={platform.currency}
                  onChange={handlePlatformChange}
                >
                  <option value="NAD">
                    NAD - Namibian Dollar
                  </option>

                  <option value="ZAR">
                    ZAR - South African Rand
                  </option>

                  <option value="USD">
                    USD - US Dollar
                  </option>
                </select>
              </div>

            </div>
          </section>

          {/* Notifications */}
          <section className="users-section settings-section">

            <div className="settings-section-header">
              <h2>Notifications</h2>
              <p>
                Choose which events administrators should be notified about.
              </p>
            </div>

            <div className="settings-options">

              <div className="settings-option">
                <div>
                  <h3>New User Registrations</h3>
                  <p>
                    Receive a notification when a new user registers.
                  </p>
                </div>

                <label className="switch">
                  <input
                    type="checkbox"
                    name="newUsers"
                    checked={notifications.newUsers}
                    onChange={handleNotificationChange}
                  />

                  <span className="slider"></span>
                </label>
              </div>

              <div className="settings-option">
                <div>
                  <h3>New Bookings</h3>
                  <p>
                    Receive notifications when a new transport request
                    or booking is created.
                  </p>
                </div>

                <label className="switch">
                  <input
                    type="checkbox"
                    name="bookings"
                    checked={notifications.bookings}
                    onChange={handleNotificationChange}
                  />

                  <span className="slider"></span>
                </label>
              </div>

              <div className="settings-option">
                <div>
                  <h3>Payment Notifications</h3>
                  <p>
                    Receive notifications when payments are completed.
                  </p>
                </div>

                <label className="switch">
                  <input
                    type="checkbox"
                    name="payments"
                    checked={notifications.payments}
                    onChange={handleNotificationChange}
                  />

                  <span className="slider"></span>
                </label>
              </div>

              <div className="settings-option">
                <div>
                  <h3>System Alerts</h3>
                  <p>
                    Receive important alerts about platform activity
                    and system issues.
                  </p>
                </div>

                <label className="switch">
                  <input
                    type="checkbox"
                    name="systemAlerts"
                    checked={notifications.systemAlerts}
                    onChange={handleNotificationChange}
                  />

                  <span className="slider"></span>
                </label>
              </div>

            </div>
          </section>

          {/* Security */}
          <section className="users-section settings-section">

            <div className="settings-section-header">
              <h2>Security</h2>
              <p>
                Manage authentication and administrator security preferences.
              </p>
            </div>

            <div className="settings-options">

              <div className="settings-option">
                <div>
                  <h3>Two-Factor Authentication</h3>
                  <p>
                    Require administrators to verify their identity using
                    a second authentication method.
                  </p>
                </div>

                <label className="switch">
                  <input
                    type="checkbox"
                    name="twoFactor"
                    checked={security.twoFactor}
                    onChange={handleSecurityChange}
                  />

                  <span className="slider"></span>
                </label>
              </div>

              <div className="settings-option">
                <div>
                  <h3>Login Alerts</h3>
                  <p>
                    Notify administrators when a new login is detected.
                  </p>
                </div>

                <label className="switch">
                  <input
                    type="checkbox"
                    name="loginAlerts"
                    checked={security.loginAlerts}
                    onChange={handleSecurityChange}
                  />

                  <span className="slider"></span>
                </label>
              </div>

            </div>

            <div className="settings-form-grid security-grid">

              <div className="settings-field">
                <label>Session Timeout</label>

                <select defaultValue="30">
                  <option value="15">15 Minutes</option>
                  <option value="30">30 Minutes</option>
                  <option value="60">1 Hour</option>
                  <option value="120">2 Hours</option>
                </select>
              </div>

              <div className="settings-field">
                <label>Password Expiration</label>

                <select defaultValue="90">
                  <option value="30">30 Days</option>
                  <option value="60">60 Days</option>
                  <option value="90">90 Days</option>
                  <option value="180">180 Days</option>
                </select>
              </div>

            </div>
          </section>

          {/* Save */}
          <div className="settings-actions">
            <button
              type="button"
              className="primary-btn settings-save-btn"
              onClick={handleSave}
            >
              Save Changes
            </button>
          </div>

        </div>

      </main>
    </div>
  );
};

export default Settings;