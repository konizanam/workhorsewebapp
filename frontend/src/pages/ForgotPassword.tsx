import "../App.css";
import { Link } from "react-router-dom";
import { useState } from "react";
import { apiRequest } from "../lib/api";
import FeedbackMessage from "../components/FeedbackMessage";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFeedback("");
    setError("");
    setSubmitting(true);
    try {
      const result = await apiRequest<{ message: string }>("/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email }),
      }, false);
      setFeedback(result.message);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to request a reset link.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page">

      <div className="auth-card">

        <div className="icon-circle">
          🔑
        </div>


        <h1>
          Forgot Password
        </h1>


        <p className="subtitle">
          Enter your email address and we will send you a password reset link.
        </p>


        {feedback && <FeedbackMessage message={feedback} />}
        {error && <FeedbackMessage message={error} tone="error" />}

        <form onSubmit={handleSubmit}>

          <div className="form-group">

            <label>
              Email Address
            </label>


            <div className="input-box">

              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />

            </div>

          </div>


          <button className="btn" type="submit" disabled={submitting}>
            {submitting ? "Sending..." : "Send Reset Link"}
          </button>

            <p className="text-center">
                <Link to="/">
                    Back to Login
                </Link>
            </p>

        </form>


      </div>

    </div>
  );
}

export { ForgotPassword };
/*export default ForgotPassword;*/