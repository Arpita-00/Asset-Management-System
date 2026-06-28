# Technical Stack & Requirements

This document provides a comprehensive overview of the technical requirements, system architecture, dependencies, and integration components of the **AI-Powered Smart Asset Management System**.

---

## 1. System Architecture Overview

The system is designed as a modern, decoupled **Client-Server architecture** containerized via Docker for reliable deployment and scalability.

```
                      +---------------------------+
                      |       Client (Web)        |
                      | React, Tailwind, Zustand  |
                      +-------------+-------------+
                                    |
                           HTTPS REST Requests
                                    v
                      +---------------------------+
                      |     Application API       |
                      |    Node.js + Express      |
                      +------+-------------+------+
                             |             |
                 SQL Queries |             | API / Library calls
                             v             v
             +-----------------+   +--------------------------+
             | Database Engine |   | External & Local Serv.   |
             |    MySQL 8.0    |   | - Tesseract.js (OCR)     |
             +-----------------+   | - Gemini / AI Service    |
                                   | - Nodemailer (SMTP)      |
                                   +--------------------------+
```

---

## 2. Frontend Technology Stack

The client application is built as a single-page application (SPA) using React, styled with TailwindCSS, and optimized with Vite.

### Core Libraries
- **React.js (v18.2.0)**: Used as the core UI rendering engine for component-based, declarative view management.
- **Vite**: Modern build tool providing fast Hot Module Replacement (HMR) and optimized Rollup production builds.
- **React Router DOM (v6.14.1)**: Declarative, client-side routing solution managing navigation, protected route guards, and query param state.

### State Management & Data Fetching
- **Zustand (v4.4.0)**: Light, fast, store-based state management. Used for global, client-side states:
  - **Auth Store**: Manages active user sessions, tokens (access/refresh), token expiry timers, and auto-logout logic.
  - **Theme Store**: Directs light/dark mode and interface styling settings.
  - **Language Store**: Manages dynamic localization settings.
- **TanStack React Query (v4.35.0)**: Server-state synchronization library. Used to handle caching, background refetching, optimistic updates, and server mutation states for API calls.

### UI & Styling
- **TailwindCSS (v3.3.6)**: Utility-first CSS framework for custom, highly-responsive styles, micro-animations, and seamless dark-mode themes.
- **Lucide React (v0.263.1)**: Vector icons set providing clean and customizable line icons for the interface.
- **React Hot Toast (v2.4.1)**: Toast notification system providing non-intrusive alerts for user actions (success, warning, error).
- **Recharts (v2.6.0)**: Composable charting library used for data-rich dashboards, depreciation curve graphs, and maintenance cost analyses.
- **React Hook Form (v7.45.0)**: Performant, flexible library for form state management, submission handling, and integration with Joi schema validators.

### Utilities
- **Axios**: Promise-based HTTP client config with global interceptors. Interceptors dynamically inject access tokens and handle transparent token refreshing when `401 Unauthorized` errors occur.
- **Date-fns (v2.30.0)**: Date manipulation library used to format purchase dates, warranty expirations, and timeline events.
- **Qrcode.react (v3.1.0)**: Utility for generating and rendering scan-ready QR codes directly in browser pages.

---

## 3. Backend Technology Stack

The server application is a RESTful API service built on Node.js using Express.js and Sequelize ORM for MySQL.

### Core Frameworks & Runtime
- **Node.js (>=20.0.0)**: V8-based JavaScript runtime environment.
- **Express.js (v4.19.2)**: Minimalist, flexible web application framework managing routes, middleware pipelines, and controller endpoints.
- **Sequelize (v6.37.3)**: Promise-based Node.js ORM. Handles relational mappings, associations, connection pooling, and schema sync validations with MySQL.
- **MySQL 8.0+**: Primary relational database system storing critical assets, transactions, logs, and user metadata.

### Security & Authentication
- **JSON Web Tokens (JWT) (v9.0.2)**: Used for secure, stateless user authentication and session management. Access tokens have short lifetimes, while refresh tokens are securely rotated.
- **BcryptJS (v2.4.3)**: High-security password hashing algorithm used to securely store credentials.
- **Helmet (v7.1.0)**: Secures HTTP headers to protect the Express app against common vulnerabilities (XSS, clickjacking, etc.).
- **Cors (v2.8.5)**: Cross-Origin Resource Sharing middleware enabling restricted communication between frontend and backend ports.
- **Express Rate Limit (v7.3.1)**: Rate-limiting middleware to prevent brute-force authentication attacks and DOS attempts on resource-intensive endpoints.

### File Processing & Machine Learning
- **Tesseract.js (v5.1.0)**: Pure JavaScript port of Tesseract OCR. Analyzes scanned invoices and warranty cards directly on the server to extract text details.
- **Multer (v1.4.5)**: Middleware for handling multi-part form data. Uploads and validates invoice PDFs and asset images before local or cloud storage.
- **ExcelJS (v4.4.0)** & **PDFKit (v0.15.0)**: Libraries used to programmatically assemble, format, and generate downloadable reports.
- **Node QRCode (v1.5.4)**: Serves server-side QR Code image generation for assets.
- **Nodemailer (v6.9.14)**: SMTP email client used to send notifications, password reset links, and critical warranty warning alerts.

### Job Scheduling & Monitoring
- **Node-Cron (v3.0.3)**: Cron-based task scheduler. Runs automated daily schedules to recalculate asset depreciation, inspect expiring warranties, check health scores, and queue system alerts.
- **Winston & Winston Daily Rotate File**: Professional logging framework writing structured JSON logs (info, warn, error) to daily rotating file streams for debugging.

---

## 4. Development & Deployment Tools

- **Docker & Docker Compose**: Orchestrates multi-container environments. Spins up standard, isolated services for the database (MySQL), API server, and Vite dev server.
- **Nodemon**: Hot-reloading daemon wrapper for backend files, accelerating the development feedback loop.
- **Jest & Supertest**: Testing framework and HTTP assertion library used for unit testing utility modules and integration testing key REST endpoints.

---

## 5. Google Gemini AI & RAG Architecture

The platform integrates **Google Gemini API** (`@google/generative-ai`) to serve as an intelligent, context-aware divisional asset assistant.

### AI Integration Flow
1. **User Request**: The user submits a question through the frontend chatbot (`SmartAssistant.jsx` or `AiAssistantPage.jsx`).
2. **Context Querying**: The backend receives the question and triggers a semantic router.
3. **Structured MySQL RAG**: The backend queries the MySQL database using Sequelize to compile the latest status counts, active warranties, and open maintenance requests.
4. **Context Construction**: The backend bundles this structured database data together with the user's question, applying safety filters and system prompts.
5. **Gemini Execution**: The query is sent securely via HTTPS using the server-stored `GEMINI_API_KEY`.
6. **Response**: The assistant returns an actionable, formatted Markdown answer to the frontend client.

---

## 6. Deployment & Host Environment Checklist

### Prerequisites
- Node.js runtime environment (v18.0.0 or higher).
- MySQL Server (v8.0.0 or higher).
- Docker and Docker Compose (optional, for containerized deployments).
- Active Google Gemini API Key.

### Host Setup Steps
1. **Configuration**: Create a production `.env` file inside the `backend-node/` directory containing all secret credentials (passwords, JWT key, and Gemini key).
2. **Service Orchestration**: Use Docker Compose for automated multi-container deployment:
   ```bash
   docker compose up -d --build
   ```
3. **Process Supervision**: For bare-metal/manual VM deployments, manage the Node process using **PM2**:
   ```bash
   cd backend-node
   npm ci --only=production
   pm2 start server.js --name "ecor-backend"
   ```
4. **Reverse Proxying**: Configure Nginx as a reverse proxy on port 80/443 to route `/api` traffic to port 8080 and serve the frontend static `dist/` bundle on root requests.
