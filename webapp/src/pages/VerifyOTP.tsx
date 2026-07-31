import "../App.css";
import { Link, useNavigate } from "react-router-dom";

function VerifyOTP() {
  const navigate = useNavigate();

  return (
    <div className="page">

      <div className="auth-card">

        <div className="icon-circle">
          🔐
        </div>


        <h1>
          Verify OTP
        </h1>


        <p className="subtitle">
          Enter the 6-digit code sent to your email address.
        </p>


        <form onSubmit={(e) => {
            e.preventDefault();
            navigate("/ResetPassword");
        }}>

          <div className="otp-container">

            <input
              className="otp-input"
              type="text"
              maxLength={1}
            />

            <input
              className="otp-input"
              type="text"
              maxLength={1}
            />

            <input
              className="otp-input"
              type="text"
              maxLength={1}
            />

            <input
              className="otp-input"
              type="text"
              maxLength={1}
            />

            <input
              className="otp-input"
              type="text"
              maxLength={1}
            />

            <input
              className="otp-input"
              type="text"
              maxLength={1}
            />

          </div>


          <button className="btn">
            Verify Code
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

export { VerifyOTP };
/*export default VerifyOTP;*/