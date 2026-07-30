import '../css/style.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

const app = document.querySelector<HTMLDivElement>("#app");

if (app) {

app.innerHTML = `

<div class="auth-card">

    <div class="icon-circle">
        <i class="fas fa-user"></i>
    </div>

    <h1>Sign In</h1>

    <p class="subtitle">

        Welcome back! Please enter your credentials to access your account.

    </p>

    <form id="loginForm">

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

        </div>

        <div class="form-group">

            <label>Password</label>

            <div class="input-box">

                <i class="fas fa-lock"></i>

                    <input
                    type="password"
                    id="password"
                    placeholder="Enter Password"
                    required>

                    <i
                    class="fas fa-eye password-toggle"
                    id="togglePassword"></i>

            </div>

        </div>

        <div class="options">

            <label>

                <input type="checkbox">

                Remember Me

            </label>

            <a href="/forgot-password.html">

                Forgot Password?

            </a>

        </div>

        <button class="btn">

            Login

        </button>

        <div
            class="loader"
            id="loader">

        </div>

    </form>

</div>

    `;

}

/*=================
password Visibility Toggle
===================*/

const togglePassword =
document.getElementById("togglePassword");

const password =
document.getElementById("password") as HTMLInputElement;

togglePassword?.addEventListener("click",()=>{

if(password.type==="password"){

password.type="text";

togglePassword.classList.remove("fa-eye");

togglePassword.classList.add("fa-eye-slash");

}
else{

password.type="password";

togglePassword.classList.remove("fa-eye-slash");

togglePassword.classList.add("fa-eye");

}

});

/*=================
login Form Submission
==================*/
const form =
document.getElementById("loginForm");

const loader =
document.getElementById("loader") as HTMLElement;

form?.addEventListener("submit",(e)=>{

e.preventDefault();

loader.style.display="block";

setTimeout(()=>{

loader.style.display="none";

/*========================
Later:

POST /api/login

If success:

window.location.href="/otp.html";

===========================*/

window.location.href="/otp.html";

},1500);

});