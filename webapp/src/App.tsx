import "./App.css";
import { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";

import { Routes, Route, Link, useNavigate } from "react-router-dom";
import { ForgotPassword } from "./pages/ForgotPassword";
import { VerifyOTP } from "./pages/VerifyOTP";
import ResetPassword from "./pages/ResetPassword";
import { apiRequest, clearSession, storeTokens } from "./lib/api";
import Dashboard from "./pages/Dashboard";
import Users from "./pages/Users";
import Drivers from "./pages/Drivers";
import Companies from "./pages/Companies";
import Requests from "./pages/Requests";
import Trips from "./pages/Trips";
import Payments from "./pages/Payments";
import Roles from "./pages/Roles";
import AuditLogs from "./pages/AuditLogs";
import Settings from "./pages/Settings";

function Login() {

  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {

      setError("Please enter email and password");

      return;
    }

    setError("");
    setSubmitting(true);
    clearSession();

    try {
      const result = await apiRequest<{
        requiresTwoFactor: boolean;
        pendingToken?: string;
        accessToken?: string;
        refreshToken?: string;
      }>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      if (result.requiresTwoFactor && result.pendingToken) {
        sessionStorage.setItem("workhorse.pendingToken", result.pendingToken);
        navigate("/VerifyOTP", { state: { email } });
        return;
      }

      if (result.accessToken && result.refreshToken) {
        storeTokens({ accessToken: result.accessToken, refreshToken: result.refreshToken });
        const user = await apiRequest<{ user_type: string }>("/auth/me");
        if (user.user_type !== "admin") {
          clearSession();
          throw new Error("This account does not have admin access.");
        }
        navigate("/Dashboard");
        return;
      }

      throw new Error("Unexpected response from the login service.");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to sign in.");
    } finally {
      setSubmitting(false);
    }
  };
  
  return (
    <div className="page">
      <div className="auth-card">

        <div className="icon-circle">
          <img src="/logo1.png" alt="Workhorse" />
        </div>
          
        <form onSubmit={handleLogin}>

          <div className="form-group">
            <label>Email Address</label>

            <div className="input-box">
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>


          <div className="form-group">
            <label>Password</label>

            <div className="input-box">

              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />


              <span
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >

                {showPassword ? <FaEyeSlash /> : <FaEye />}

              </span>
            </div>
          </div>


          <div className="options">

            <label>
              <input type="checkbox" />
              Remember me
            </label>


            <Link to="/ForgotPassword">
              Forgot Password?
            </Link>
          </div>

          {error && <p className="error">{error}</p>}

          <button className="btn" type="submit" disabled={submitting}>
            {submitting ? "Signing in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}

function App() {
  return (
    <Routes>

      <Route path="/" element={<Login />} />
      <Route path="/ForgotPassword" element={<ForgotPassword />} />
      <Route path="/VerifyOTP" element={<VerifyOTP />} />
      <Route path="/ResetPassword" element={<ResetPassword />} />
      <Route path="/Dashboard" element={<Dashboard />} />
      <Route path="/Users" element={<Users />} />
      <Route path="/Drivers" element={<Drivers />} />
      <Route path="/Companies" element={<Companies />} />
      <Route path="/Requests" element={<Requests />} />
      <Route path="/Trips" element={<Trips />} />
      <Route path="/Payments" element={<Payments />} />
      <Route path="/Roles" element={<Roles />} />
      <Route path="/AuditLogs" element={<AuditLogs />} />
      <Route path="/Settings" element={<Settings />} />
    </Routes>
  );

}

export default App;