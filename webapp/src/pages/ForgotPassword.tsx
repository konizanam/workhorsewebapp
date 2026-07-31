import "../App.css";

function ForgotPassword() {
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


        <form>

          <div className="form-group">

            <label>
              Email Address
            </label>


            <div className="input-box">

              <input
                type="email"
                placeholder="Enter your email"
              />

            </div>

          </div>


          <button className="btn">
            Send Reset Link
          </button>


        </form>


      </div>

    </div>
  );
}

export { ForgotPassword };
/*export default ForgotPassword;*/