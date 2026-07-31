import "./App.css";
import { useState } from "react";
import { FaUserShield, FaEye, FaEyeSlash } from "react-icons/fa";

function App() {

  const [showPassword, setShowPassword] = useState(false);
  
  return (
    <div className="page">
      <div className="auth-card">

        <div className="icon-circle">
          <FaUserShield />
        </div>

        <h1>Admin Login</h1>

        <p className="subtitle">
          Sign in to access the Workhorse admin panel.
        </p>
          
        <form>

          <div className="form-group">
            <label>Email Address</label>

            <div className="input-box">
              <input
                type="email"
                placeholder="Enter your email"
              />
            </div>
          </div>


          <div className="form-group">
            <label>Password</label>

            <div className="input-box">

              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
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


            <a href="#">
              Forgot Password?
            </a>

          </div>


          <button className="btn">
            Login
          </button>


        </form>

      </div>
    </div>
  );
}

export default App;