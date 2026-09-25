# TrustFix — Verified Home Service Platform

TrustFix is a modern, verified home service platform connecting Customers, Providers, and Administrators. It features a React + Vite frontend and a Spring Boot 3 REST API backend backed by a MySQL database.

---

## 🛠 Tech Stack & Architecture

- **Frontend**: React 18, Vite, React Router v6, Axios (`apiClient`), Vanilla CSS (Rich aesthetics, dark mode, glassmorphism, responsive micro-animations).
- **Backend**: Java 21, Spring Boot 3.3.4, Spring Security, JWT (`io.jsonwebtoken`), Spring Data JPA, BCrypt Password Hashing, Spring Boot Actuator.
- **Database**: MySQL 8.0+.
- **Authentication**: JWT Bearer Token (`Authorization: Bearer <token>`) with Role-Based Access Control (`CUSTOMER`, `PROVIDER`, `ADMIN`).

---

## ⚙️ Production Environment Variables

### Backend Configuration (`backend/.env.example`)

Set the following environment variables in your deployment environment or backend `.env` file:

```env
# Database Settings
DB_HOST=localhost
DB_PORT=3306
DB_NAME=trustfix
DB_USERNAME=root
DB_PASSWORD=YOUR_SECURE_MYSQL_PASSWORD

# Security & JWT Configuration
JWT_SECRET=YOUR_SECURE_LONG_RANDOM_JWT_SECRET_KEY
JWT_EXPIRATION=86400000

# CORS Allowed Origins
APP_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```

### Frontend Configuration (`frontend/.env.example`)

Set the API base URL in `frontend/.env`:

```env
VITE_API_BASE_URL=http://localhost:8080/api
VITE_APP_NAME=TrustFix
VITE_APP_TAGLINE=Verified Home Service Platform
```

---

## 🚀 Development Setup & Local Run

### 1. MySQL Setup

Create the MySQL database:
```sql
CREATE DATABASE trustfix CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 2. Backend Startup

```bash
cd backend
mvn spring-boot:run
```
The backend server runs on `http://localhost:8080`.
Verify backend health: `http://localhost:8080/actuator/health`

### 3. Frontend Startup

```bash
cd frontend
npm install
npm run dev
```
The frontend dev server runs on `http://localhost:3000` or `http://localhost:5173`.

---

## 📦 Production Build Commands

### Backend Production Build
```bash
cd backend
mvn clean package -DskipTests
```
Generates the executable JAR at `backend/target/trustfix-backend-0.0.1-SNAPSHOT.jar`. Run with:
```bash
java -jar backend/target/trustfix-backend-0.0.1-SNAPSHOT.jar
```

### Frontend Production Build
```bash
cd frontend
npm run build
```
Generates static production assets in `frontend/dist/`.

---

## 🔐 Security & Hardening Features

1. **Role-Based Authorization & IDOR Protection**: Backend ownership validation (`SecurityUtil.java`) enforces that customers can only view/modify their own accounts, addresses, and bookings. Cross-account access attempts return `403 Forbidden`.
2. **Booking Lifecycle & Past-Date Guard**: Status transitions are restricted to valid paths (`PENDING -> CONFIRMED -> IN_PROGRESS -> COMPLETED/CANCELLED`). Booking appointments in the past returns `400 Bad Request`.
3. **Stateless JWT Sessions**: Tokens are signed with HS256/512 algorithms. Missing or expired tokens return `401/403`.
4. **CORS Hardening**: Explicitly origin-restricted. Wildcard origins (`*`) with credentials disabled.
5. **No Password/Token Leakage**: Passwords hashed with BCrypt. Sensitive keys excluded from console logs and Git.

---

## 🧑‍💻 Default Accounts

- **Admin**: `admin@trustfix.com` / `231182157800100950` (or `pushpendraydv1010@gmail.com` / `231182157800100950`)
- **Customer & Provider**: Register new verified accounts via the `/register` page.
