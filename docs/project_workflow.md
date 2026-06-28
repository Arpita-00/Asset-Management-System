# Project Workflow Diagram & Description

This document details the exact runtime workflows, sequence paths, and logic flows governing the **AI-Powered Smart Asset Management System**.

---

## 0. Master Asset Lifecycle Flowchart

The following flowchart outlines the complete lifecycle of a managed asset—from procurement and OCR ingestion to operational tracking, maintenance, auditing, and retirement.

```mermaid
graph TD
    %% Define Styles
    classDef procurement fill:#d4edda,stroke:#28a745,stroke-width:2px;
    classDef inventory fill:#cce5ff,stroke:#007bff,stroke-width:2px;
    classDef allocation fill:#fff3cd,stroke:#ffc107,stroke-width:2px;
    classDef operations fill:#f8d7da,stroke:#dc3545,stroke-width:2px;
    classDef financial fill:#e2e3e5,stroke:#6c757d,stroke-width:2px;
    classDef retirement fill:#e8daef,stroke:#8e44ad,stroke-width:2px;

    subgraph Phase 1: Procurement & Ingestion
        A[Procure New Asset] --> B{Ingestion Method}
        B -->|Manual Entry| C[Fill Asset Form]
        B -->|Scan Invoice/Receipt| D[Upload Invoice Image/PDF]
        D --> E[Tesseract.js OCR Processing]
        E --> F[Extract Vendor, Cost, Date, Specs]
        F --> C
        C --> G[Create Asset Record]
        G --> H[Generate unique QR Code tag]
        H --> I[Asset Status: AVAILABLE]
    end
    
    subgraph Phase 2: Operations & Tracking
        I --> J[Physically Tag Asset with QR Code]
        J --> K{Trigger Action}
        
        %% Track Allocation
        K -->|Allocate Asset| L[Select Employee & Date]
        L --> M[Update Status: ASSIGNED]
        M --> N[Log Asset Allocation & Movement]
        N --> O[Send Nodemailer Email to Employee]
        O --> P[Employee uses Asset]
        P --> Q[Check-in/Return Asset]
        Q --> R[Update Status: AVAILABLE]
        R --> K

        %% Track Maintenance
        K -->|Report Malfunction| S[Create Maintenance Ticket: OPEN]
        S --> T[Assign Technician: IN_PROGRESS]
        T --> U[Asset Status: UNDER_REPAIR]
        U --> V[Perform Repair & Log Cost/Downtime]
        V --> W[Close Ticket: COMPLETED]
        W --> R
    end

    subgraph Phase 3: Monitoring & Audits
        K -->|Daily Cron Job| X[Run Scheduled System Tasks]
        X --> Y[Recalculate Health Score & Risk Level]
        Y --> Z{Health < 30?}
        Z -->|Yes| AA[Send Critical Alert email & flag repair]
        Z -->|No| AB[Update dashboard metrics]
        
        X --> AC[Scan Warranty End Dates]
        AC --> AD{Expiry in < 90 Days?}
        AD -->|Yes| AE[Send Warranty Expiry Warning email]
        AD -->|No| AB
        
        K --> AF[Run Financial Year Close]
        AF --> AG[Apply Depreciation: SLM or WDV]
        AG --> AH[Log Depreciation Record & Update Book Value]
    end

    subgraph Phase 4: Retirement & Disposal
        K -->|Asset End of Life / Lost| AI[Initiate Disposal Process]
        AI --> AJ[Log Disposal Reason & Salvage Value]
        AJ --> AK[Asset Status: DISPOSED / RETIRED]
        AK --> AL[Deactivate Asset in Inventory]
    end

    %% Apply Classes
    class A,B,C,D,E,F,G,H,I procurement;
    class J,K,Q,R inventory;
    class L,M,N,O,P allocation;
    class S,T,U,V,W operations;
    class X,Y,Z,AA,AB,AC,AD,AE,AF,AG,AH financial;
    class AI,AJ,AK,AL retirement;
```

---


## 1. User Authentication & Session Refresh Workflow

Ensures stateless, secure API communication while maintaining a seamless user experience.

```mermaid
sequenceDiagram
    autonumber
    actor User as Client Browser
    participant Store as Zustand Auth Store
    participant API as Axios Client Interceptor
    participant Backend as Express API
    database DB as MySQL DB

    User->>Store: Enter credentials & click Login
    Store->>Backend: HTTP POST /api/auth/login
    Backend->>DB: Query User & verify bcrypt password hash
    DB-->>Backend: User credentials valid
    Backend-->>Store: Response 200 (Access Token, Refresh Token, User Metadata)
    Store->>Store: Save tokens in LocalStorage via Persist Middleware
    Store-->>User: Redirect to Dashboard Page

    Note over User, Backend: -- Submitting an Authenticated Request --
    User->>API: Click "View Assets" page
    API->>API: Read Access Token from Zustand store
    API->>Backend: HTTP GET /api/assets (with Bearer Token header)
    
    alt Access Token is Valid
        Backend->>Backend: Validate JWT signature & check RBAC claims
        Backend-->>User: Return Assets List (JSON)
    else Access Token is Expired
        Backend-->>API: Response 401 Unauthorized (Token Expired)
        API->>Backend: HTTP POST /api/auth/refresh (with Refresh Token)
        Backend->>DB: Validate Refresh Token matches active DB record
        DB-->>Backend: Refresh Token is valid
        Backend-->>API: Return new Access Token & rotating Refresh Token
        API->>API: Update Zustand Store with new tokens
        API->>Backend: Retry original HTTP GET /api/assets (with new Bearer Token)
        Backend-->>User: Return Assets List (JSON)
    end
```

### Steps Description:
1. **Initial Login**: User posts credentials. The server verifies the password against the bcrypt hash in the database.
2. **Token Issuance**: The server generates a short-lived Access Token (15 mins) and a long-lived Refresh Token (7 days) and returns them alongside user details.
3. **Session Interceptor**: The Axios client automatically injects the Access Token into the HTTP headers for all requests.
4. **Auth Expiry & Refresh**: If a request fails with a `401 Unauthorized` status (due to token expiration), the client silently requests a token refresh. If valid, the new token is saved, and the original request retries transparently without interrupting the user.

---

## 2. Smart OCR Invoice Asset Ingestion Workflow

Simplifies asset creation by extracting technical details and purchase dates from scanned documents.

```mermaid
graph TD
    A[User uploads PDF/Image invoice in UI] --> B(Frontend appends file to FormData)
    B --> C[HTTP POST /api/ocr/upload to Node backend]
    C --> D[Multer middleware validates file type & size]
    D --> E[ocrService invokes Tesseract.js OCR engine]
    E --> F[Extract raw text string from document image]
    F --> G[Run regex pattern matchers on text block]
    G --> H[Parse Invoice Number, Date, Purchase Cost, Vendor Name]
    H --> I[Return structured JSON back to Frontend]
    I --> J[UI auto-populates Asset creation fields for user review]
    J --> K[User makes edits if needed & clicks Save]
    K --> L[HTTP POST /api/assets to finalize asset creation]
    L --> M[(Database saves Asset, generates Tag & creates Audit log)]
```

### Steps Description:
1. **Upload Invoice**: An administrator uploads a digital receipt or scanned invoice.
2. **Text Extraction**: The backend processes the document locally using Tesseract OCR, converting images to text.
3. **Regex Extraction**: Custom parsing patterns search for currency symbols, monetary values, date formats (e.g. DD/MM/YYYY), invoice identifiers, and vendor names.
4. **Pre-fill Review**: The parsed data maps directly into the asset creation form, allowing the operator to verify accuracy and click save.

---

## 3. Asset Allocation (Check-Out & Check-In) Workflow

Governs how physical assets are tracked when assigned to personnel.

```mermaid
sequenceDiagram
    autonumber
    actor Admin as Admin / HR User
    participant System as Express Backend
    database DB as MySQL DB
    participant Mail as Email Transporter

    Admin->>System: Submit Allocation Form (Asset ID, Employee ID, Expected Return Date)
    System->>DB: Check if Asset status is 'AVAILABLE'
    alt Asset is not AVAILABLE
        DB-->>System: Return Asset is Checked Out / In Repair
        System-->>Admin: Return 400 Bad Request
    else Asset is AVAILABLE
        System->>DB: Create 'asset_allocations' record (status = 'ACTIVE')
        System->>DB: Update 'assets' table: status = 'ASSIGNED', assigned_to = Employee_ID
        System->>DB: Insert 'asset_movements' record (movement_type = 'ALLOCATION')
        System->>DB: Insert 'audit_logs' record (action = 'ALLOCATE_ASSET')
        System->>Mail: Queue assignment email to Employee
        Mail-->>System: Email Sent successfully
        System-->>Admin: Return Allocation Success Response
    end
```

### Steps Description:
1. **Allocation Check**: Before checked out, the asset status is validated to ensure it is not already assigned, lost, or in repair.
2. **Database Updates**: A transaction updates the asset status, associates it with the employee, adds a historical track to `asset_movements`, and logs the action in the `audit_logs` table.
3. **Notification**: The system generates in-app notifications and uses Nodemailer to send a checkout confirmation receipt to the employee's inbox.
4. **Return Workflow**: When the asset is checked back in, the status is reverted to `AVAILABLE`, the allocation record is set to `RETURNED`, a return movement is logged, and any warranty or health metrics are updated.

---

## 4. Maintenance Lifecycle Workflow

Tracks asset performance issues and repair costs.

```mermaid
graph TD
    A[Employee/Admin reports an issue] --> B[Create Maintenance Ticket: status = OPEN]
    B --> C[Admin assigns Technician & sets Priority: status = IN_PROGRESS]
    C --> D[Technician repairs asset & records details]
    D --> E[Technician completes request, logs Actual Cost & Resolution Notes]
    E --> F[Update Ticket: status = COMPLETED, completed_at = NOW]
    F --> G[Backend updates Asset status to AVAILABLE or ASSIGNED]
    G --> H[Recalculate Asset Health Score based on downtime & costs]
    H --> I[(Database creates Audit logs & notifies Requestor)]
```

---

## 5. Automated System Tasks (Cron Workflows)

Scheduled tasks running automatically via `node-cron` inside `backend-node/src/scheduler.js`:

### A. Asset Health Score Calculations
* **Trigger**: Scheduled daily at 1:00 AM.
* **Operations**:
  1. Reads all active assets.
  2. Queries total maintenance occurrences, downtime hours, repair costs, and asset age.
  3. Computes health score from `0` to `100`.
  4. Categorizes risk levels (`LOW`, `MEDIUM`, `HIGH`).
  5. Triggers in-app alerts and notifications to the IT department for any asset in `CRITICAL` or `POOR` condition.

### B. Warranty Expiry Warnings
* **Trigger**: Scheduled daily at 2:00 AM.
* **Operations**:
  1. Computes remaining days until warranty expiration date.
  2. If matching warning intervals (90, 60, 30, 15, or 7 days remaining), flags corresponding reminder values.
  3. Sends warning notifications to administrators to arrange renewals or AMC upgrades.

### C. Depreciation Recalculation Runs
* **Trigger**: Executed on fiscal close schedules or requested manually.
* **Operations**:
  1. Analyzes asset category rules (useful life expectancy, rate, and calculation formulas: Straight Line vs. Written Down Value).
  2. Applies depreciation formulas.
  3. Records closing value to the asset record and appends a row to `depreciation_records`.
