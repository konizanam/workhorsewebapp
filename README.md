# Workhorse Web App

A frontend authentication system built using React, TypeScript, and Vite.

The project focuses on creating a modern admin login interface with password recovery and two-factor authentication (2FA) flow.

---

# Features

## Authentication Pages

### Login Page (App.tsx)
- Admin login interface
- Email input
- Password input
- Show/hide password toggle
- Remember me option
- Forgot password navigation
- Basic form validation


### Forgot Password
- User enters email address
- Sends reset request (frontend simulation)
- Redirects user to OTP verification


### OTP Verification
- 6-digit OTP input
- Automatic movement between input boxes
- Numbers only validation
- Backspace navigation
- OTP verification button
- Resend OTP countdown timer


### Reset Password
- New password input
- Confirm password input
- Password visibility toggle
- Password reset interface


---

# Technologies Used

## Frontend

- React
- TypeScript
- Vite
- React Router
- React Icons
- CSS3


## Development Tools

- Node.js
- npm
- ESLint
- Git


---

# Project Structure

```
src
│
├── pages
│   │
│   ├── Login.tsx
│   ├── ForgotPassword.tsx
│   ├── VerifyOTP.tsx
│   └── ResetPassword.tsx
│
├── App.tsx
├── App.css
├── main.tsx
└── index.css
```

---

# Installation

Clone the repository:

```bash
git clone https://github.com/konizanam/workhorsewebapp.git
```

Navigate into the project:

```bash
cd webapp
```

Install dependencies:

```bash
npm install
```

---

# Running the Application

Start the development server:

```bash
npm run dev
```

The application will run on:

```
http://localhost:5173 || http://localhost:5173
```

---

# Available Routes

| Page | Route |
|---|---|
| Login | `/` |
| Forgot Password | `/ForgotPassword` |
| Verify OTP | `/VerifyOTP` |
| Reset Password | `/ResetPassword` |

---

# Authentication Flow

```
Login
 |
 | Forgot Password
 ↓
Forgot Password
 |
 | Send Reset Link
 ↓
Verify OTP
 |
 | Verify Code
 ↓
Reset Password
```

---

# Design

The interface uses:

- Responsive authentication card layout
- Gradient background
- Google Poppins font
- Rounded input fields
- Modern buttons
- Smooth animations
- Mobile responsive design

---

# Author

PAULUS KASHIMBODE (intern)

---

# License
KONIZA INVESTMENT cc