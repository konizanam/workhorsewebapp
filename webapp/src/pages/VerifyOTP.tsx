import "../App.css";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import FeedbackMessage from "../components/FeedbackMessage";

const OTP_RESEND_SECONDS = 240;

function VerifyOTP() {

  const navigate = useNavigate();
  const location = useLocation();
  const verificationState = location.state as { email?: string } | null;
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    
  const [timer, setTimer] = useState(OTP_RESEND_SECONDS);
  const [canResend, setCanResend] = useState(false);
  const [feedback, setFeedback] = useState("");

  // Countdown timer effect
    useEffect(() => {

        if (timer === 0) {

            setCanResend(true);
            return;

        }


        const countdown = setInterval(() => {

            setTimer((previous) => previous - 1);

        }, 1000);



        return () => clearInterval(countdown);


}, [timer]);

// Function to handle OTP resend
const resendOTP = () => {

    setTimer(OTP_RESEND_SECONDS);

    setCanResend(false);

  setOtp(["", "", "", "", "", ""]);
  inputRefs.current[0]?.focus();

  setFeedback("Resend requested. The 240-second timer has restarted.");

};

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

    if (otp.some((digit) => !digit)) {
      setFeedback("Enter all 6 digits to continue.");
      return;
    }

    navigate("/Dashboard");

};

//
  return (
    <div className="page">

      <div className="auth-card">

        <div className="icon-circle">
          <img src="/logo1.png" alt="Workhorse" />
        </div>


        <h1>
          Verify OTP
        </h1>


        <p className="subtitle">
          Enter the 6-digit code sent to {verificationState?.email || "your email address"}.
        </p>

        {feedback && <FeedbackMessage message={feedback} />}


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
        
            <div className="text-center">

                {canResend ? (

                    <button
                    type="button"
                    className="btn-secondary"
                    onClick={resendOTP}
                    >
                    Resend OTP
                    </button>

                ) : (

                    <p className="subtitle">
                    Resend OTP in {timer}s
                    </p>

                )}

            </div>


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