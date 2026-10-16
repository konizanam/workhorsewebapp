import "../App.css";
import { Link, useSearchParams } from "react-router-dom";
import { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { apiRequest } from "../lib/api";
import FeedbackMessage from "../components/FeedbackMessage";
import { useFeedback } from "../lib/feedback";


function ResetPassword() {

  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const { feedback, notify } = useFeedback();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!token) {
      notify.error("This reset link is missing its token. Request a new reset link.");
      return;
    }
    if (password !== confirmPassword) {
      notify.error("Passwords do not match.");
      return;
    }
    setIsSubmitting(true);
    try {
      const response = await apiRequest<{ message: string }>("/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({ token, newPassword: password }),
      });
      notify.success(response.message);
      setIsComplete(true);
    } catch (error) {
      notify.error(error, "Unable to reset the password.");
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <div className="page">

      <div className="auth-card">


        <div className="icon-circle">
          <img src="/logo1.png" alt="Workhorse" />
        </div>

        <h1>
          Reset Password
        </h1>

        <p className="subtitle">
          Create a new secure password for your account.
        </p>

        {feedback && <FeedbackMessage key={feedback.id} tone={feedback.tone} message={feedback.message} onDismiss={notify.clear} />}

        {isComplete ? (
          <p className="text-center"><Link to="/">Back to Login</Link></p>
        ) : (
        <form onSubmit={(event) => void handleSubmit(event)}>

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

          <button className="btn" disabled={isSubmitting || !token}>
            {isSubmitting ? "Saving..." : "Reset Password"}
          </button>

        </form>
        )}

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