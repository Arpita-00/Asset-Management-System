# 📖 System Documentation Directory

Welcome to the official documentation directory for the **AI-Powered Smart Asset Management System**. This directory contains comprehensive details about the system's database schema, workflow charts, entity relationships, technical requirements, and codebase layout.

---

## 📂 Documentation Directory Index

Use the table below as a quick-reference guide to navigate the system documents. All file links are clickable:

| Document / Asset | File Path | Format | Description |
| :--- | :--- | :---: | :--- |
| **Directory Index** | [README.md](file:///c:/Users/debas/Desktop/Asset%20Management%20System/Asset-Management-System/docs/README.md) | Markdown | *This document.* A guide to all available project documentation. |
| **Technical Stack & Requirements** | [technical_requirements.md](file:///c:/Users/debas/Desktop/Asset%20Management%20System/Asset-Management-System/docs/technical_requirements.md) | Markdown | Details the client-server tech stack (React, Node.js, Express, Sequelize, MySQL), package dependencies, and deployment specifications. |
| **Features & Database Guide** | [features_and_database.md](file:///c:/Users/debas/Desktop/Asset%20Management%20System/Asset-Management-System/docs/features_and_database.md) | Markdown | Explains the core business features (AI Assistant, OCR Ingestion, Health/Risk Scores, Depreciation) and how they map to tables. |
| **Source Structure Guide** | [source_structure.md](file:///c:/Users/debas/Desktop/Asset%20Management%20System/Asset-Management-System/docs/source_structure.md) | Markdown | Outlines the directory structure and organization of the frontend (`frontend/src/`) and backend (`backend-node/src/`) codebases. |
| **Project Workflow Guide** | [project_workflow.md](file:///c:/Users/debas/Desktop/Asset%20Management%20System/Asset-Management-System/docs/project_workflow.md) | Markdown | Deep dive into step-by-step business workflows (Asset Lifecycle, Repairs, Return, Allocations, and OCR ingestion). |
| **SQL Database Schema** | [schema.sql](file:///c:/Users/debas/Desktop/Asset%20Management%20System/Asset-Management-System/docs/schema.sql) | SQL | The official DDL schema definition file (tables, columns, indexes, foreign keys) for the system database. |
| **Entity-Relationship Diagram** | [er_diagram.mmd](file:///c:/Users/debas/Desktop/Asset%20Management%20System/Asset-Management-System/docs/er_diagram.mmd) | Mermaid | Mermaid source file defining entity schemas and relationships (User, Asset, Department, etc.). |
| **Operational Workflows Chart** | [project_workflow.mmd](file:///c:/Users/debas/Desktop/Asset%20Management%20System/Asset-Management-System/docs/project_workflow.mmd) | Mermaid | Mermaid source diagram visualizing state transitions and flowpaths for assignments, transfers, and repairs. |
| **Mermaid Render Utility** | [render_mermaid.html](file:///c:/Users/debas/Desktop/Asset%20Management%20System/Asset-Management-System/docs/render_mermaid.html) | HTML | Local HTML utility tool to view and render `.mmd` diagrams directly in your web browser. |

---

## 🛠️ Tech Stack at a Glance

* **Frontend**: Single-Page Application built on **React (v18)**, optimized with **Vite**, using **Zustand** (global client states), **TanStack React Query** (API request caching & mutations), and styled with **Vanilla CSS** and **TailwindCSS**.
* **Backend**: **Node.js** API using **Express.js** and **Sequelize ORM** with **PostgreSQL/MySQL** compatibility.
* **Integrations**: 
  * **Tesseract.js** for client-side/local optical character recognition (OCR) of invoices.
  * **Google Gemini API** (via `@google/generative-ai`) for natural language query interpretations and chat.
  * **Nodemailer** for automated email alerts (warranty expirations, assignments, repair logs).
  * **qrcode.react** and local APIs for asset passport QR tag generation.

---

## 📊 Viewing Mermaid Diagrams

This documentation includes two Mermaid `.mmd` diagram files representing system workflows and database relationships. You can render these diagrams in three ways:

1. **GitHub Viewer**: If viewing this repository on GitHub, `.mmd` files render automatically in markdown blocks.
2. **Local Render Utility**: Double-click [render_mermaid.html](file:///c:/Users/debas/Desktop/Asset%20Management%20System/Asset-Management-System/docs/render_mermaid.html) inside this folder, select/upload either `.mmd` file, and view it rendered in your browser.
3. **Markdown Editor Extensions**: If using VS Code, install the "Mermaid Preview" or "Markdown Preview Mermaid Support" extension to view diagrams natively in markdown.

> [!TIP]
> Make sure to reference [technical_requirements.md](file:///c:/Users/debas/Desktop/Asset%20Management%20System/Asset-Management-System/docs/technical_requirements.md) before setting up your local environment, as it outlines the required `.env` file configurations for Nodemailer, DB credentials, and Gemini API keys.
