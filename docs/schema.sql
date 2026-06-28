-- =============================================================================
-- AI-Powered Smart Asset Management System
-- Database Schema - MySQL 8.0+
-- Generated from actual application entities/models
-- =============================================================================

SET FOREIGN_KEY_CHECKS = 0;
DROP VIEW IF EXISTS v_dashboard_stats;
DROP VIEW IF EXISTS v_asset_summary;
DROP TABLE IF EXISTS qr_scan_logs;
DROP TABLE IF EXISTS ai_chat_histories;
DROP TABLE IF EXISTS budget_forecasts;
DROP TABLE IF EXISTS audit_logs;
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS asset_health_scores;
DROP TABLE IF EXISTS depreciation_records;
DROP TABLE IF EXISTS asset_documents;
DROP TABLE IF EXISTS warranty_trackings;
DROP TABLE IF EXISTS maintenance_requests;
DROP TABLE IF EXISTS asset_movements;
DROP TABLE IF EXISTS asset_allocations;
DROP TABLE IF EXISTS assets;
DROP TABLE IF EXISTS vendor_ratings;
DROP TABLE IF EXISTS vendors;
DROP TABLE IF EXISTS asset_categories;
DROP TABLE IF EXISTS employees;
DROP TABLE IF EXISTS user_roles;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS departments;
DROP TABLE IF EXISTS roles;
SET FOREIGN_KEY_CHECKS = 1;


-- =============================================================================
-- 1. ROLES
-- =============================================================================
CREATE TABLE IF NOT EXISTS roles (
    id         BIGINT AUTO_INCREMENT PRIMARY KEY,
    name       VARCHAR(50) NOT NULL UNIQUE
) ENGINE=InnoDB;

INSERT INTO roles (name) VALUES ('ROLE_SUPER_ADMIN'), ('ROLE_ADMIN'), ('ROLE_EMPLOYEE');

-- =============================================================================
-- 2. DEPARTMENTS
-- =============================================================================
CREATE TABLE IF NOT EXISTS departments (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(100) NOT NULL UNIQUE,
    code        VARCHAR(20) UNIQUE,
    description TEXT,
    location    VARCHAR(200),
    managerName VARCHAR(100),
    isActive    BOOLEAN DEFAULT TRUE,
    createdAt   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt   TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- =============================================================================
-- 3. USERS
-- =============================================================================
CREATE TABLE IF NOT EXISTS users (
    id                   BIGINT AUTO_INCREMENT PRIMARY KEY,
    firstName            VARCHAR(50) NOT NULL,
    lastName             VARCHAR(50) NOT NULL,
    email                VARCHAR(500) NOT NULL UNIQUE,
    password             VARCHAR(255) NOT NULL,
    phone                VARCHAR(500),
    avatarUrl            VARCHAR(500),
    isActive             BOOLEAN DEFAULT TRUE,
    isEmailVerified      BOOLEAN DEFAULT FALSE,
    lastLogin            TIMESTAMP NULL DEFAULT NULL,
    refreshToken         TEXT,
    passwordResetToken   VARCHAR(255),
    resetTokenExpiry     TIMESTAMP NULL DEFAULT NULL,
    department_id        BIGINT,
    emailAlerts          BOOLEAN DEFAULT TRUE,
    maintenanceUpdates   BOOLEAN DEFAULT TRUE,
    systemAudits         BOOLEAN DEFAULT TRUE,
    createdAt            TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt            TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- =============================================================================
-- 4. USER_ROLES (Through Table)
-- =============================================================================
CREATE TABLE IF NOT EXISTS user_roles (
    user_id   BIGINT NOT NULL,
    role_id   BIGINT NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, role_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- =============================================================================
-- 5. EMPLOYEES
-- =============================================================================
CREATE TABLE IF NOT EXISTS employees (
    id            BIGINT AUTO_INCREMENT PRIMARY KEY,
    employeeCode  VARCHAR(30) NOT NULL UNIQUE,
    firstName     VARCHAR(50) NOT NULL,
    lastName      VARCHAR(50) NOT NULL,
    email         VARCHAR(500) NOT NULL UNIQUE,
    phone         VARCHAR(500),
    designation   VARCHAR(100),
    joinDate      DATE,
    avatarUrl     VARCHAR(500),
    isActive      BOOLEAN DEFAULT TRUE,
    department_id BIGINT,
    user_id       BIGINT UNIQUE,
    createdAt     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt     TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- =============================================================================
-- 6. ASSET CATEGORIES
-- =============================================================================
CREATE TABLE IF NOT EXISTS asset_categories (
    id               BIGINT AUTO_INCREMENT PRIMARY KEY,
    name             VARCHAR(100) NOT NULL UNIQUE,
    description      TEXT,
    code             VARCHAR(20) UNIQUE,
    usefulLife       INT DEFAULT 5,
    depreciationRate DECIMAL(5, 2),
    isActive         BOOLEAN DEFAULT TRUE,
    createdAt        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt        TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

INSERT INTO asset_categories (name, code, usefulLife) VALUES
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
-- 7. VENDORS
-- =============================================================================
CREATE TABLE IF NOT EXISTS vendors (
    id            BIGINT AUTO_INCREMENT PRIMARY KEY,
    vendorCode    VARCHAR(30) NOT NULL UNIQUE,
    name          VARCHAR(200) NOT NULL,
    contactPerson VARCHAR(100),
    email         VARCHAR(500),
    phone         VARCHAR(500),
    address       TEXT,
    city          VARCHAR(100),
    state         VARCHAR(100),
    country       VARCHAR(100) DEFAULT 'India',
    pincode       VARCHAR(20),
    gstin         VARCHAR(30),
    website       VARCHAR(500),
    avgRating     DECIMAL(3, 2) DEFAULT 0.00,
    totalRatings  INT DEFAULT 0,
    isActive      BOOLEAN DEFAULT TRUE,
    notes         TEXT,
    createdAt     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt     TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- =============================================================================
-- 8. VENDOR RATINGS
-- =============================================================================
CREATE TABLE IF NOT EXISTS vendor_ratings (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    vendor_id   BIGINT NOT NULL,
    rated_by_id BIGINT,
    rating      INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    review      TEXT,
    createdAt   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt   TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE CASCADE,
    FOREIGN KEY (rated_by_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- =============================================================================
-- 9. ASSETS
-- =============================================================================
CREATE TABLE IF NOT EXISTS assets (
    id               BIGINT AUTO_INCREMENT PRIMARY KEY,
    assetTag         VARCHAR(50) NOT NULL UNIQUE,
    name             VARCHAR(200) NOT NULL,
    brand            VARCHAR(100),
    model            VARCHAR(100),
    serialNumber     VARCHAR(100) UNIQUE,
    purchaseDate     DATE,
    purchaseCost     DECIMAL(15, 2),
    currentValue     DECIMAL(15, 2),
    currentLocation  VARCHAR(200),
    warrantyExpiry   DATE,
    status           ENUM('AVAILABLE', 'ASSIGNED', 'UNDER_REPAIR', 'DISPOSED', 'RETIRED') NOT NULL DEFAULT 'AVAILABLE',
    description      TEXT,
    specifications   TEXT,
    qrCodeUrl        VARCHAR(500),
    assetUniqueId    VARCHAR(100) UNIQUE,
    qrGeneratedAt    TIMESTAMP NULL DEFAULT NULL,
    qrLastUpdated    TIMESTAMP NULL DEFAULT NULL,
    imageUrl         VARCHAR(500),
    isActive         BOOLEAN DEFAULT TRUE,
    disposedAt       TIMESTAMP NULL DEFAULT NULL,
    category_id      BIGINT,
    vendor_id        BIGINT,
    department_id    BIGINT,
    assigned_to_id   BIGINT,
    created_by_id    BIGINT,
    createdAt        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt        TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES asset_categories(id) ON DELETE SET NULL,
    FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE SET NULL,
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL,
    FOREIGN KEY (assigned_to_id) REFERENCES employees(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- =============================================================================
-- 10. ASSET ALLOCATIONS
-- =============================================================================
CREATE TABLE IF NOT EXISTS asset_allocations (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    asset_id        BIGINT NOT NULL,
    employee_id     BIGINT NOT NULL,
    allocated_by_id BIGINT,
    returned_to_id  BIGINT,
    allocatedDate   TIMESTAMP NULL DEFAULT NULL,
    expectedReturn  TIMESTAMP NULL DEFAULT NULL,
    actualReturn    TIMESTAMP NULL DEFAULT NULL,
    status          ENUM('ACTIVE', 'RETURNED', 'TRANSFERRED', 'LOST') NOT NULL DEFAULT 'ACTIVE',
    purpose         TEXT,
    notes           TEXT,
    createdAt       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt       TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE CASCADE,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    FOREIGN KEY (allocated_by_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (returned_to_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- =============================================================================
-- 11. ASSET MOVEMENTS
-- =============================================================================
CREATE TABLE IF NOT EXISTS asset_movements (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    asset_id        BIGINT NOT NULL,
    moved_by_id     BIGINT,
    movementType    ENUM('ALLOCATION', 'RETURN', 'TRANSFER', 'REPAIR_CENTER', 'DISPOSAL', 'LOCATION_CHANGE'),
    fromLocation    VARCHAR(200),
    toLocation      VARCHAR(200),
    fromDepartment  VARCHAR(100),
    toDepartment    VARCHAR(100),
    fromEmployee    VARCHAR(100),
    toEmployee      VARCHAR(100),
    reason          TEXT,
    movementDate    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    createdAt       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt       TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE CASCADE,
    FOREIGN KEY (moved_by_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- =============================================================================
-- 12. MAINTENANCE REQUESTS
-- =============================================================================
CREATE TABLE IF NOT EXISTS maintenance_requests (
    id                 BIGINT AUTO_INCREMENT PRIMARY KEY,
    requestNumber      VARCHAR(30) NOT NULL UNIQUE,
    asset_id           BIGINT NOT NULL,
    requested_by_id    BIGINT,
    assigned_to_id     BIGINT,
    issueType          ENUM('HARDWARE', 'SOFTWARE', 'NETWORK', 'PHYSICAL_DAMAGE', 'ROUTINE', 'OTHER'),
    priority           ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL') DEFAULT 'MEDIUM',
    status             ENUM('OPEN', 'IN_PROGRESS', 'ON_HOLD', 'COMPLETED', 'CANCELLED') DEFAULT 'OPEN',
    title              VARCHAR(200) NOT NULL,
    description        TEXT,
    estimatedCost      DECIMAL(12, 2),
    actualCost         DECIMAL(12, 2),
    assignedTechnician VARCHAR(100),
    startedAt          TIMESTAMP NULL DEFAULT NULL,
    completedAt        TIMESTAMP NULL DEFAULT NULL,
    downtimeHours      DECIMAL(8, 2),
    resolutionNotes    TEXT,
    createdAt          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt          TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE CASCADE,
    FOREIGN KEY (requested_by_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (assigned_to_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- =============================================================================
-- 13. WARRANTY TRACKINGS
-- =============================================================================
CREATE TABLE IF NOT EXISTS warranty_trackings (
    id             BIGINT AUTO_INCREMENT PRIMARY KEY,
    asset_id       BIGINT NOT NULL UNIQUE,
    warrantyType   ENUM('MANUFACTURER', 'EXTENDED', 'THIRD_PARTY', 'ON_SITE', 'COMPREHENSIVE'),
    startDate      DATE,
    expiryDate     DATE,
    providerName   VARCHAR(200),
    contractNumber VARCHAR(100),
    notes          TEXT,
    alertSent30    BOOLEAN DEFAULT FALSE,
    alertSent7     BOOLEAN DEFAULT FALSE,
    createdAt      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- =============================================================================
-- 14. ASSET DOCUMENTS
-- =============================================================================
CREATE TABLE IF NOT EXISTS asset_documents (
    id             BIGINT AUTO_INCREMENT PRIMARY KEY,
    asset_id       BIGINT NOT NULL,
    uploaded_by_id BIGINT,
    documentType   ENUM('INVOICE', 'WARRANTY_CARD', 'MANUAL', 'INSURANCE', 'PHOTO', 'OTHER'),
    fileName       VARCHAR(255) NOT NULL,
    filePath       VARCHAR(500) NOT NULL,
    fileSize       BIGINT,
    mimeType       VARCHAR(100),
    description    TEXT,
    createdAt      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE CASCADE,
    FOREIGN KEY (uploaded_by_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- =============================================================================
-- 15. DEPRECIATION RECORDS
-- =============================================================================
CREATE TABLE IF NOT EXISTS depreciation_records (
    id               BIGINT AUTO_INCREMENT PRIMARY KEY,
    asset_id         BIGINT NOT NULL,
    calculated_by_id BIGINT,
    financialYear    VARCHAR(10) NOT NULL,
    openingValue     DECIMAL(15, 2),
    depreciationRate DECIMAL(6, 4),
    depreciationAmt  DECIMAL(15, 2),
    closingValue     DECIMAL(15, 2),
    method           ENUM('STRAIGHT_LINE', 'DOUBLE_DECLINING', 'SUM_OF_YEARS') DEFAULT 'STRAIGHT_LINE',
    calculatedAt     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    createdAt        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt        TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_asset_fy (asset_id, financialYear),
    FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE CASCADE,
    FOREIGN KEY (calculated_by_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- =============================================================================
-- 16. ASSET HEALTH SCORES
-- =============================================================================
CREATE TABLE IF NOT EXISTS asset_health_scores (
    id                  BIGINT AUTO_INCREMENT PRIMARY KEY,
    asset_id            BIGINT NOT NULL UNIQUE,
    healthScore         DECIMAL(5, 2),
    healthLevel         ENUM('EXCELLENT', 'GOOD', 'AVERAGE', 'POOR', 'CRITICAL'),
    ageScore            DECIMAL(5, 2),
    maintenanceScore    DECIMAL(5, 2),
    repairCostScore     DECIMAL(5, 2),
    downtimeScore       DECIMAL(5, 2),
    warrantyScore       DECIMAL(5, 2),
    riskLevel           ENUM('LOW', 'MEDIUM', 'HIGH'),
    riskScore           DECIMAL(5, 2),
    nextMaintenanceDate DATE,
    recommendations     TEXT,
    calculatedAt        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    createdAt           TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt           TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- =============================================================================
-- 17. NOTIFICATIONS
-- =============================================================================
CREATE TABLE IF NOT EXISTS notifications (
    id         BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id    BIGINT NOT NULL,
    type       ENUM('ASSET_ASSIGNED', 'ASSET_RETURNED', 'MAINTENANCE_ASSIGNED', 'MAINTENANCE_COMPLETE', 'WARRANTY_EXPIRING', 'WARRANTY_EXPIRED', 'SYSTEM', 'ALERT'),
    title      VARCHAR(200) NOT NULL,
    message    TEXT NOT NULL,
    entityType VARCHAR(50),
    entityId   BIGINT,
    isRead     BOOLEAN DEFAULT FALSE,
    sendEmail  BOOLEAN DEFAULT FALSE,
    createdAt  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- =============================================================================
-- 18. AUDIT LOGS
-- =============================================================================
CREATE TABLE IF NOT EXISTS audit_logs (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    performed_by_id BIGINT,
    action          VARCHAR(50) NOT NULL,
    entityType      VARCHAR(50) NOT NULL,
    entityId        BIGINT,
    oldValues       JSON,
    newValues       JSON,
    description     TEXT,
    ipAddress       VARCHAR(50),
    userAgent       VARCHAR(500),
    createdAt       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (performed_by_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- =============================================================================
-- 19. BUDGET FORECASTS
-- =============================================================================
CREATE TABLE IF NOT EXISTS budget_forecasts (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    department_id   BIGINT,
    forecastType    ENUM('REPLACEMENT', 'MAINTENANCE', 'UPGRADE', 'NEW_PURCHASE'),
    financialYear   VARCHAR(10),
    quarter         INT,
    estimatedAmount DECIMAL(15, 2),
    actualAmount    DECIMAL(15, 2),
    description     TEXT,
    status          ENUM('DRAFT', 'APPROVED', 'REJECTED', 'COMPLETED') DEFAULT 'DRAFT',
    createdAt       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt       TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- =============================================================================
-- 20. AI CHAT HISTORIES
-- =============================================================================
CREATE TABLE IF NOT EXISTS ai_chat_histories (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id     BIGINT NOT NULL,
    sessionId   VARCHAR(100),
    userMessage TEXT,
    aiResponse  LONGTEXT,
    tokensUsed  INT,
    createdAt   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- =============================================================================
-- 21. QR SCAN LOGS
-- =============================================================================
CREATE TABLE IF NOT EXISTS qr_scan_logs (
    id            BIGINT AUTO_INCREMENT PRIMARY KEY,
    asset_id      BIGINT NOT NULL,
    scanned_by_id BIGINT,
    user_email    VARCHAR(255),
    device_info   VARCHAR(500),
    ip_address    VARCHAR(50),
    scanned_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE CASCADE,
    FOREIGN KEY (scanned_by_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- =============================================================================
-- Default Super Admin Seed Data
-- =============================================================================
INSERT INTO departments (name, code, description) VALUES
    ('Information Technology', 'IT', 'IT Department'),
    ('Human Resources', 'HR', 'HR Department'),
    ('Finance', 'FIN', 'Finance Department'),
    ('Operations', 'OPS', 'Operations Department'),
    ('Administration', 'ADMIN', 'Administration Department');

INSERT INTO users (firstName, lastName, email, password, isActive, isEmailVerified, department_id)
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
    a.assetTag,
    a.name,
    ac.name AS category,
    a.brand,
    a.model,
    a.serialNumber,
    a.status,
    a.purchaseCost,
    a.currentValue,
    a.purchaseDate,
    a.warrantyExpiry,
    d.name  AS department,
    CONCAT(e.firstName, ' ', e.lastName) AS assigned_employee,
    v.name  AS vendor,
    ahs.healthScore,
    ahs.healthLevel,
    ahs.riskLevel
FROM assets a
LEFT JOIN asset_categories ac ON a.category_id = ac.id
LEFT JOIN departments d ON a.department_id = d.id
LEFT JOIN employees e ON a.assigned_to_id = e.id
LEFT JOIN vendors v ON a.vendor_id = v.id
LEFT JOIN asset_health_scores ahs ON a.id = ahs.asset_id
WHERE a.isActive = TRUE;

-- Dashboard Stats View
CREATE OR REPLACE VIEW v_dashboard_stats AS
SELECT
    COUNT(*) AS total_assets,
    SUM(CASE WHEN status = 'AVAILABLE' THEN 1 ELSE 0 END) AS available_assets,
    SUM(CASE WHEN status = 'ASSIGNED' THEN 1 ELSE 0 END) AS assigned_assets,
    SUM(CASE WHEN status = 'UNDER_REPAIR' THEN 1 ELSE 0 END) AS under_repair,
    SUM(CASE WHEN warrantyExpiry < CURDATE() AND warrantyExpiry IS NOT NULL THEN 1 ELSE 0 END) AS expired_warranty,
    SUM(CASE WHEN status = 'DISPOSED' THEN 1 ELSE 0 END) AS disposed_assets,
    SUM(purchaseCost) AS total_purchase_value,
    SUM(currentValue) AS total_current_value
FROM assets
WHERE isActive = TRUE;
