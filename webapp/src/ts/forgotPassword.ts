import '../css/style.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

const app = document.querySelector<HTMLDivElement>("#app");

if (app) {

    app.innerHTML = `

    <div class="auth-card">

        <div class="icon-circle">
            <i class="fas fa-key"></i>
        </div>

        <h1>Forgot Password?</h1>

        <p class="subtitle">
            Don't worry! Enter your registered email address and we'll
            send you a verification code.
        </p>

        <form id="forgotForm">

            <div class="form-group">

                <label>Email Address</label>

                <div class="input-box">

                    <i class="fas fa-envelope"></i>

                    <input
                        type="email"
                        id="email"
                        placeholder="admin@example.com"
                        required>

                </div>

                <small id="emailError" class="error"></small>

            </div>

            <button class="btn" type="submit">

                Send Verification Code

            </button>

            <div
                class="loader"
                id="loader">

            </div>

        </form>

        <br>

        <div class="text-center">

            <a href="/">

                ← Back to Login

            </a>

        </div>

    </div>

    `;
}

/*=================
Forgot Password Form Submission
===================*/

const form = document.getElementById("forgotForm") as HTMLFormElement;
const email = document.getElementById("email") as HTMLInputElement;
const loader = document.getElementById("loader") as HTMLElement;
const error = document.getElementById("emailError") as HTMLElement;

form?.addEventListener("submit", (e) => {

    e.preventDefault();

    error.textContent = "";

    const emailRegex =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email.value)) {

        error.textContent = "Please enter a valid email address.";

        return;
    }

    loader.style.display = "block";

    setTimeout(() => {

        loader.style.display = "none";

        /*
            Backend Endpoint

            POST /api/admin/send-otp

            {
                email: email.value
            }

        */

        window.location.href = "/otp.html";

    }, 1500);

});