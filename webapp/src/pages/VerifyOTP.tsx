import "../App.css";
import { Link, useNavigate } from "react-router-dom";
import { useRef, useState } from "react";

function VerifyOTP() {

  const navigate = useNavigate();
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    
  const inputRefs = useRef<HTMLInputElement[]>([]);

    const handleChange = (
    value: string,
    index: number
    ) => {
        
        // Only allow numeric input
    if (!/^[0-9]?$/.test(value)) {
        return;
    }

    const newOtp = [...otp];

    newOtp[index] = value;

    setOtp(newOtp);

// Move focus to the next input field if a digit is entered
    if (value && index < 5) {

        inputRefs.current[index + 1].focus();

    }

};

const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {


    // Move backwards on backspace
    if (
      e.key === "Backspace" &&
      !otp[index] &&
      index > 0
    ) {

      inputRefs.current[index - 1].focus();

    }

};

const handleVerify = (
    e: React.FormEvent
  ) => {

    e.preventDefault();


    navigate("/ResetPassword");

};

/////////////////////
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


        <form onSubmit={handleVerify}>

          <div className="otp-container">

            {otp.map((digit, index) => (

              <input

                key={index}

                className="otp-input"

                type="text"

                maxLength={1}

                value={digit}


                ref={(element) => {

                  if (element) {

                    inputRefs.current[index] = element;

                  }

                }}


                onChange={(e) =>
                  handleChange(
                    e.target.value,
                    index
                  )
                }


                onKeyDown={(e) =>
                  handleKeyDown(
                    e,
                    index
                  )
                }

              />

            ))}

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