import "../App.css";
import { Link, useSearchParams } from "react-router-dom";
import { useState } from "react";
import { FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import { apiRequest } from "../lib/api";
import FeedbackMessage from "../components/FeedbackMessage";


function ResetPassword() {

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [searchParams] = useSearchParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFeedback("");
    setError("");
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    const token = searchParams.get("token");
    if (!token) {
      setError("This reset link is invalid or missing.");
      return;
    }

    setSubmitting(true);
    try {
      const result = await apiRequest<{ message: string }>("/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({ token, newPassword: password }),
      }, false);
      setFeedback(result.message);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to reset the password.");
    } finally {
      setSubmitting(false);
    }
  };


  return (
    <div className="page">

      <div className="auth-card">


        <div className="icon-circle">

          <FaLock />

        </div>

        <h1>
          Reset Password
        </h1>

        <p className="subtitle">
          Create a new secure password for your account.
        </p>

        {feedback && <FeedbackMessage message={feedback} />}
        {error && <FeedbackMessage message={error} tone="error" />}

        <form onSubmit={handleSubmit}>

          <div className="form-group">

            <label>
              New Password
            </label>

            <div className="input-box">

              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter new password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                minLength={8}
                required
              />

              <span
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >

                {
                  showPassword 
                  ? <FaEyeSlash /> 
                  : <FaEye />
                }

              </span>

            </div>

          </div>

          <div className="form-group">

            <label>
              Confirm Password
            </label>


            <div className="input-box">

              <input
                type={showConfirm ? "text" : "password"}
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                minLength={8}
                required
              />


              <span
                className="password-toggle"
                onClick={() => setShowConfirm(!showConfirm)}
              >

                {
                  showConfirm 
                  ? <FaEyeSlash /> 
                  : <FaEye />
                }

              </span>

            </div>

          </div>

          <button className="btn" type="submit" disabled={submitting}>
            {submitting ? "Resetting..." : "Reset Password"}
          </button>

        </form>

        <p className="text-center">

          <Link to="/">
            Back to Login
          </Link>

        </p>

      </div>

    </div>
  );
}


export default ResetPassword;