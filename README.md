# TrustFix — Verified Home Service Platform

TrustFix is a modern, verified home service platform connecting Customers, Providers, and Administrators. It features a React + Vite frontend and a Spring Boot 3 REST API backend backed by a MySQL database.

---

# 🛠 Tech Stack & Architecture

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
VITE_API_BASE_URL=http://localhost:8085/api
VITE_APP_NAME=TrustFix
VITE_APP_TAGLINE=Verified Home Service Platform
```

---

## 🚀 Quick Start (Frontend & Backend Connected)

### 1. Start the Backend API (Spring Boot)

The backend starts out of the box with embedded persistent storage (H2 in MySQL mode) and seeds categories, services, and 12+ verified providers:

```bash
cd backend
./mvnw spring-boot:run
```

- **API Base URL**: `http://localhost:8085/api`
- **Health Check**: `http://localhost:8085/actuator/health`
- **H2 Database Console**: `http://localhost:8085/h2-console` *(JDBC URL: `jdbc:h2:file:./data/trustfixdb`)*

*(Optional: To connect to an external MySQL server, set `DB_URL=jdbc:mysql://localhost:3306/trustfix` in `backend/.env`)*

### 2. Start the Frontend App (React + Vite)

```bash
cd frontend
npm install
npm run dev
```

- **Frontend Web App**: [http://localhost:3000](http://localhost:3000)
- **Browse Providers**: [http://localhost:3000/providers](http://localhost:3000/providers)

---

## 🔑 Pre-Seeded Test Credentials

| Role | Email | Password | Permissions & Features |
| :--- | :--- | :--- | :--- |
| 🛡️ **Admin** | `admin@trustfix.com` | `Admin@123` | Admin Dashboard, user verification, service management |
| 👤 **Customer** | `testcustomer@gmail.com` | `Test@123` | Booking services, real-time tracking, review submission |
| 🔧 **Provider** | `testprovider@gmail.com` | `Test@123` | Provider Dashboard, job updates, availability toggle |
| ⚡ **Electrician Pro** | `rajesh.kumar@trustfix.com` | `Test@123` | Kumar Electricals verified provider account |
| 🚰 **Plumbing Pro** | `vikram.jadhav@trustfix.com` | `Test@123` | Jadhav Quick Plumbing verified provider account |

---

## 📦 Production Build Commands

### Backend Production Build
```bash
cd backend
./mvnw clean package -DskipTests
```
Generates executable JAR at `backend/target/trustfix-backend-0.0.1-SNAPSHOT.jar`. Run with:
```bash
java -jar backend/target/trustfix-backend-0.0.1-SNAPSHOT.jar
```

### Frontend Production Build
```bash
cd frontend
npm run build
```
Generates optimized static production assets in `frontend/dist/`.

---

## 🔐 Security & Hardening Features

1. **Role-Based Authorization & IDOR Protection**: Backend ownership validation (`SecurityUtil.java`) enforces that customers can only view/modify their own accounts, addresses, and bookings.
2. **Booking Lifecycle Guard**: Validated status transitions (`PENDING -> CONFIRMED -> IN_PROGRESS -> COMPLETED/CANCELLED`). Past-date bookings rejected.
3. **Stateless JWT Sessions**: Tokens signed with HS256/512 algorithms.
4. **CORS Hardening**: Origin-restricted to `http://localhost:3000` with credential support.
5. **No Password/Token Leakage**: Passwords hashed with BCrypt, sensitive tokens excluded from logs.
