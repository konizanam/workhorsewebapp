import '../css/style.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

const app = document.querySelector<HTMLDivElement>("#app");

if(app){

app.innerHTML=`

<div class="auth-card">

<div class="icon-circle">

<i class="fas fa-shield-alt"></i>

</div>

<h1>Verify OTP</h1>

<p class="subtitle">

We've sent a verification code to

</p>

<div class="email-display">

admin@example.com

</div>

<form id="otpForm">

<div class="otp-container">

<input class="otp-input" maxlength="1" type="text">
<input class="otp-input" maxlength="1" type="text">
<input class="otp-input" maxlength="1" type="text">
<input class="otp-input" maxlength="1" type="text">
<input class="otp-input" maxlength="1" type="text">
<input class="otp-input" maxlength="1" type="text">

</div>

<button class="btn">

Verify Code

</button>

<div
class="loader"
id="loader">

</div>

</form>

<div class="timer">

Resend code in

<span id="countdown">

60

</span>

seconds

</div>

<div class="text-center">

<button
class="resend-btn"
id="resendBtn"
disabled>

Resend Code

</button>

</div>

</div>

`;

}

/*=================
OTP Form Submission
===================*/

const otpInputs =
document.querySelectorAll<HTMLInputElement>(".otp-input");

otpInputs.forEach((input,index)=>{

input.addEventListener("input",()=>{

input.value=input.value.replace(/\D/g,"");

if(input.value.length===1){

otpInputs[index+1]?.focus();

}

});

input.addEventListener("keydown",(e)=>{

if(e.key==="Backspace" && input.value===""){

otpInputs[index-1]?.focus();

}

});

});

/*=================
OTP Paste Handling
===================*/

otpInputs[0].addEventListener("paste",(e)=>{

e.preventDefault();

const paste=e.clipboardData?.getData("text") ?? "";

if(!/^\d{6}$/.test(paste)) return;

paste.split("").forEach((digit,index)=>{

otpInputs[index].value=digit;

});

otpInputs[5].focus();

});

/*=================
OTP Countdown Timer
===================*/

const countdown =
document.getElementById("countdown") as HTMLElement;

const resend =
document.getElementById("resendBtn") as HTMLButtonElement;

let seconds=180;

const timer=setInterval(()=>{

seconds--;

countdown.textContent=seconds.toString();

if(seconds===0){

clearInterval(timer);

countdown.textContent="0";

resend.disabled=false;

}

},1000);

/*=================
Resend OTP Handling
===================*/

resend.addEventListener("click",()=>{

alert("A new OTP has been sent."); // Simulate OTP resend

seconds=60;

resend.disabled=true;

window.location.reload(); // Reset the timer and reload the page to simulate a new OTP being sent

});

/*=================
verify OTP 
===================*/

const form =
document.getElementById("otpForm") as HTMLFormElement;

const loader =
document.getElementById("loader") as HTMLElement;

form.addEventListener("submit",(e)=>{

e.preventDefault();

let otp="";

otpInputs.forEach(input=>{

otp+=input.value;

});

if(otp.length!==6){

alert("Please enter the 6-digit OTP.");

return;

}

loader.style.display="block";

setTimeout(()=>{

loader.style.display="none";

/*=======================

Backend:

POST /api/admin/verify-otp

{
otp:"123456"
}

========================*/

window.location.href="/reset-password.html";

},1500);

});