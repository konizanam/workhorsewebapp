import '../css/style.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

const app = document.querySelector<HTMLDivElement>("#app");

if(app){

app.innerHTML=`

    <div class="auth-card">

        <div class="icon-circle">

            <i class="fas fa-lock"></i>

        </div>

    <h1>Create New Password</h1>

        <p class="subtitle">

            Choose a strong password for your account.

        </p>

    <form id="resetForm">

        <div class="form-group">

            <label>New Password</label>

            <div class="input-box">

                <i class="fas fa-lock"></i>

                <input
                type="password"
                id="password"
                placeholder="Enter new password"
                required>

                <i
                class="fas fa-eye password-toggle"
                id="togglePassword"></i>

            </div>

        </div>

        <div class="password-strength">

            <div class="strength-bar">

                <div
                    class="strength-fill"
                    id="strengthFill">

                </div>

            </div>

            <div
            class="strength-text"
            id="strengthText">

            Password Strength

            </div>

        </div>

        <br>

            <div class="form-group">

                <label>Confirm Password</label>

                <div class="input-box">

                    <i class="fas fa-lock"></i>

                    <input
                    type="password"
                    id="confirmPassword"
                    placeholder="Confirm password"
                    required>

                    <i
                    class="fas fa-eye password-toggle"
                    id="toggleConfirmPassword">

                    </i>

                </div>

                <div
                    class="match-message"
                    id="matchMessage">

                </div>

            </div>

            <button class="btn">

                Reset Password

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
Password Visibility Toggle
===================*/

const password =
document.getElementById("password") as HTMLInputElement;

const confirm =
document.getElementById("confirmPassword") as HTMLInputElement;

const togglePassword =
document.getElementById("togglePassword")!;

const toggleConfirm =
document.getElementById("toggleConfirmPassword")!;

togglePassword.addEventListener("click",()=>{

password.type=
password.type==="password"
? "text"
: "password";

togglePassword.classList.toggle("fa-eye");
togglePassword.classList.toggle("fa-eye-slash");

});

toggleConfirm.addEventListener("click",()=>{

confirm.type=
confirm.type==="password"
? "text"
: "password";

toggleConfirm.classList.toggle("fa-eye");
toggleConfirm.classList.toggle("fa-eye-slash");

});