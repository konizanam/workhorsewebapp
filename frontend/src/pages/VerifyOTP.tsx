import "../App.css";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import FeedbackMessage from "../components/FeedbackMessage";
import { apiRequest, clearSession, storeTokens } from "../lib/api";

function VerifyOTP() {

  const navigate = useNavigate();
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [timer, setTimer] = useState(60);
  const [feedback, setFeedback] = useState("");
  const [feedbackTone, setFeedbackTone] = useState<"success" | "error">("success");
  const [submitting, setSubmitting] = useState(false);
  const canResend = timer === 0;

  // Countdown timer effect
    useEffect(() => {

    if (timer === 0) return;
    const countdown = setTimeout(() => setTimer((previous) => previous - 1), 1000);
    return () => clearTimeout(countdown);
  }, [timer]);

  useEffect(() => {
    if (!sessionStorage.getItem("workhorse.pendingToken")) navigate("/", { replace: true });
  }, [navigate]);
// Function to handle OTP resend
const resendOTP = async () => {
  const pendingToken = sessionStorage.getItem("workhorse.pendingToken");
  if (!pendingToken) return navigate("/");
  try {
    const result = await apiRequest<{ message: string }>("/auth/resend-2fa", {
      method: "POST",
      body: JSON.stringify({ pendingToken }),
    }, false);
    setTimer(60);
    setFeedbackTone("success");
    setFeedback(result.message);
  } catch (requestError) {
    setFeedbackTone("error");
    setFeedback(requestError instanceof Error ? requestError.message : "Unable to resend the code.");
  }
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

const handleVerify = async (event: React.FormEvent<HTMLFormElement>) => {
  event.preventDefault();
  const pendingToken = sessionStorage.getItem("workhorse.pendingToken");
  if (!pendingToken) return navigate("/");
  setSubmitting(true);
  setFeedback("");
  try {
    const tokens = await apiRequest<{ accessToken: string; refreshToken: string }>("/auth/verify-2fa", {
      method: "POST",
      body: JSON.stringify({ pendingToken, code: otp.join("") }),
    }, false);
    sessionStorage.removeItem("workhorse.pendingToken");
    storeTokens(tokens);
    const user = await apiRequest<{ user_type: string }>("/auth/me");
    if (user.user_type !== "admin") {
      clearSession();
      throw new Error("This account does not have admin access.");
    }
    navigate("/Dashboard");
  } catch (requestError) {
    setFeedbackTone("error");
    setFeedback(requestError instanceof Error ? requestError.message : "Unable to verify the code.");
  } finally {
    setSubmitting(false);
  }
};

//
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
          {import.meta.env.DEV
            ? "Enter the 6-digit code shown in the backend terminal."
            : "Enter the 6-digit code sent to your email address."}
        </p>

        {feedback && <FeedbackMessage message={feedback} tone={feedbackTone} />}


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


          <button className="btn" disabled={submitting || otp.join("").length !== 6}>
            {submitting ? "Verifying..." : "Verify Code"}
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