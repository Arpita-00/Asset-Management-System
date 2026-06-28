# Source Structure & Architecture

This document describes the design patterns, code organization, and folder structure of both the frontend (React + TailwindCSS) and backend (Node.js + Express + Sequelize) components of the **AI-Powered Smart Asset Management System**.

---

## 1. Project Directory Layout

The project uses a structured monorepo-style setup containing dedicated frontend and backend services:

```
Asset-Management-System/
├── docs/                      # Database schemas, ER diagrams, and markdown docs
├── frontend/                  # React.js SPA (Vite + TailwindCSS)
├── backend-node/              # Node.js + Express.js + Sequelize REST API
└── docker-compose.yml         # Container orchestration configuration
```

---

## 2. Frontend Source Structure (`frontend/src/`)

The frontend application follows a feature-based layout structure with centralized state management, API routes, and visual layouts.

```
frontend/src/
├── main.jsx                   # Entry point of the React app
├── App.jsx                    # Routing configuration, toast wrappers, and app shell
├── index.css                  # Custom Tailwind configurations and scrollbar resets
├── api/                       # API communication layers
│   ├── axiosClient.js         # Axios instance with request/response interceptors for JWT
│   ├── authApi.js             # API calls for login, logout, profile retrieval, token refresh
│   ├── assetApi.js            # API wrapper for asset queries, creations, edits, QR fetch
│   ├── userApi.js             # API client for managing users, roles, and profile settings
│   └── mockData.js            # Offline mock database for demo configurations
├── assets/                    # Static graphics, logotypes, and default asset images
├── components/                # Reusable presentation and layout components
│   ├── common/                # Shared atomic components
│   │   ├── PageLoader.jsx     # Full-screen spinner for route transitions
│   │   ├── ErrorBoundary.jsx  # React boundary to catch runtime component crashes
│   │   ├── NotFoundPage.jsx   # Clean 404 fallback page
│   │   └── ComingSoonPlaceholder.jsx # Feature placeholder layout
│   └── layout/                # Main application frame
│       ├── AppLayout.jsx      # Holds Sidebar + TopBar wrapper for authenticated pages
│       ├── Sidebar.jsx        # Responsive navigation panel supporting dark-mode transitions
│       ├── TopBar.jsx         # Header detailing user profiles, alerts, notifications, and language select
│       └── ProtectedRoute.jsx # Route guard checking user auth state
├── hooks/                     # Custom hooks encapsulating component-level logic
│   ├── useDebounce.js         # Controls input delays (e.g. for search bars)
│   └── useToast.js            # Standardized notification alerts
├── pages/                     # High-level route screen components
│   ├── dashboard/             # Analytics cards, charts, and metrics dashboard
│   ├── auth/                  # Login and register pages
│   ├── assets/                # Core CRUD views: asset listing, detailed card, edit forms
│   ├── allocation/            # Forms for allocating assets to employees
│   ├── return/                # Interface for returns and log entries
│   ├── maintenance/           # Maintenance requests listing, updates, and creation modals
│   ├── depreciation/          # Interactive calculator and historical record charts
│   ├── ocr/                   # Drag-and-drop area for scanning invoices (Tesseract.js integration)
│   ├── ai/                    # Multi-turn chatbot window for natural language queries
│   ├── reports/               # UI to download PDF/Excel summaries
│   ├── qr/                    # QR scanner interface and printing layout
│   ├── users/                 # Admin console for user management
│   ├── vendors/               # Vendor directories and supplier performance reviews
│   └── settings/              # Settings for notifications and localizations
├── store/                     # Client state stores powered by Zustand
│   ├── authStore.js           # Holds access token, user metadata, and auto-logout timings
│   ├── themeStore.js          # Directs dark-mode/light-mode stylesheets
│   └── languageStore.js       # Supports translation lookups
└── utils/                     # Generic utility scripts (formatters, validators)
```

---

## 3. Backend Source Structure (`backend-node/src/`)

The backend is built as an Express API following a **Service-Controller-Model architecture** (often called the 3-Layer Architecture). This separation decouples HTTP routing, business logic, and database operations.

```
backend-node/src/
├── server.js                  # Entry script: boots Express, setups middlewares, runs DB sync
├── scheduler.js               # Scheduled worker triggering cron routines (depreciation, health, warranties)
├── config/                    # Configuration layers
│   ├── env.js                 # Validation and parsing of environment variables (.env)
│   ├── database.js            # Sequelize instantiation and MySQL connection pooling
│   ├── mailer.js              # Nodemailer SMTP transporter configuration
│   ├── seeder.js              # Database seeder injecting initial roles, users, and departments
│   └── swagger.js             # Swagger configuration details
├── middleware/                # Express middleware pipeline
│   ├── auth.js                # Authenticates requests by parsing and verifying Bearer JWTs
│   ├── encrypt.js             # Form-level decryption or encryption operations
│   ├── errorHandler.js        # Global error interception boundary formatting API responses
│   └── rbac.js                # Role-Based Access Control checker asserting path authorizations
├── models/                    # Sequelize relational model definitions
│   ├── index.js               # Resolves table relationships, indices, and exports Sequelize models
│   ├── User.js                # Holds security details, verification statuses, and relation keys
│   ├── Role.js                # Holds security group definitions (Super Admin, Admin, Employee)
│   ├── Employee.js            # Individual employee profile information
│   ├── Department.js          # Company departments (IT, HR, Operations, Finance, etc.)
│   ├── Asset.js               # Core asset records with categories, statuses, values, and specifications
│   ├── AssetCategory.js       # Asset categories (e.g. Laptop, Server, Furniture)
│   ├── AssetAllocation.js     # Tracking of assets allocated to employees
│   ├── AssetMovement.js       # Location/department movement audit records
│   ├── MaintenanceRequest.js  # Maintenance tickets, assignments, costs, and statuses
│   ├── WarrantyTracking.js    # Warranty periods, contact emails, and alert flags
│   ├── AssetDocument.js       # Scanned files, invoice paths, and extracted OCR text
│   ├── DepreciationRecord.js  # Calculated financial year-by-year asset valuations
│   ├── AssetHealthScore.js    # Metric-based scoring results (0-100 score + risk level)
│   ├── Notification.js        # Log of in-app alert histories
│   ├── AuditLog.js            # Immutable change logs tracking every create/update/delete operation
│   ├── BudgetForecast.js      # Category/department-specific expenditure forecasts
│   └── AiChatHistory.js       # User-assistant conversational thread histories
├── routes/                    # Route routers connecting paths to controller services
│   ├── auth.js                # Endpoints for login, refresh token, password reset, and registration
│   ├── assets.js              # Endpoints for asset creation, lookup, tagging, and updates
│   ├── allocations.js         # Endpoints for asset check-out and return operations
│   ├── maintenance.js         # Endpoints for creating and completing maintenance tickets
│   ├── health.js              # Endpoints for inspecting health diagnostics
│   ├── depreciation.js        # Endpoints for calculating depreciation schedules
│   ├── reports.js             # Endpoints for PDF and Excel exports
│   ├── ocr.js                 # Endpoints for invoice uploads and Tesseract extraction processing
│   ├── ai.js                  # Endpoints to query the AI assistant and retrieve chat history
│   └── ... (others)           # Routers for departments, users, audit logs, notifications, etc.
├── services/                  # Business logic layers (controller logic and utility calls)
│   ├── authService.js         # Credential validation, token generation, and account activations
│   ├── assetService.js        # Business validations for asset lifecycle changes
│   ├── allocationService.js   # Logical validation when assigning/returning assets
│   ├── maintenanceService.js  # Logic managing repair requests, costs, and tech assignments
│   ├── assetHealthService.js  # Computes math scores (0-100) based on age, downtime, and cost
│   ├── depreciationService.js # Executes WDV/Straight Line depreciation algorithms
│   ├── ocrService.js          # OCR image processing, parsing, and metadata mapping
│   ├── aiService.js           # Prompt engineering and communications with LLM engine
│   ├── reportService.js       # Formulates structures for PDFKit and ExcelJS exports
│   └── emailService.js        # Formats HTML templates and dispatches Nodemailer alerts
└── utils/                     # Utility libraries and helpers
    ├── apiResponse.js         # Unified formatting for API success/error payloads
    ├── logger.js              # Winston daily rotate logger setup
    ├── healthScoreCalculator.js # Mathematical logic for asset health scores
    ├── depreciationCalculator.js# Math formulas for Straight Line and Written Down Value (WDV)
    ├── assetTagGenerator.js   # Generates formatted asset tags (AST-YYYY-XXXXXX)
    ├── qrCodeGenerator.js     # Generates base64 QR codes containing asset links
    └── encryptionUtils.js     # Field-level hash encryption helpers
```

---

## 4. Key Architectural Patterns

1. **Decoupled Request Lifecycle**:
   - The React UI invokes an API call via an Axios utility function wrapper.
   - The request hits backend CORS, Helmet, and Rate Limit filters.
   - The route handler invokes `auth.js` middleware to decrypt the authorization JWT.
   - If user clearance is sufficient, the route calls the target Service.
   - The Service manages transactional data via Sequelize ORM, executes validations, and logs modifications via the `auditLogService.js`.
   - The Service returns the standardized JSON response wrapper (`apiResponse.js`).

2. **Server State Management (React Query)**:
   - Eliminates redundant local state flags.
   - Transparently caches server-loaded collections (e.g. Assets List, Categories, Notifications).
   - Dynamically invalidates cached queries upon data modifications (mutations) to guarantee current screen metrics.

3. **Stateless JWT Authorization with Rotating Refresh Tokens**:
   - Short-lived Access Tokens (e.g., 15 minutes) prevent replay compromises.
   - Long-lived, database-stored Refresh Tokens (e.g., 7 days) enable seamless React client re-authorization through Axios response interceptors.
   - User security clearance is checked against user-assigned roles mapped directly in JWT payloads.
