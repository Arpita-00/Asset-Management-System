# East Coast Railway Divisional Asset Management System (ECoR-AMP)

An enterprise-grade, AI-powered Smart Asset Management System designed for zonal railways (ECoR division). The system provides full asset lifecycle tracking, automated QR code generation/scanning, OCR-based invoice ingestion, and a Google Gemini RAG assistant linked directly to a MySQL relational database.

---

## Features

- **Asset Lifecycle Management**: Full asset tracking (inventory, category, location, health score, and lifecycle status).
- **Zonal/Divisional Transfers**: Manage employee allocations, division transfers, returns, and track chronological movement logs.
- **Smart RAG Assistant**: Context-aware AI chatbot powered by Google Gemini, querying real-time system metrics directly from the MySQL database.
- **Automated QR Generation & Scanning**: Scan-ready QR code passport sheets generated on demand, with a built-in mobile scan lookup page.
- **OCR Invoice Ingestion**: Extract vendor purchase details and warranty parameters automatically from uploaded invoice files using Tesseract.js.
- **Depreciation & Financials**: Automatic cron-based linear depreciation calculations and purchase value records.
- **Enterprise Controls**: Role-based access control, transaction-safe Sequelize operations, action audit trails, and automatic notifications.

---

## ── Architecture Overview ──

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

## Project Structure

```text
Asset-Management-System/
|-- backend-node/          # Express API, Sequelize models, services, routes
|-- frontend/              # React/Vite user interface
|-- docs/                  # SQL schema and Mermaid ER diagram
|-- docker-compose.yml     # MySQL, backend, and frontend services
|-- README.md              # Project overview and setup guide
```

---

## ── Environment Variables ──

Copy the `.env.example` configurations to `.env` files in their respective folders:

### Backend Configuration (`backend-node/.env`)
```ini
# Application configuration
PORT=8080
NODE_ENV=production
APP_URL=http://localhost:8080
FRONTEND_URL=http://localhost:5173

# Database configuration
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=railway_asset_db

# Security
JWT_SECRET=your_jwt_signing_secret_key
JWT_EXPIRES_IN=7d

# Google Gemini API
GEMINI_API_KEY=AIzaSy...your_gemini_api_key...

# Email configuration (for sending QR labels)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
SMTP_FROM=noreply@ecor.railnet.gov.in
```

### Frontend Configuration (`frontend/.env`)
```ini
VITE_API_BASE_URL=http://localhost:8080/api
```

---

## ── Quickstart: Local Development ──

### 1. Database Setup
Ensure MySQL is running on port `3306` and the database `railway_asset_db` is created:
```sql
CREATE DATABASE railway_asset_db;
```

### 2. Launch Backend Service
Navigate to the backend directory, install dependencies, seed the database, and start the development server:
```bash
cd backend-node
npm install

# Initialize MySQL tables and seed ECoR divisional data
node src/config/seeder.js

# Launch Express server on http://localhost:8080
npm run dev
```

### 3. Launch Frontend Service
In a separate terminal, install dependencies and start the Vite dev server:
```bash
cd frontend
npm install

# Launch dev server on http://localhost:5173
npm run dev
```

---

## ── Production Deployment Guide ──

### Option A: Run with Docker Compose (Recommended)
The project includes a root `docker-compose.yml` to orchestrate all containers.

To build and spin up the entire cluster (MySQL + Node API + Frontend):
```bash
docker compose up -d --build
```
This starts:
- **MySQL Container** on port `3306` (with persistent volume mounting).
- **Backend Node Container** on port `8080`.
- **Frontend Container** served via Nginx on port `80` (or mapped port).

---

### Option B: Manual Host Deployment

#### 1. Database Deployment (MySQL)
- Install MySQL Server on your database server.
- Set up connection firewall rules allowing traffic only from the Backend IP.
- Initialize the tables and structure using:
  ```bash
  cd backend-node
  node src/config/seeder.js
  ```

#### 2. Backend API Deployment (Node.js & PM2)
- Install Node.js (v18+) on the API application server.
- Clone the repository and install packages:
  ```bash
  cd backend-node
  npm ci --only=production
  ```
- Install **PM2** globally to run the node service in the background with auto-restart on crashes:
  ```bash
  npm install -g pm2
  pm2 start server.js --name "ecor-asset-backend"
  pm2 save
  pm2 startup
  ```
- Configure Nginx as a reverse proxy to route external traffic to `http://127.0.0.1:8080`.

#### 3. Frontend Deployment (Nginx)
- Install Nginx on your web server.
- Build the production-ready optimized assets on the build server:
  ```bash
  cd frontend
  npm install
  npm run build
  ```
  This generates static build files inside the `frontend/dist` directory.
- Copy the contents of the `dist/` directory to the Nginx root folder (e.g. `/var/www/html/`).
- Configure Nginx routing rules to support React Router single-page application reloads:
  ```nginx
  server {
      listen 80;
      server_name ecor-assets.railnet.gov.in;
      root /var/www/html;
      index index.html;

      location / {
          try_files $uri $uri/ /index.html;
      }

      location /api {
          proxy_pass http://127.0.0.1:8080;
          proxy_http_version 1.1;
          proxy_set_header Upgrade $http_upgrade;
          proxy_set_header Connection 'upgrade';
          proxy_set_header Host $host;
          proxy_cache_bypass $http_upgrade;
      }
  }
  ```

---

## ── Verification Checks ──
- Check backend health endpoint: `GET http://<backend_ip>:8080/api/actuator/health` (should return `{ "status": "UP" }`).
- Check Swagger API docs: `http://<backend_ip>:8080/api/swagger-ui`
- Verify database tables and record seeds are present by running a select query on the `assets` table.
