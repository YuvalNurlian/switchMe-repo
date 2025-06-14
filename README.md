# Switch Me – Product Exchange Platform

This project is a web application that allows users to exchange products using smart matching algorithms, with a clean UI and seamless backend integration.

##  Tech Stack

- **Frontend**: Angular (HTML, CSS, TypeScript)
- **Backend**: Node.js (TypeScript), Express-style architecture
- **Database**: PostgreSQL + Firebase (for authentication and/or storage)
- **AI Integration**: Google Gemini API

---

##  Setup Instructions

### 1. Clone the Repository
```bash
git clone https://github.com/YuvalNurlian/switchMe-repo.git
cd switchMe-repo
```

### 2. Frontend Setup (Angular)

```bash
cd switchMe-repo
npm install
ng serve
```

The frontend will run at: `http://localhost:4200`

### 3. Backend Setup (Node.js / TypeScript)

```bash
cd my-backend
npm install
npm run start:dev
```

The backend will run at: `http://localhost:3000` (or the port you set)

---

##  Environment Configuration

Make sure to create a `.env` file inside the `my-backend/` folder with the following keys:

```env
PORT=3000
# Gemini API
GEMINI_API_KEY=your_gemini_api_key_here

# PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_postgres_password
DB_NAME=switch_me

# Firebase (במידת הצורך בשרת)
FIREBASE_API_KEY=your_firebase_api_key_here
FIREBASE_AUTH_DOMAIN=switch-me-2980a.firebaseapp.com
FIREBASE_PROJECT_ID=switch-me-2980a
FIREBASE_STORAGE_BUCKET=switch-me-2980a.appspot.com
FIREBASE_MESSAGING_SENDER_ID=48065055712
FIREBASE_APP_ID=1:48065055712:web:4682cf397750ac13333985
FIREBASE_MEASUREMENT_ID=G-ESQXV28KBZ
```

*Replace the values accordingly.*

---

##  API Overview

- `/product` – Get, Insert, Update and manage products
- `/category` – Get and manage categories
- `/condition` – Get and manage conditions
- `/auth.service` – Authentication and user data
- `/prive-estimate` – Connects to Gemini API for intelligent matching

---

##  User Guide

1. Sign up and log in through the UI.
2. Add a product and fill in its category, condition, and location.
3. View available products and express interest ("Interested" / "Not Interested").
4. The backend will suggest potential matches using AI.
5. Use the contact buttons to connect with other users.

---

## Scripts Summary

| Command                  | Description                |
|--------------------------|----------------------------|
| `ng serve`               | Run frontend locally       |
| `npm run start:dev`      | Run backend in dev mode    |
| `npm install`            | Install dependencies       |

---

##  Requirements

- Node.js v18+
- Angular CLI 17+
- PostgreSQL
- Firebase project
- Gemini API key (from Google AI Studio)

---

## 🙋 Authors

- Yuval Nurlian  
- Sahar Slavkin

---

