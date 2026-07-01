# 📋 Sidebar Navigation & Depreciation Guide

This document provides a comprehensive overview of the navigation structure of the **East Coast Railway Asset Management Portal (ECoR-AMP)**, describing the purpose of each sidebar section, and explains the mathematical model and formula used to calculate financial depreciation for assets.

---

## 🗂️ 1. Sidebar Sections & Functionality

The application navigation is organized into collapsible groups in the sidebar, dynamically filtered based on user roles (e.g., `ROLE_SUPER_ADMIN`, `ROLE_ADMIN`, `ROLE_EMPLOYEE`). Below is the breakdown of each group and its items.

### A. Operations (मुख्य संचालन)
This section houses standard day-to-day operations and scanning utilities accessible to all authenticated users.

*   **Dashboard (डैशबोर्ड)**
    *   **Path**: `/dashboard`
    *   **Component**: [DashboardPage.jsx](file:///c:/Users/debas/Desktop/Asset%20Management%20System/Asset-Management-System/frontend/src/pages/dashboard/DashboardPage.jsx)
    *   **Function**: Provides a real-time overview of the system, displaying key performance indicators (KPIs) like total assets, available/assigned asset counts, high-risk assets, and asset health levels. It also shows financial aggregations (Purchase Value, Current Book Value, and Accumulated Depreciation) alongside analytics charts (distribution by category, status, health, and department).
*   **QR Code Scanner (क्यूआर कोड स्कैनर)**
    *   **Path**: `/qr-scanner`
    *   **Component**: [QrScannerPage.jsx](file:///c:/Users/debas/Desktop/Asset%20Management%20System/Asset-Management-System/frontend/src/pages/qr/QrScannerPage.jsx)
    *   **Function**: Allows field agents to scan physical QR codes printed on assets using their mobile or webcam. Scanning queries the backend and displays the Asset Passport—a comprehensive sheet containing detailed specifications, allocation history, warranty info, and maintenance logs.
*   **Invoice OCR (चालान ओसीआर)**
    *   **Path**: `/ocr-scanner`
    *   **Component**: [OcrScannerPage.jsx](file:///c:/Users/debas/Desktop/Asset%20Management%20System/Asset-Management-System/frontend/src/pages/ocr/OcrScannerPage.jsx)
    *   **Function**: Facilitates bulk ingestion of assets by extracting data from invoice files (images/PDFs) local client-side via `Tesseract.js`. The scanner parses text strings for purchase cost, dates, vendor names, and warranty contracts using regular expressions, automatically pre-populating a draft asset form for admin review and creation.
*   **AI Assistant (एआई सहायक)**
    *   **Path**: `/ai-assistant`
    *   **Component**: [AiAssistantPage.jsx](file:///c:/Users/debas/Desktop/Asset%20Management%20System/Asset-Management-System/frontend/src/pages/ai/AiAssistantPage.jsx)
    *   **Function**: An interactive chatbot interface that translates natural language queries (e.g., *"Show me IT assets under repair"*) into database context queries. It utilizes the Google Gemini API (with a local fallback) to formulate natural replies, showing real-time statistics and tables to users.

### B. Assets (परिसंपत्तियां)
*   **Assets Registry (परिसंपत्ति सूची)**
    *   **Path**: `/assets`
    *   **Component**: [AssetsPage.jsx](file:///c:/Users/debas/Desktop/Asset%20Management%20System/Asset-Management-System/frontend/src/pages/assets/AssetsPage.jsx)
    *   **Function**: The master database register of all assets. Users can search and filter assets by categories, status, and departments. Admins can manually register new assets, edit specifications (stored dynamically in a JSON column), view historical movements, generate printable QR code tags, and retire or dispose of assets.
*   **My Assets (मेरे परिसंपत्तियां)**
    *   **Path**: `/my-assets`
    *   **Component**: [MyAssetsPage.jsx](file:///c:/Users/debas/Desktop/Asset%20Management%20System/Asset-Management-System/frontend/src/pages/assets/MyAssetsPage.jsx)
    *   **Function**: A dedicated view for logged-in employees and users to see all assets currently assigned to them. It displays asset tags, brand/model information, serial numbers, categories, current locations, and warranty expiration dates, with quick links to view specifications or access the public Asset Passport.

### C. Maintenance (रखरखाव)
*   **Work Orders (कार्य आदेश)**
    *   **Path**: `/maintenance`
    *   **Component**: [MaintenancePage.jsx](file:///c:/Users/debas/Desktop/Asset%20Management%20System/Asset-Management-System/frontend/src/pages/maintenance/MaintenancePage.jsx)
    *   **Function**: A ticket management system for asset repairs and scheduled checks. Users can open support tickets, assign them to technicians, update status (Open $\rightarrow$ In Progress $\rightarrow$ Hold $\rightarrow$ Completed), record repair costs, estimate downtime hours, and log full repair steps in the asset's history.

### D. Inventory (परिसंपत्ति जीवनचक्र)
*   **Asset Assignment (परिसंपत्ति आवंटन)**
    *   **Path**: `/allocation`
    *   **Component**: [AllocationPage.jsx](file:///c:/Users/debas/Desktop/Asset%20Management%20System/Asset-Management-System/frontend/src/pages/allocation/AllocationPage.jsx)
    *   **Access Restricted**: `ROLE_ADMIN`, `ROLE_SUPER_ADMIN`
    *   **Function**: Manages the check-out process. Admins can assign available items to employees, specify allocation purposes, input expected return dates, and notify employees of their assignment.
*   **Return Assets (परिसंपत्ति वापसी)**
    *   **Path**: `/return`
    *   **Component**: [ReturnAssetsPage.jsx](file:///c:/Users/debas/Desktop/Asset%20Management%20System/Asset-Management-System/frontend/src/pages/return/ReturnAssetsPage.jsx)
    *   **Function**: Manages check-in. Allows admins to log returned assets, inspect their current condition, update their inventory status back to `AVAILABLE`, and calculate total allocation duration.

### E. Analytics (वित्त और योजना)
*   **Budget Forecast (बजट पूर्वानुमान)**
    *   **Path**: `/budget`
    *   **Component**: [BudgetForecastPage.jsx](file:///c:/Users/debas/Desktop/Asset%20Management%20System/Asset-Management-System/frontend/src/pages/budget/BudgetForecastPage.jsx)
    *   **Access Restricted**: `ROLE_ADMIN`, `ROLE_SUPER_ADMIN`
    *   **Function**: Analytical dashboard predicting annual expenditures. It forecasts replacement costs, maintenance buffers, and new purchase requirements by tracking asset age thresholds and historical maintenance workloads.
*   **Depreciation Ledger (मूल्यह्रास बही)**
    *   **Path**: `/depreciation`
    *   **Component**: [DepreciationPage.jsx](file:///c:/Users/debas/Desktop/Asset%20Management%20System/Asset-Management-System/frontend/src/pages/depreciation/DepreciationPage.jsx)
    *   **Access Restricted**: `ROLE_ADMIN`, `ROLE_SUPER_ADMIN`
    *   **Function**: Financial audit interface showing book value calculations. It lists depreciable assets, their original costs, annual depreciation rates, and current residual values. Admins can trigger bulk annual depreciation calculations or simulate future depreciation curves.

### F. Reports (रिपोर्ट)
*   **System Reports (सिस्टम रिपोर्ट)**
    *   **Path**: `/reports`
    *   **Component**: [ReportsPage.jsx](file:///c:/Users/debas/Desktop/Asset%20Management%20System/Asset-Management-System/frontend/src/pages/reports/ReportsPage.jsx)
    *   **Access Restricted**: `ROLE_ADMIN`, `ROLE_SUPER_ADMIN`
    *   **Function**: Allows admins to generate custom data exports. Users can download spreadsheets and PDF summaries covering asset inventory, warranty expiration checklists, maintenance logs, and financial depreciation ledgers.

### G. Administration (प्रशासन)
*   **User Accounts (उपयोगकर्ता)**
    *   **Path**: `/users`
    *   **Component**: [UsersPage.jsx](file:///c:/Users/debas/Desktop/Asset%20Management%20System/Asset-Management-System/frontend/src/pages/users/UsersPage.jsx)
    *   **Access Restricted**: `ROLE_SUPER_ADMIN`
    *   **Function**: Full user administration directory. Super admins can manage user permissions, verify accounts, toggle active status, and modify user access roles.
*   **Vendors Directory (विक्रेता)**
    *   **Path**: `/vendors`
    *   **Component**: [VendorsPage.jsx](file:///c:/Users/debas/Desktop/Asset%20Management%20System/Asset-Management-System/frontend/src/pages/vendors/VendorsPage.jsx)
    *   **Access Restricted**: `ROLE_ADMIN`, `ROLE_SUPER_ADMIN`
    *   **Function**: A directory database of suppliers and service providers. It tracks vendor addresses, contact points, GSTIN numbers, and maintains performance reviews/average ratings.
*   **Audit History (ऑडिट लॉग्स)**
    *   **Path**: `/audit-logs`
    *   **Component**: [AuditLogsPage.jsx](file:///c:/Users/debas/Desktop/Asset%20Management%20System/Asset-Management-System/frontend/src/pages/audit-logs/AuditLogsPage.jsx)
    *   **Access Restricted**: `ROLE_SUPER_ADMIN`
    *   **Function**: A read-only audit log viewer tracking system state changes. Captures user emails, action keywords (CREATE, UPDATE, DELETE, LOGIN), client IP addresses, timestamps, and database payload changes (diff JSON showing old vs. new values).

### H. Settings (सेटिंग्स)
*   **System Settings (सिस्टम सेटिंग्स)**
    *   **Path**: `/settings`
    *   **Component**: [SettingsPage.jsx](file:///c:/Users/debas/Desktop/Asset%20Management%20System/Asset-Management-System/frontend/src/pages/settings/SettingsPage.jsx)
    *   **Function**: Allows personal configuration adjustments, including scaling application font sizes, managing profile details, and switching the platform's active language interface between English (EN) and Hindi (HI).

---

## 📈 2. Financial Depreciation Calculations

The system calculates asset depreciation using the **Straight-Line Depreciation Method**. 

### 📐 The Mathematical Formula
Under Straight-Line Depreciation, an asset loses value by an equal amount each year over its estimated useful life down to a designated salvage (residual) value.

The core calculations implemented in [depreciationCalculator.js](file:///c:/Users/debas/Desktop/Asset%20Management%20System/Asset-Management-System/backend-node/src/utils/depreciationCalculator.js) are defined as follows:

1.  **Salvage Value ($S$)**: The estimated residual value of the asset at the end of its useful life, fixed at **5%** ($0.05$) of the purchase cost.
    $$S = C \times 0.05$$
2.  **Depreciable Amount ($A_{\text{dep}}$)**: The total capital cost subject to depreciation.
    $$A_{\text{dep}} = C - S$$
3.  **Annual Depreciation Amount ($D_{\text{annual}}$)**: The amount the asset depreciates per year.
    $$D_{\text{annual}} = \frac{A_{\text{dep}}}{L}$$
4.  **Annual Depreciation Rate ($R_{\text{dep}}$)**: The annual percentage rate of depreciation.
    $$R_{\text{dep}} = \left(\frac{1}{L}\right) \times 100\%$$
5.  **Elapsed Time in Years ($Y_{\text{elapsed}}$)**: The dynamic duration between the purchase date and calculation date, calculated using a leap-year-safe average year in milliseconds ($365.25 \times 24 \times 60 \times 60 \times 1000$).
    $$Y_{\text{elapsed}} = \max\left(0, \frac{\text{Current Date} - \text{Purchase Date}}{\text{Average Ms Per Year}}\right)$$
6.  **Total Accumulated Depreciation ($D_{\text{accumulated}}$)**: The cumulative depreciation recorded, capped at the total depreciable amount so the asset's book value doesn't drop below its salvage value.
    $$D_{\text{accumulated}} = \min\left(D_{\text{annual}} \times Y_{\text{elapsed}},\ A_{\text{dep}}\right)$$
7.  **Current Book Value ($V_{\text{current}}$)**: The current financial book value of the asset.
    $$V_{\text{current}} = \max\left(S,\ C - D_{\text{accumulated}}\right)$$

Where:
*   $C$: Original Purchase Cost of the asset (`purchase_cost`).
*   $L$: Useful Life of the asset in years (`useful_life`), which is loaded dynamically from the asset's category configuration (`AssetCategory.usefulLife`).

---

### 🧮 Practical Examples

#### Example 1: Active Asset (Mid-Life)
Consider an IT Server purchased for **₹1,00,000** with a useful life of **5 years**, and exactly **2 years** have elapsed since purchase.

*   **Purchase Cost ($C$)** = ₹1,00,000
*   **Useful Life ($L$)** = 5 years
*   **Elapsed Time ($Y_{\text{elapsed}}$)** = 2.0 years
*   **Salvage Value ($S$)** = ₹1,00,000 $\times$ 0.05 = **₹5,000**
*   **Depreciable Amount ($A_{\text{dep}}$)** = ₹1,00,000 - ₹5,000 = **₹95,000**
*   **Annual Depreciation ($D_{\text{annual}}$)** = ₹95,000 / 5 = **₹19,000 / year**
*   **Annual Depreciation Rate ($R_{\text{dep}}$)** = (1 / 5) $\times$ 100 = **20%**
*   **Total Accumulated Depreciation ($D_{\text{accumulated}}$)** = ₹19,000 $\times$ 2.0 = **₹38,000**
*   **Current Book Value ($V_{\text{current}}$)** = ₹1,00,000 - ₹38,000 = **₹62,000**

#### Example 2: Fully Depreciated Asset (End of Life)
Consider the same IT Server, but **6 years** have elapsed since the purchase.

*   **Purchase Cost ($C$)** = ₹1,00,000
*   **Useful Life ($L$)** = 5 years
*   **Elapsed Time ($Y_{\text{elapsed}}$)** = 6.0 years
*   **Salvage Value ($S$)** = **₹5,000**
*   **Depreciable Amount ($A_{\text{dep}}$)** = **₹95,000**
*   **Annual Depreciation ($D_{\text{annual}}$)** = **₹19,000 / year**
*   **Total Accumulated Depreciation ($D_{\text{accumulated}}$)** = $\min(19,000 \times 6.0,\ 95,000) = \min(114,000,\ 95,000) =$ **₹95,000**
*   **Current Book Value ($V_{\text{current}}$)** = $\max(5,000,\ 100,000 - 95,000) =$ **₹5,000**

> [!NOTE]
> Once an asset has fully depreciated past its useful life, the total accumulated depreciation caps at $A_{\text{dep}}$, ensuring the current book value stabilizes at the **₹5,000** salvage value limit and does not become negative.
