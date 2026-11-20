# Smart Travel Planning and Booking System with Weather-Based Risk Alerts

**University Final Year Project — Interim Submission**

Covers Objectives 2 & 3:
- **Objective 2:** Web-based travel planning and booking application
- **Objective 3:** Python weather decision module (Safe / Moderate / High Risk)

## Project Structure

```
Iterim_Project/
├── frontend/          # React + Tailwind + React Router
├── backend/           # Node.js + Express (MVC)
├── python-service/    # Flask weather decision module
└── README.md
```

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React, Tailwind CSS, Axios, React Router |
| Backend | Node.js, Express.js, JWT, bcrypt |
| Database | MySQL |
| Weather API | OpenWeatherMap (real-time) |
| Python | Flask — risk classification |

## User Roles

| Role | Login | Key Features |
|------|-------|--------------|
| **Customer** | Register / Login | Browse, book, weather risk, profile |
| **Staff** | Login only | Bookings, customers, weather alerts |
| **Admin** | Login only | Full system management |

## Demo Accounts

| Role | Username | Password |
|------|----------|----------|
| Customer | `nimal` | `user123` |
| Staff | `staff01` | `staff123` |
| Admin | `admin` | `admin123` |

## Setup

### 1. Database
```bash
mysql -u root -p < backend/database/schema.sql
cd backend && npm install && npm run seed
```

### 2. Python Module (port 5001)
```bash
cd python-service
pip install -r requirements.txt
python app.py
```

### 3. Backend (port 5000)
```bash
cd backend
cp .env.example .env
npm run dev
```

### 4. Frontend (port 5173)
```bash
cd frontend
npm install
npm run dev
```

Open **http://localhost:5173**

## Weather Flow (Objective 3)

```
User selects destination + date
        ↓
Node.js fetches live weather from OpenWeatherMap API
        ↓
Weather data sent to Python Flask API
        ↓
Python applies decision rules → SAFE / MODERATE / HIGH
        ↓
Result displayed + logged in MySQL
```

### Python Decision Rules
- **HIGH RISK:** Rain > 20mm OR Wind > 35 km/h
- **MODERATE:** Rain 5–20mm OR Wind 20–35 km/h
- **SAFE:** Otherwise

## Registration Form Fields
- Full Name, Username, Email, Password, Confirm Password, Phone Number

## Login
- Username + Password (works for Customer, Staff, Admin)
- **Customers** must verify their email with a 6-digit OTP (Brevo API) before login. Staff and admin accounts are unchanged.

## Email verification (Brevo API + OTP)

Customer registration creates an **unverified** account and emails a **6-digit code** through the Brevo API v3. The raw code is never stored — only a hash — with a 10-minute expiry, 60-second resend cooldown, and a maximum of 5 incorrect attempts.

The API key must stay in `backend/.env`. See **[EMAIL_SETUP.md](EMAIL_SETUP.md)** for account setup, API key, sender verification, and testing.

```env
BREVO_API_KEY=your_brevo_api_v3_key
BREVO_SENDER_EMAIL=your_verified_sender_email
BREVO_SENDER_NAME=Smart Travel Planner
CLIENT_URL=http://localhost:5173
```

```bash
cd backend && npm run migrate:email
```
