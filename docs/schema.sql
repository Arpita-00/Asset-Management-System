-- =============================================================================
-- AI-Powered Smart Asset Management System
-- Database Schema - MySQL 8.0+
-- Version: 1.0.0
-- =============================================================================


-- =============================================================================
-- ROLES TABLE
-- =============================================================================
CREATE TABLE roles (
    id         BIGINT AUTO_INCREMENT PRIMARY KEY,
    name       VARCHAR(50) NOT NULL UNIQUE COMMENT 'ROLE_SUPER_ADMIN, ROLE_ADMIN, ROLE_EMPLOYEE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB COMMENT='User role definitions';

INSERT INTO roles (name) VALUES ('ROLE_SUPER_ADMIN'), ('ROLE_ADMIN'), ('ROLE_EMPLOYEE');

-- =============================================================================
-- DEPARTMENTS TABLE
-- =============================================================================
CREATE TABLE departments (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(100) NOT NULL UNIQUE,
    code        VARCHAR(20)  NOT NULL UNIQUE,
    description TEXT,
    manager_id  BIGINT,
    is_active   BOOLEAN DEFAULT TRUE,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB COMMENT='Organizational departments';

-- =============================================================================
-- USERS TABLE
-- =============================================================================
CREATE TABLE users (
    id                   BIGINT AUTO_INCREMENT PRIMARY KEY,
    first_name           VARCHAR(100) NOT NULL,
    last_name            VARCHAR(100) NOT NULL,
    email                VARCHAR(255) NOT NULL UNIQUE,
    password             VARCHAR(255) NOT NULL,
    phone                VARCHAR(20),
    avatar_url           VARCHAR(500),
    department_id        BIGINT,
    is_active            BOOLEAN DEFAULT TRUE,
    is_email_verified    BOOLEAN DEFAULT FALSE,
    last_login           TIMESTAMP,
    password_reset_token VARCHAR(255),
    reset_token_expiry   TIMESTAMP,
    refresh_token        TEXT,
    created_at           TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at           TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL,
    INDEX idx_email (email),
    INDEX idx_department (department_id)
) ENGINE=InnoDB COMMENT='System users';

-- =============================================================================
-- USER_ROLES TABLE (Many-to-Many)
-- =============================================================================
CREATE TABLE user_roles (
    user_id BIGINT NOT NULL,
    role_id BIGINT NOT NULL,
    PRIMARY KEY (user_id, role_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
) ENGINE=InnoDB COMMENT='User to role mapping';

-- =============================================================================
-- EMPLOYEES TABLE
-- =============================================================================
CREATE TABLE employees (
    id            BIGINT AUTO_INCREMENT PRIMARY KEY,
    employee_code VARCHAR(50) NOT NULL UNIQUE,
    user_id       BIGINT UNIQUE,
    first_name    VARCHAR(100) NOT NULL,
    last_name     VARCHAR(100) NOT NULL,
    email         VARCHAR(255) NOT NULL UNIQUE,
    phone         VARCHAR(20),
    department_id BIGINT,
    designation   VARCHAR(100),
    join_date     DATE,
    is_active     BOOLEAN DEFAULT TRUE,
    avatar_url    VARCHAR(500),
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL,
    INDEX idx_emp_code (employee_code),
    INDEX idx_emp_dept (department_id)
) ENGINE=InnoDB COMMENT='Employee records';

-- =============================================================================
-- ASSET CATEGORIES TABLE
-- =============================================================================
CREATE TABLE asset_categories (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(100) NOT NULL UNIQUE,
    code        VARCHAR(20)  NOT NULL UNIQUE,
    description TEXT,
    icon        VARCHAR(100),
    useful_life INT COMMENT 'Expected useful life in years for depreciation',
    is_active   BOOLEAN DEFAULT TRUE,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB COMMENT='Asset category definitions';

INSERT INTO asset_categories (name, code, useful_life) VALUES
    ('Laptop', 'LAP', 3),
    ('Desktop', 'DES', 5),
    ('Server', 'SRV', 7),
    ('Printer', 'PRT', 5),
    ('Monitor', 'MON', 5),
    ('Mobile Phone', 'MOB', 2),
    ('Tablet', 'TAB', 3),
    ('Network Equipment', 'NET', 7),
    ('Projector', 'PRJ', 5),
    ('Furniture', 'FUR', 10),
    ('Vehicle', 'VEH', 10),
    ('Software License', 'SWL', 3);

-- =============================================================================
-- VENDORS TABLE
-- =============================================================================
CREATE TABLE vendors (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    vendor_code     VARCHAR(50)  NOT NULL UNIQUE,
    name            VARCHAR(200) NOT NULL,
    contact_person  VARCHAR(100),
    email           VARCHAR(255),
    phone           VARCHAR(20),
    address         TEXT,
    city            VARCHAR(100),
    state           VARCHAR(100),
    country         VARCHAR(100) DEFAULT 'India',
    pincode         VARCHAR(20),
    gstin           VARCHAR(20),
    website         VARCHAR(255),
    avg_rating      DECIMAL(3,2) DEFAULT 0.00,
    total_ratings   INT DEFAULT 0,
    is_active       BOOLEAN DEFAULT TRUE,
    notes           TEXT,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_vendor_code (vendor_code)
) ENGINE=InnoDB COMMENT='Vendor/Supplier information';

-- =============================================================================
-- VENDOR RATINGS TABLE
-- =============================================================================
CREATE TABLE vendor_ratings (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    vendor_id   BIGINT NOT NULL,
    rated_by    BIGINT NOT NULL,
    rating      TINYINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    review      TEXT,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE CASCADE,
    FOREIGN KEY (rated_by) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB COMMENT='Vendor performance ratings';

-- =============================================================================
-- ASSETS TABLE (Core)
-- =============================================================================
CREATE TABLE assets (
    id                BIGINT AUTO_INCREMENT PRIMARY KEY,
    asset_tag         VARCHAR(100) NOT NULL UNIQUE COMMENT 'Auto-generated: AST-YYYY-XXXXX',
    name              VARCHAR(200) NOT NULL,
    category_id       BIGINT NOT NULL,
    brand             VARCHAR(100),
    model             VARCHAR(100),
    serial_number     VARCHAR(200) UNIQUE,
    purchase_date     DATE,
    purchase_cost     DECIMAL(12,2),
    current_value     DECIMAL(12,2),
    vendor_id         BIGINT,
    department_id     BIGINT,
    assigned_to       BIGINT COMMENT 'Employee ID',
    current_location  VARCHAR(255),
    warranty_expiry   DATE,
    status            ENUM('AVAILABLE','ASSIGNED','UNDER_REPAIR','DISPOSED','LOST','RETIRED')
                          NOT NULL DEFAULT 'AVAILABLE',
    qr_code_url       VARCHAR(500),
    image_url         VARCHAR(500),
    description       TEXT,
    specifications    JSON COMMENT 'Flexible specs: RAM, CPU, storage etc.',
    is_active         BOOLEAN DEFAULT TRUE,
    disposed_at       TIMESTAMP,
    disposal_reason   TEXT,
    created_by        BIGINT,
    created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id)   REFERENCES asset_categories(id),
    FOREIGN KEY (vendor_id)     REFERENCES vendors(id) ON DELETE SET NULL,
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL,
    FOREIGN KEY (assigned_to)   REFERENCES employees(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by)    REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_asset_tag (asset_tag),
    INDEX idx_asset_status (status),
    INDEX idx_asset_dept (department_id),
    INDEX idx_asset_category (category_id),
    INDEX idx_asset_serial (serial_number),
    FULLTEXT idx_ft_asset (name, brand, model, serial_number)
) ENGINE=InnoDB COMMENT='Core asset records';

-- =============================================================================
-- ASSET ALLOCATIONS TABLE
-- =============================================================================
CREATE TABLE asset_allocations (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    asset_id        BIGINT NOT NULL,
    employee_id     BIGINT NOT NULL,
    allocated_by    BIGINT NOT NULL,
    allocated_date  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expected_return DATE,
    actual_return   TIMESTAMP,
    returned_to     BIGINT,
    status          ENUM('ACTIVE','RETURNED','TRANSFERRED') NOT NULL DEFAULT 'ACTIVE',
    purpose         VARCHAR(500),
    notes           TEXT,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (asset_id)    REFERENCES assets(id) ON DELETE CASCADE,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    FOREIGN KEY (allocated_by) REFERENCES users(id),
    FOREIGN KEY (returned_to)  REFERENCES users(id),
    INDEX idx_alloc_asset (asset_id),
    INDEX idx_alloc_emp (employee_id),
    INDEX idx_alloc_status (status)
) ENGINE=InnoDB COMMENT='Asset allocation records';

-- =============================================================================
-- ASSET MOVEMENTS TABLE
-- =============================================================================
CREATE TABLE asset_movements (
    id               BIGINT AUTO_INCREMENT PRIMARY KEY,
    asset_id         BIGINT NOT NULL,
    movement_type    ENUM('DEPARTMENT_CHANGE','LOCATION_CHANGE','REPAIR_CENTER','ALLOCATION','RETURN','DISPOSAL') NOT NULL,
    from_location    VARCHAR(255),
    to_location      VARCHAR(255),
    from_department  VARCHAR(100),
    to_department    VARCHAR(100),
    from_employee    VARCHAR(200),
    to_employee      VARCHAR(200),
    moved_by         BIGINT,
    movement_date    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    reason           TEXT,
    notes            TEXT,
    FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE CASCADE,
    FOREIGN KEY (moved_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_movement_asset (asset_id),
    INDEX idx_movement_date (movement_date)
) ENGINE=InnoDB COMMENT='Asset movement timeline';

-- =============================================================================
-- MAINTENANCE REQUESTS TABLE
-- =============================================================================
CREATE TABLE maintenance_requests (
    id                BIGINT AUTO_INCREMENT PRIMARY KEY,
    request_number    VARCHAR(50) NOT NULL UNIQUE COMMENT 'MNT-YYYY-XXXXX',
    asset_id          BIGINT NOT NULL,
    requested_by      BIGINT NOT NULL,
    assigned_to       BIGINT COMMENT 'Technician user ID',
    issue_type        ENUM('HARDWARE','SOFTWARE','NETWORK','PHYSICAL','PREVENTIVE','OTHER') NOT NULL,
    priority          ENUM('LOW','MEDIUM','HIGH','CRITICAL') NOT NULL DEFAULT 'MEDIUM',
    status            ENUM('OPEN','IN_PROGRESS','COMPLETED','CANCELLED','ON_HOLD') NOT NULL DEFAULT 'OPEN',
    title             VARCHAR(255) NOT NULL,
    description       TEXT NOT NULL,
    estimated_cost    DECIMAL(10,2),
    actual_cost       DECIMAL(10,2),
    started_at        TIMESTAMP,
    completed_at      TIMESTAMP,
    downtime_hours    DECIMAL(8,2) DEFAULT 0,
    resolution_notes  TEXT,
    created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (asset_id)    REFERENCES assets(id) ON DELETE CASCADE,
    FOREIGN KEY (requested_by) REFERENCES users(id),
    FOREIGN KEY (assigned_to)  REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_maint_asset (asset_id),
    INDEX idx_maint_status (status),
    INDEX idx_maint_number (request_number)
) ENGINE=InnoDB COMMENT='Maintenance requests';

-- =============================================================================
-- MAINTENANCE HISTORY TABLE
-- =============================================================================
CREATE TABLE maintenance_history (
    id             BIGINT AUTO_INCREMENT PRIMARY KEY,
    request_id     BIGINT NOT NULL,
    asset_id       BIGINT NOT NULL,
    action         VARCHAR(255) NOT NULL,
    performed_by   BIGINT NOT NULL,
    notes          TEXT,
    cost_incurred  DECIMAL(10,2) DEFAULT 0,
    created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (request_id)   REFERENCES maintenance_requests(id) ON DELETE CASCADE,
    FOREIGN KEY (asset_id)     REFERENCES assets(id) ON DELETE CASCADE,
    FOREIGN KEY (performed_by) REFERENCES users(id),
    INDEX idx_mhist_asset (asset_id),
    INDEX idx_mhist_request (request_id)
) ENGINE=InnoDB COMMENT='Maintenance action history';

-- =============================================================================
-- WARRANTY TRACKING TABLE
-- =============================================================================
CREATE TABLE warranty_tracking (
    id                   BIGINT AUTO_INCREMENT PRIMARY KEY,
    asset_id             BIGINT NOT NULL UNIQUE,
    warranty_start_date  DATE,
    warranty_end_date    DATE NOT NULL,
    warranty_type        ENUM('MANUFACTURER','EXTENDED','AMC','NONE') DEFAULT 'MANUFACTURER',
    vendor_id            BIGINT,
    coverage_details     TEXT,
    contact_number       VARCHAR(20),
    support_email        VARCHAR(255),
    contract_number      VARCHAR(100),
    reminder_90_sent     BOOLEAN DEFAULT FALSE,
    reminder_60_sent     BOOLEAN DEFAULT FALSE,
    reminder_30_sent     BOOLEAN DEFAULT FALSE,
    reminder_15_sent     BOOLEAN DEFAULT FALSE,
    reminder_7_sent      BOOLEAN DEFAULT FALSE,
    is_expired           BOOLEAN GENERATED ALWAYS AS (warranty_end_date < CURDATE()) STORED,
    created_at           TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at           TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (asset_id)  REFERENCES assets(id) ON DELETE CASCADE,
    FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE SET NULL,
    INDEX idx_warranty_end (warranty_end_date),
    INDEX idx_warranty_asset (asset_id)
) ENGINE=InnoDB COMMENT='Warranty information and tracking';

-- =============================================================================
-- ASSET DOCUMENTS TABLE
-- =============================================================================
CREATE TABLE asset_documents (
    id            BIGINT AUTO_INCREMENT PRIMARY KEY,
    asset_id      BIGINT NOT NULL,
    document_type ENUM('INVOICE','WARRANTY_CARD','MANUAL','INSURANCE','CONTRACT','OTHER') NOT NULL,
    file_name     VARCHAR(255) NOT NULL,
    file_path     VARCHAR(500) NOT NULL,
    file_size     BIGINT,
    mime_type     VARCHAR(100),
    uploaded_by   BIGINT NOT NULL,
    description   TEXT,
    is_ocr_extracted BOOLEAN DEFAULT FALSE,
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (asset_id)    REFERENCES assets(id) ON DELETE CASCADE,
    FOREIGN KEY (uploaded_by) REFERENCES users(id),
    INDEX idx_doc_asset (asset_id)
) ENGINE=InnoDB COMMENT='Asset related documents';

-- =============================================================================
-- DEPRECIATION RECORDS TABLE
-- =============================================================================
CREATE TABLE depreciation_records (
    id                BIGINT AUTO_INCREMENT PRIMARY KEY,
    asset_id          BIGINT NOT NULL,
    financial_year    VARCHAR(10) NOT NULL COMMENT 'e.g., 2024-25',
    opening_value     DECIMAL(12,2) NOT NULL,
    depreciation_rate DECIMAL(5,2) NOT NULL,
    depreciation_amt  DECIMAL(12,2) NOT NULL,
    closing_value     DECIMAL(12,2) NOT NULL,
    method            ENUM('STRAIGHT_LINE','WRITTEN_DOWN_VALUE') DEFAULT 'STRAIGHT_LINE',
    calculated_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    calculated_by     BIGINT,
    FOREIGN KEY (asset_id)     REFERENCES assets(id) ON DELETE CASCADE,
    FOREIGN KEY (calculated_by) REFERENCES users(id) ON DELETE SET NULL,
    UNIQUE KEY uk_asset_fy (asset_id, financial_year),
    INDEX idx_depr_asset (asset_id),
    INDEX idx_depr_fy (financial_year)
) ENGINE=InnoDB COMMENT='Asset depreciation records';

-- =============================================================================
-- ASSET HEALTH SCORES TABLE
-- =============================================================================
CREATE TABLE asset_health_scores (
    id                  BIGINT AUTO_INCREMENT PRIMARY KEY,
    asset_id            BIGINT NOT NULL UNIQUE,
    health_score        DECIMAL(5,2) NOT NULL COMMENT '0-100',
    health_level        ENUM('EXCELLENT','GOOD','AVERAGE','POOR','CRITICAL') NOT NULL,
    age_score           DECIMAL(5,2) COMMENT 'Score component: age factor',
    maintenance_score   DECIMAL(5,2) COMMENT 'Score component: maintenance frequency',
    repair_cost_score   DECIMAL(5,2) COMMENT 'Score component: repair costs',
    downtime_score      DECIMAL(5,2) COMMENT 'Score component: downtime',
    warranty_score      DECIMAL(5,2) COMMENT 'Score component: warranty status',
    risk_level          ENUM('LOW','MEDIUM','HIGH') DEFAULT 'LOW',
    risk_score          DECIMAL(5,2),
    next_maintenance_date DATE,
    recommendations     TEXT,
    calculated_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE CASCADE,
    INDEX idx_health_score (health_score),
    INDEX idx_health_level (health_level)
) ENGINE=InnoDB COMMENT='Asset health score tracking';

-- =============================================================================
-- NOTIFICATIONS TABLE
-- =============================================================================
CREATE TABLE notifications (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id         BIGINT,
    type            ENUM('ASSET_ASSIGNED','ASSET_RETURNED','WARRANTY_EXPIRY',
                         'MAINTENANCE_COMPLETE','MAINTENANCE_OVERDUE',
                         'ASSET_DISPOSED','SYSTEM','BUDGET_ALERT','RISK_ALERT') NOT NULL,
    title           VARCHAR(255) NOT NULL,
    message         TEXT NOT NULL,
    reference_type  VARCHAR(50)  COMMENT 'ASSET, MAINTENANCE, WARRANTY etc.',
    reference_id    BIGINT,
    is_read         BOOLEAN DEFAULT FALSE,
    is_email_sent   BOOLEAN DEFAULT FALSE,
    email_sent_at   TIMESTAMP,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_notif_user (user_id),
    INDEX idx_notif_read (is_read),
    INDEX idx_notif_created (created_at)
) ENGINE=InnoDB COMMENT='In-app and email notifications';

-- =============================================================================
-- AUDIT LOGS TABLE (Immutable)
-- =============================================================================
CREATE TABLE audit_logs (
    id            BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id       BIGINT,
    user_email    VARCHAR(255),
    action        VARCHAR(100) NOT NULL COMMENT 'CREATE, UPDATE, DELETE, LOGIN, etc.',
    entity_type   VARCHAR(50)  NOT NULL COMMENT 'ASSET, EMPLOYEE, USER, etc.',
    entity_id     BIGINT,
    old_values    JSON COMMENT 'Previous state as JSON',
    new_values    JSON COMMENT 'New state as JSON',
    description   TEXT,
    ip_address    VARCHAR(45),
    user_agent    VARCHAR(500),
    status        ENUM('SUCCESS','FAILURE') DEFAULT 'SUCCESS',
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_audit_user (user_id),
    INDEX idx_audit_entity (entity_type, entity_id),
    INDEX idx_audit_action (action),
    INDEX idx_audit_created (created_at)
) ENGINE=InnoDB COMMENT='Immutable audit log - no updates or deletes';

-- =============================================================================
-- BUDGET FORECASTS TABLE
-- =============================================================================
CREATE TABLE budget_forecasts (
    id                  BIGINT AUTO_INCREMENT PRIMARY KEY,
    financial_year      VARCHAR(10) NOT NULL,
    department_id       BIGINT,
    category_id         BIGINT,
    forecast_type       ENUM('REPLACEMENT','MAINTENANCE','NEW_PURCHASE') NOT NULL,
    estimated_amount    DECIMAL(12,2) NOT NULL,
    actual_amount       DECIMAL(12,2),
    asset_count         INT,
    description         TEXT,
    generated_by        BIGINT,
    generated_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL,
    FOREIGN KEY (category_id)   REFERENCES asset_categories(id) ON DELETE SET NULL,
    FOREIGN KEY (generated_by)  REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_budget_fy (financial_year)
) ENGINE=InnoDB COMMENT='Budget forecasting data';

-- =============================================================================
-- AI CHAT HISTORY TABLE
-- =============================================================================
CREATE TABLE ai_chat_history (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id     BIGINT NOT NULL,
    session_id  VARCHAR(100) NOT NULL,
    role        ENUM('USER','ASSISTANT') NOT NULL,
    content     TEXT NOT NULL,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_ai_session (session_id),
    INDEX idx_ai_user (user_id)
) ENGINE=InnoDB COMMENT='AI assistant conversation history';

-- =============================================================================
-- Default Super Admin User (Password: Admin@123 - bcrypt)
-- =============================================================================
INSERT INTO departments (name, code, description) VALUES
    ('Information Technology', 'IT', 'IT Department'),
    ('Human Resources', 'HR', 'HR Department'),
    ('Finance', 'FIN', 'Finance Department'),
    ('Operations', 'OPS', 'Operations Department'),
    ('Administration', 'ADMIN', 'Administration Department');

INSERT INTO users (first_name, last_name, email, password, is_active, is_email_verified, department_id)
VALUES ('Super', 'Admin', 'superadmin@assetms.com',
        '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iYqiSfFp5II7m6bPSfaIHxHNVMme', -- Admin@123
        TRUE, TRUE, 1);

INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id FROM users u, roles r WHERE u.email = 'superadmin@assetms.com' AND r.name = 'ROLE_SUPER_ADMIN';

-- =============================================================================
-- VIEWS FOR REPORTING
-- =============================================================================

-- Asset Summary View
CREATE OR REPLACE VIEW v_asset_summary AS
SELECT
    a.id,
    a.asset_tag,
    a.name,
    ac.name AS category,
    a.brand,
    a.model,
    a.serial_number,
    a.status,
    a.purchase_cost,
    a.current_value,
    a.purchase_date,
    a.warranty_expiry,
    d.name  AS department,
    CONCAT(e.first_name, ' ', e.last_name) AS assigned_employee,
    v.name  AS vendor,
    ahs.health_score,
    ahs.health_level,
    ahs.risk_level
FROM assets a
LEFT JOIN asset_categories ac ON a.category_id = ac.id
LEFT JOIN departments d ON a.department_id = d.id
LEFT JOIN employees e ON a.assigned_to = e.id
LEFT JOIN vendors v ON a.vendor_id = v.id
LEFT JOIN asset_health_scores ahs ON a.id = ahs.asset_id
WHERE a.is_active = TRUE;

-- Dashboard Stats View
CREATE OR REPLACE VIEW v_dashboard_stats AS
SELECT
    COUNT(*) AS total_assets,
    SUM(CASE WHEN status = 'AVAILABLE' THEN 1 ELSE 0 END) AS available_assets,
    SUM(CASE WHEN status = 'ASSIGNED' THEN 1 ELSE 0 END) AS assigned_assets,
    SUM(CASE WHEN status = 'UNDER_REPAIR' THEN 1 ELSE 0 END) AS under_repair,
    SUM(CASE WHEN warranty_expiry < CURDATE() AND warranty_expiry IS NOT NULL THEN 1 ELSE 0 END) AS expired_warranty,
    SUM(CASE WHEN status = 'DISPOSED' THEN 1 ELSE 0 END) AS disposed_assets,
    SUM(purchase_cost) AS total_purchase_value,
    SUM(current_value) AS total_current_value
FROM assets
WHERE is_active = TRUE;
