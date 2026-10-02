import "../App.css";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");

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


        <form onSubmit={(e) => {
            e.preventDefault();
          navigate("/ResetPassword", { state: { email } });
        }}
        >

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


          <button className="btn">
            Send Reset Link
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