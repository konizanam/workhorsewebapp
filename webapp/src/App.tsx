import "./App.css";
import { useState } from "react";
import { FaUserShield, FaEye, FaEyeSlash } from "react-icons/fa";

function App() {

  const [showPassword, setShowPassword] = useState(false);
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const handleLogin = (e: React.FormEvent) => {

    e.preventDefault();

    if (!email || !password) {

      setError("Please enter email and password");

      return;

    }


    setError("");

    alert("Login successful");

  };
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


            <a href="#">
              Forgot Password?
            </a>

          </div>

          {error && <p className="error">{error}</p>}

          <button className="btn">
            Login
          </button>


        </form>

      </div>
    </div>
  );
}

export default App;