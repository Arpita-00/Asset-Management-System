# Features & Database Schema

This document details the core features of the **AI-Powered Smart Asset Management System**, their functional mechanics, and the underlying database schema that supports them.

---

## 1. System Features & How They Function

### A. AI-Powered Natural Language Assistant
* **Functionality**: Users query the asset registry using natural language (e.g., *"What server in operations is expiring its warranty next month?"*).
* **Under the hood**:
  1. The backend (`aiService.js`) queries the DB for contextual summaries (total counts, recent assets, warranty status in the next 90 days, open maintenance requests).
  2. It formats this data into a structured markdown database context.
  3. It wraps this context with instructions in a system prompt and appends the user's message.
  4. The payload is sent to the Gemini API. If the API key is absent, it falls back to local pattern-matching rules.
  5. The assistant's reply and the user prompt are logged in `ai_chat_history`.

### B. Smart OCR Invoice Ingestion
* **Functionality**: Admins drag and drop invoices (PDF/Image format) to auto-create asset records.
* **Under the hood**:
  1. The backend (`ocrService.js`) stores the upload temporarily.
  2. A local Tesseract.js worker scans the document, running character recognition to extract a string block.
  3. RegExp matchers search for:
     * **Amounts**: Patterns looking for grand total currency formats (e.g., `\$[0-9,]+\.[0-9]{2}`).
     * **Dates**: Standard format parsers (DD/MM/YYYY, YYYY-MM-DD, Month Date Year).
     * **Vendor Name**: Extracts headers or strings surrounding invoice tags.
     * **Warranty Terms**: Captures phrases like *"1 year warranty"* or *"24-month contract"* using lookahead expressions.
  4. The frontend shows a populated draft form, allowing manual corrections before saving the asset.

### C. Predictive Asset Health & Risk Scoring
* **Functionality**: Tracks asset durability and generates preventative maintenance alerts.
* **Under the hood**:
  * An automated daily cron worker computes an asset's health score (0-100) using a multi-factor weighted equation:
    * **Age Score (30%)**: Calculates how much of the useful life remains.
    * **Maintenance Incidents (25%)**: Subtracts 10 points per logged ticket.
    * **Repair Costs (20%)**: Subtracts score points relative to repair costs vs. original purchase price.
    * **Downtime Hours (15%)**: Deducts 5 points per 10 hours of downtime.
    * **Warranty Status (10%)**: Deducts value if the warranty is expiring soon or expired.
  * Score categories map to **Health Levels** (`EXCELLENT` $\ge 85$, `GOOD` $\ge 70$, `AVERAGE` $\ge 50$, `POOR` $\ge 30$, `CRITICAL` $< 30$) and **Risk Levels** (`LOW` $\ge 60$, `MEDIUM` $\ge 35$, `HIGH` $< 35$).

### D. Automated Depreciation Schedules
* **Functionality**: Estimates asset financial depreciation.
* **Under the hood**:
  * Calculations run on two configurable methods:
    1. **Straight Line Method (SLM)**: 
       $$\text{Annual Depreciation} = \frac{\text{Purchase Cost} - \text{Salvage Value}}{\text{Useful Life}}$$
    2. **Written Down Value (WDV)**: 
       $$\text{Depreciation} = \text{Opening Book Value} \times \frac{\text{Depreciation Rate}}{100}$$
  * Results are saved in `depreciation_records` for audits.

### E. QR Code Asset Tagging
* **Functionality**: Generates unique visual tags for physical asset verification.
* **Under the hood**:
  * The backend generates a QR code containing the secure asset URL (e.g., http://[host]/asset/[asset_tag]).
  * Field agents scan the code using a mobile camera to access specifications, assignment status, and maintenance history.

### F. Immutable Audit Log
* **Functionality**: Tracks database modifications for security compliance.
* **Under the hood**:
  * Middleware hooks onto database write events.
  * Captures the action (`CREATE`, `UPDATE`, `DELETE`), user ID, IP address, and payload diff (JSON snapshots of `old_values` and `new_values`).
  * Writes the records to the `audit_logs` table (which has restrictions preventing modifications).

---

## 2. Database Schema (MySQL 8.0+)

The relational structure consists of **21 tables** and **2 materialized reporting views**.

```
                           +---------------+
                           |     roles     |
                           +-------+-------+
                                   | 1
                                   |
                                   | Many
                           +-------v-------+
                           |  user_roles   |
                           +-------^-------+
                                   | Many
                                   |
                                   | 1
                           +-------+-------+
                           |     users     | <-------+
                           +---+---+---+---+         |
                               | 1 | 1 | 1           | Many
              +----------------+   |   +--------+    |
              | 1                  | 1          |    |
      +-------v-------+            |    +-------v----+-------+
      |  departments  |            |    |  ai_chat_history   |
      +-------^-------+            |    +--------------------+
              | 1                  |
              |                    |
              | Many               | 1 (Optional)
      +-------+-------+            |
      |   employees   <------------+
      +-------^-------+
              | 1
              |
              | Many
      +-------+-------+
      |  allocations  |
      +-------^-------+
              | Many
              |
              | 1
      +-------+-------+
      |    assets     |
      +---------------+
```

### Table Definitions

#### 1. `roles`
*Defines user accessibility profiles.*
* `id` (BIGINT, PK, Auto Increment)
* `name` (VARCHAR(50), Unique) — e.g. `ROLE_SUPER_ADMIN`, `ROLE_ADMIN`, `ROLE_EMPLOYEE`
* `created_at` (TIMESTAMP)

#### 2. `departments`
*Represents organizational groups.*
* `id` (BIGINT, PK, Auto Increment)
* `name` (VARCHAR(100), Unique)
* `code` (VARCHAR(20), Unique) — e.g., `IT`, `HR`, `FIN`
* `description` (TEXT)
* `manager_id` (BIGINT)
* `is_active` (BOOLEAN)
* `created_at` / `updated_at` (TIMESTAMP)

#### 3. `users`
*System accounts authorized to log in.*
* `id` (BIGINT, PK, Auto Increment)
* `first_name` / `last_name` (VARCHAR(100))
* `email` (VARCHAR(255), Unique, Indexed)
* `password` (VARCHAR(255)) — Salted bcrypt hash
* `phone` (VARCHAR(20))
* `avatar_url` (VARCHAR(500))
* `department_id` (BIGINT, FK -> `departments.id`)
* `is_active` (BOOLEAN)
* `is_email_verified` (BOOLEAN)
* `last_login` (TIMESTAMP)
* `password_reset_token` (VARCHAR(255))
* `reset_token_expiry` (TIMESTAMP)
* `refresh_token` (TEXT)
* `created_at` / `updated_at` (TIMESTAMP)

#### 4. `user_roles` (Many-to-Many Join Table)
*Maps users to their authorization privileges.*
* `user_id` (BIGINT, PK, FK -> `users.id`, Cascade Delete)
* `role_id` (BIGINT, PK, FK -> `roles.id`, Cascade Delete)

#### 5. `employees`
*Internal personnel records (who can receive asset allocations).*
* `id` (BIGINT, PK, Auto Increment)
* `employee_code` (VARCHAR(50), Unique, Indexed)
* `user_id` (BIGINT, Unique, FK -> `users.id`) — Optional system link
* `first_name` / `last_name` (VARCHAR(100))
* `email` (VARCHAR(255), Unique)
* `phone` (VARCHAR(20))
* `department_id` (BIGINT, FK -> `departments.id`)
* `designation` (VARCHAR(100))
* `join_date` (DATE)
* `is_active` (BOOLEAN)
* `avatar_url` (VARCHAR(500))
* `created_at` / `updated_at` (TIMESTAMP)

#### 6. `asset_categories`
*Classifies assets for useful life metrics.*
* `id` (BIGINT, PK, Auto Increment)
* `name` (VARCHAR(100), Unique) — e.g. `Laptop`, `Server`, `Furniture`
* `code` (VARCHAR(20), Unique)
* `description` (TEXT)
* `icon` (VARCHAR(100))
* `useful_life` (INT) — Depreciation useful life boundary in years
* `is_active` (BOOLEAN)
* `created_at` (TIMESTAMP)

#### 7. `vendors`
*Asset suppliers and service contractors.*
* `id` (BIGINT, PK, Auto Increment)
* `vendor_code` (VARCHAR(50), Unique)
* `name` (VARCHAR(200))
* `contact_person` (VARCHAR(100))
* `email` / `phone` (VARCHAR(255) / VARCHAR(20))
* `address` / `city` / `state` / `country` / `pincode` (TEXT/VARCHAR)
* `gstin` (VARCHAR(20))
* `website` (VARCHAR(255))
* `avg_rating` (DECIMAL(3,2))
* `total_ratings` (INT)
* `is_active` (BOOLEAN)
* `notes` (TEXT)
* `created_at` / `updated_at` (TIMESTAMP)

#### 8. `vendor_ratings`
*Performance evaluations of suppliers.*
* `id` (BIGINT, PK, Auto Increment)
* `vendor_id` (BIGINT, FK -> `vendors.id`, Cascade Delete)
* `rated_by` (BIGINT, FK -> `users.id`, Cascade Delete)
* `rating` (TINYINT) — Score 1 to 5
* `review` (TEXT)
* `created_at` (TIMESTAMP)

#### 9. `assets` (Core Table)
*Contains inventory items.*
* `id` (BIGINT, PK, Auto Increment)
* `asset_tag` (VARCHAR(100), Unique) — Auto format: `AST-YYYY-XXXXX`
* `name` (VARCHAR(200))
* `category_id` (BIGINT, FK -> `asset_categories.id`)
* `brand` / `model` (VARCHAR(100))
* `serial_number` (VARCHAR(200), Unique)
* `purchase_date` (DATE)
* `purchase_cost` (DECIMAL(12,2))
* `current_value` (DECIMAL(12,2))
* `vendor_id` (BIGINT, FK -> `vendors.id`)
* `department_id` (BIGINT, FK -> `departments.id`)
* `assigned_to` (BIGINT, FK -> `employees.id`) — Active deployment link
* `current_location` (VARCHAR(255))
* `warranty_expiry` (DATE)
* `status` (ENUM) — `AVAILABLE`, `ASSIGNED`, `UNDER_REPAIR`, `DISPOSED`, `LOST`, `RETIRED`
* `qr_code_url` (VARCHAR(500))
* `image_url` (VARCHAR(500))
* `description` (TEXT)
* `specifications` (JSON) — Holds flexible keys (e.g. RAM, Storage, CPU)
* `is_active` (BOOLEAN)
* `disposed_at` / `disposal_reason` (TIMESTAMP / TEXT)
* `created_by` (BIGINT, FK -> `users.id`)
* `created_at` / `updated_at` (TIMESTAMP)

#### 10. `asset_allocations`
*Tracks assignments to employees.*
* `id` (BIGINT, PK, Auto Increment)
* `asset_id` (BIGINT, FK -> `assets.id`, Cascade Delete)
* `employee_id` (BIGINT, FK -> `employees.id`, Cascade Delete)
* `allocated_by` (BIGINT, FK -> `users.id`)
* `allocated_date` (TIMESTAMP)
* `expected_return` (DATE)
* `actual_return` (TIMESTAMP)
* `returned_to` (BIGINT, FK -> `users.id`)
* `status` (ENUM) — `ACTIVE`, `RETURNED`, `TRANSFERRED`
* `purpose` (VARCHAR(500))
* `notes` (TEXT)
* `created_at` / `updated_at` (TIMESTAMP)

#### 11. `asset_movements`
*Logs location, department, or user transitions.*
* `id` (BIGINT, PK, Auto Increment)
* `asset_id` (BIGINT, FK -> `assets.id`, Cascade Delete)
* `movement_type` (ENUM) — `DEPARTMENT_CHANGE`, `LOCATION_CHANGE`, `REPAIR_CENTER`, `ALLOCATION`, `RETURN`, `DISPOSAL`
* `from_location` / `to_location` (VARCHAR(255))
* `from_department` / `to_department` (VARCHAR(100))
* `from_employee` / `to_employee` (VARCHAR(200))
* `moved_by` (BIGINT, FK -> `users.id`)
* `movement_date` (TIMESTAMP)
* `reason` / `notes` (TEXT)

#### 12. `maintenance_requests`
*Repair requests and technical issues.*
* `id` (BIGINT, PK, Auto Increment)
* `request_number` (VARCHAR(50), Unique) — Format: `MNT-YYYY-XXXXX`
* `asset_id` (BIGINT, FK -> `assets.id`, Cascade Delete)
* `requested_by` (BIGINT, FK -> `users.id`)
* `assigned_to` (BIGINT, FK -> `users.id`) — Technician link
* `issue_type` (ENUM) — `HARDWARE`, `SOFTWARE`, `NETWORK`, `PHYSICAL`, `PREVENTIVE`, `OTHER`
* `priority` (ENUM) — `LOW`, `MEDIUM`, `HIGH`, `CRITICAL`
* `status` (ENUM) — `OPEN`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`, `ON_HOLD`
* `title` (VARCHAR(255))
* `description` (TEXT)
* `estimated_cost` / `actual_cost` (DECIMAL(10,2))
* `started_at` / `completed_at` (TIMESTAMP)
* `downtime_hours` (DECIMAL(8,2))
* `resolution_notes` (TEXT)
* `created_at` / `updated_at` (TIMESTAMP)

#### 13. `maintenance_history`
*Actions performed during repair cycles.*
* `id` (BIGINT, PK, Auto Increment)
* `request_id` (BIGINT, FK -> `maintenance_requests.id`, Cascade Delete)
* `asset_id` (BIGINT, FK -> `assets.id`, Cascade Delete)
* `action` (VARCHAR(255))
* `performed_by` (BIGINT, FK -> `users.id`)
* `notes` (TEXT)
* `cost_incurred` (DECIMAL(10,2))
* `created_at` (TIMESTAMP)

#### 14. `warranty_tracking`
*Tracks warranties and alert flags.*
* `id` (BIGINT, PK, Auto Increment)
* `asset_id` (BIGINT, Unique, FK -> `assets.id`, Cascade Delete)
* `warranty_start_date` / `warranty_end_date` (DATE)
* `warranty_type` (ENUM) — `MANUFACTURER`, `EXTENDED`, `AMC`, `NONE`
* `vendor_id` (BIGINT, FK -> `vendors.id`)
* `coverage_details` (TEXT)
* `contact_number` (VARCHAR(20))
* `support_email` (VARCHAR(255))
* `contract_number` (VARCHAR(100))
* `reminder_90_sent` / `60` / `30` / `15` / `7` (BOOLEAN) — Prevents spamming alerts
* `is_expired` (BOOLEAN) — Virtual generated column: `(warranty_end_date < CURDATE())`
* `created_at` / `updated_at` (TIMESTAMP)

#### 15. `asset_documents`
*Scanned invoices, contracts, or manual PDFs.*
* `id` (BIGINT, PK, Auto Increment)
* `asset_id` (BIGINT, FK -> `assets.id`, Cascade Delete)
* `document_type` (ENUM) — `INVOICE`, `WARRANTY_CARD`, `MANUAL`, `INSURANCE`, `CONTRACT`, `OTHER`
* `file_name` (VARCHAR(255))
* `file_path` (VARCHAR(500))
* `file_size` (BIGINT)
* `mime_type` (VARCHAR(100))
* `uploaded_by` (BIGINT, FK -> `users.id`)
* `description` (TEXT)
* `is_ocr_extracted` (BOOLEAN)
* `created_at` (TIMESTAMP)

#### 16. `depreciation_records`
*Book value valuations across financial years.*
* `id` (BIGINT, PK, Auto Increment)
* `asset_id` (BIGINT, FK -> `assets.id`, Cascade Delete)
* `financial_year` (VARCHAR(10)) — e.g. `2024-25`
* `opening_value` / `closing_value` (DECIMAL(12,2))
* `depreciation_rate` (DECIMAL(5,2))
* `depreciation_amt` (DECIMAL(12,2))
* `method` (ENUM) — `STRAIGHT_LINE`, `WRITTEN_DOWN_VALUE`
* `calculated_at` (TIMESTAMP)
* `calculated_by` (BIGINT, FK -> `users.id`)
* *Unique Key*: `(asset_id, financial_year)`

#### 17. `asset_health_scores`
*Asset health scorecard.*
* `id` (BIGINT, PK, Auto Increment)
* `asset_id` (BIGINT, Unique, FK -> `assets.id`, Cascade Delete)
* `health_score` (DECIMAL(5,2)) — 0 to 100
* `health_level` (ENUM) — `EXCELLENT`, `GOOD`, `AVERAGE`, `POOR`, `CRITICAL`
* `age_score` / `maintenance_score` / `repair_cost_score` / `downtime_score` / `warranty_score` (DECIMAL(5,2))
* `risk_level` (ENUM) — `LOW`, `MEDIUM`, `HIGH`
* `risk_score` (DECIMAL(5,2))
* `next_maintenance_date` (DATE)
* `recommendations` (TEXT)
* `calculated_at` (TIMESTAMP)

#### 18. `notifications`
*Stores in-app and status alert records.*
* `id` (BIGINT, PK, Auto Increment)
* `user_id` (BIGINT, FK -> `users.id`, Cascade Delete)
* `type` (ENUM) — e.g. `ASSET_ASSIGNED`, `WARRANTY_EXPIRY`, `MAINTENANCE_COMPLETE`
* `title` (VARCHAR(255))
* `message` (TEXT)
* `reference_type` (VARCHAR(50)) — e.g. `ASSET`, `MAINTENANCE`
* `reference_id` (BIGINT)
* `is_read` (BOOLEAN)
* `is_email_sent` (BOOLEAN)
* `email_sent_at` (TIMESTAMP)
* `created_at` (TIMESTAMP)

#### 19. `audit_logs` (Read-only System Ledger)
*Tracks CRUD activities for security compliance.*
* `id` (BIGINT, PK, Auto Increment)
* `user_id` (BIGINT)
* `user_email` (VARCHAR(255))
* `action` (VARCHAR(100)) — `CREATE`, `UPDATE`, `DELETE`, `LOGIN`
* `entity_type` (VARCHAR(50)) — `ASSET`, `EMPLOYEE`, `USER`
* `entity_id` (BIGINT)
* `old_values` (JSON) — State before write
* `new_values` (JSON) — State after write
* `description` (TEXT)
* `ip_address` (VARCHAR(45))
* `user_agent` (VARCHAR(500))
* `status` (ENUM) — `SUCCESS`, `FAILURE`
* `created_at` (TIMESTAMP)

#### 20. `budget_forecasts`
*Expensiture forecasting metrics.*
* `id` (BIGINT, PK, Auto Increment)
* `financial_year` (VARCHAR(10))
* `department_id` (BIGINT, FK -> `departments.id`)
* `category_id` (BIGINT, FK -> `asset_categories.id`)
* `forecast_type` (ENUM) — `REPLACEMENT`, `MAINTENANCE`, `NEW_PURCHASE`
* `estimated_amount` / `actual_amount` (DECIMAL(12,2))
* `asset_count` (INT)
* `description` (TEXT)
* `generated_by` (BIGINT, FK -> `users.id`)
* `generated_at` (TIMESTAMP)

#### 21. `ai_chat_history`
*AI prompt history logs.*
* `id` (BIGINT, PK, Auto Increment)
* `user_id` (BIGINT, FK -> `users.id`, Cascade Delete)
* `session_id` (VARCHAR(100))
* `role` (ENUM) — `USER`, `ASSISTANT`
* `content` (TEXT)
* `created_at` (TIMESTAMP)

---

### Database Views

#### A. `v_asset_summary`
*Aggregates data for standard lists and searches.*
* **Fields**: `id`, `asset_tag`, `name`, `category`, `brand`, `model`, `serial_number`, `status`, `purchase_cost`, `current_value`, `purchase_date`, `warranty_expiry`, `department`, `assigned_employee`, `vendor`, `health_score`, `health_level`, `risk_level`
* **Underlying Query**: Performs LEFT JOINs between `assets`, `asset_categories`, `departments`, `employees`, `vendors`, and `asset_health_scores`. Filters active assets (`is_active = TRUE`).

#### B. `v_dashboard_stats`
*Aggregates inventory counts for dashboard visual grids.*
* **Fields**: `total_assets`, `available_assets`, `assigned_assets`, `under_repair`, `expired_warranty`, `disposed_assets`, `total_purchase_value`, `total_current_value`
* **Underlying Query**: Tallies asset quantities and asset value aggregates (purchase cost sum and current book value sum) where `is_active = TRUE`.
