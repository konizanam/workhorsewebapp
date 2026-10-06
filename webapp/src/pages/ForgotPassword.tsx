import "../App.css";
import { Link } from "react-router-dom";
import { useState } from "react";
import { apiRequest } from "../lib/api";
import FeedbackMessage from "../components/FeedbackMessage";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [feedback, setFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const requestReset = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await apiRequest<{ message: string }>("/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email }),
      });
      setFeedback(response.message);
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Unable to request a password reset.");
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
          Forgot Password
        </h1>


        <p className="subtitle">
          Enter your email address and we will send you a password reset link.
        </p>

        {feedback && <FeedbackMessage message={feedback} />}

        <form onSubmit={(event) => void requestReset(event)}>

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


          <button className="btn" disabled={isSubmitting}>
            {isSubmitting ? "Sending..." : "Send Reset Link"}
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