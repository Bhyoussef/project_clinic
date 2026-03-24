# Clinic Appointment Booking System

Scalable full-stack clinic booking starter with OTP authentication, JWT sessions, and profile onboarding for new users.

## Stack

- **Frontend:** React with Vite and Tailwind CSS
- **Backend:** Node.js with Express
- **Database:** MySQL
- **Authentication:** OTP verification with JWT session tokens

## Backend Database Layer

The backend connects to MySQL through `mysql2/promise` and uses prepared statements everywhere via the shared `executeQuery` helper in `backend/src/config/db.js`.

Implemented backend models:

- `users`
- `doctors`
- `appointments`
- `time_slots`
- `notifications`
- `otp_codes`

On startup, the backend:

1. Tests the MySQL connection.
2. Initializes the database schema if the required tables do not exist.

## Project Structure

```text
.
├── backend/
│   ├── package.json
│   └── src/
│       ├── app.js
│       ├── server.js
│       ├── config/
│       ├── controllers/
│       ├── middlewares/
│       ├── models/
│       ├── routes/
│       ├── services/
│       └── utils/
├── frontend/
│   ├── package.json
│   ├── index.html
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   └── src/
│       ├── components/
│       ├── context/
│       ├── hooks/
│       ├── pages/
│       └── services/
└── package.json
```

## Auth Flow

1. User enters a phone number on the frontend.
2. Frontend calls `POST /api/auth/send-otp`.
3. Backend generates a 6-digit OTP, stores it in MySQL, and logs it to the console.
4. User enters the OTP and frontend calls `POST /api/auth/verify-otp`.
5. Backend validates the OTP and returns a JWT plus user payload.
6. New users complete their profile with name, email, and DOB.

## Environment Variables

Create `backend/.env` from `backend/.env.example` and configure:

```bash
PORT=5000
CLIENT_URL=http://localhost:5173
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=password
DB_NAME=clinic_booking
DB_CONNECTION_LIMIT=10
JWT_SECRET=super-secret-jwt-key
OTP_EXPIRY_MINUTES=5
```

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the backend:
   ```bash
   npm run dev:backend
   ```
3. Start the frontend:
   ```bash
   npm run dev:frontend
   ```
