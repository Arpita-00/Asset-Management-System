# AI-Powered Smart Asset Management System

A full-stack asset management platform for tracking organizational assets, allocations, maintenance, warranty status, depreciation, vendors, reports, QR-based asset passports, OCR invoice extraction, and AI-assisted asset queries.

The project uses a React frontend, a Node.js/Express backend, Sequelize models, and MySQL. Docker Compose is included for running the complete stack locally.


## Features

- Asset inventory with categories, departments, locations, health scores, and lifecycle status.
- Employee allocation, transfer, return, and asset movement history.
- Dashboard views for asset counts, warranty alerts, maintenance status, and key metrics.
- Maintenance request tracking and warranty monitoring.
- Vendor management and vendor rating support.
- Depreciation calculation and depreciation records.
- QR code generation and asset passport pages.
- OCR scanner for extracting invoice or asset document details.
- AI assistant powered by Gemini when `GEMINI_API_KEY` is configured.
- PDF and Excel report generation.
- JWT authentication, refresh tokens, role-based access control, audit logs, and notifications.
- Swagger API documentation for backend endpoints.

## Tech Stack

**Frontend**

- React 18
- Vite
- React Router
- TanStack Query
- Zustand
- Tailwind CSS
- Axios
- Recharts
- Lucide React

**Backend**

- Node.js 20+
- Express.js
- Sequelize ORM
- MySQL 8
- JWT and bcryptjs
- Swagger UI
- Tesseract.js
- PDFKit and ExcelJS
- Nodemailer
- node-cron

## Project Structure

```text
Asset-Management-System/
|-- backend-node/          # Express API, Sequelize models, services, routes
|-- frontend/              # React/Vite user interface
|-- docs/                  # SQL schema and Mermaid ER diagram
|-- docker-compose.yml     # MySQL, backend, and frontend services
|-- README.md              # Project overview and setup guide
```

## Prerequisites

- Node.js 20 or newer
- npm
- MySQL 8, unless you use Docker Compose
- Docker and Docker Compose, optional but recommended for the full stack

## Environment Setup

Create a `.env` file in the project root before running with Docker Compose or the backend service.

```env
MYSQL_ROOT_PASSWORD=root
MYSQL_DATABASE=asset_management_db
MYSQL_USER=asset_user
MYSQL_PASSWORD=asset_password

MYSQL_HOST=db
MYSQL_PORT=3306

SERVER_PORT=8080
APP_BASE_URL=http://localhost:8080
FRONTEND_URL=http://localhost:5173

JWT_SECRET=replace-with-a-strong-secret
ENCRYPTION_KEY=replace-with-a-64-character-hex-key

GEMINI_API_KEY=
GEMINI_MODEL=gemini-1.5-flash

MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=
MAIL_PASSWORD=
MAIL_FROM_NAME=Asset Management System
MAIL_FROM_ADDRESS=noreply@assetms.com
```

For local backend development without Docker, use `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USERNAME`, and `DB_PASSWORD`, or point the `MYSQL_*` variables to your local MySQL server.

The frontend reads `VITE_API_BASE_URL`. If it is not set, the app defaults to `http://localhost:8080/api`.

```env
VITE_API_BASE_URL=http://localhost:8080/api
```

## Run with Docker Compose

From the project root:

```bash
docker compose up --build
```

Services:

- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:8080`
- Swagger UI: `http://localhost:8080/api/swagger-ui`
- Health check: `http://localhost:8080/api/actuator/health`
- MySQL: `localhost:3306`

## Run Locally for Development

Start MySQL and create the database:

```sql
CREATE DATABASE asset_management_db;
```

Install and run the backend:

```bash
cd backend-node
npm install
npm run dev
```

Install and run the frontend in another terminal:

```bash
cd frontend
npm install
npm run dev
```

Local development URLs:

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:8080`
- Swagger UI: `http://localhost:8080/api/swagger-ui`

## Useful Commands

Backend:

```bash
cd backend-node
npm run dev      # Start API with nodemon
npm start        # Start API with node
npm test         # Run Jest tests with coverage
```

Frontend:

```bash
cd frontend
npm run dev      # Start Vite dev server
npm run build    # Build production assets
npm run preview  # Preview production build
```

## API Overview

All backend routes are prefixed with `/api`.

Key route groups:

- `/auth` - login, registration, password reset, profile, token refresh
- `/assets` - asset CRUD, stats, movement history
- `/allocations` - assign, return, transfer, and list allocations
- `/departments` - department management
- `/employees` - employee management
- `/vendors` - vendor management
- `/maintenance` - maintenance requests and tracking
- `/warranty` - warranty records and alerts
- `/depreciation` - depreciation records and calculations
- `/health` - asset health scoring
- `/dashboard` - dashboard summary data
- `/notifications` - user notifications
- `/audit-logs` - audit trail
- `/qr` - QR code generation and lookup
- `/reports` - PDF and Excel exports
- `/ai` - AI assistant endpoints
- `/ocr` - OCR scanning
- `/users` - user administration

Open the full API documentation at `http://localhost:8080/api/swagger-ui`.

## Database and Documentation

- SQL schema: `docs/schema.sql`
- ER diagram: `docs/er_diagram.mmd`
- Sequelize model definitions: `backend-node/src/models/`

The backend connects to MySQL through Sequelize and can create or sync tables based on the configured model definitions.

## Notes

- Gemini AI responses require `GEMINI_API_KEY`. Without it, the AI service may fall back to limited rule-based behavior.
- OCR uses Tesseract.js and may need to download language data on first use.
- Uploaded files, generated QR codes, and avatars are stored under `uploads/` by default.
- Docker Compose serves the production frontend build on port `3000`, while Vite development uses port `5173`.
