import "../App.css";
import { Link } from "react-router-dom";
import { useState } from "react";
import { FaLock, FaEye, FaEyeSlash } from "react-icons/fa";


function ResetPassword() {

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);


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

        <form>

          <div className="form-group">

            <label>
              New Password
            </label>

            <div className="input-box">

              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter new password"
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

          <button className="btn">
            Reset Password
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