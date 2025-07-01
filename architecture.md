# Enterprise POS & ERP-lite Platform

## 1. System Overview
A multi-tenant, offline-capable, BIR-compliant POS and lightweight ERP system. Designed to handle robust inventory workflows, double-entry accounting, and offline-first retail transactions.

## 2. Tech Stack
* **Database:** MongoDB (using ACID Transactions for the General Ledger & Inventory Movements).
* **Backend:** Node.js, Express, TypeScript, Mongoose.
* **Frontend:** React, TypeScript, Tailwind CSS, Zustand (State Management), React Query.
* **Caching & Queues:** Redis (for session management, rate limiting, and background job queues).
* **Offline Storage:** IndexedDB (via Dexie.js) for `pos-web` local operations.

## 3. Core Architectural Decisions

### A. Multi-Tenancy Strategy
* **Logical Isolation (Pool Model):** All tenants share the same database. Data isolation is strictly enforced via a mandatory `tenant_id` on every document, injected via middleware based on the authenticated session. 

### B. Double-Entry Accounting as the Source of Truth
* Financial integrity is maintained by routing all sales, purchasing, and inventory adjustments through the `journal_entries` and `general_ledger` collections. A sale is not just a receipt; it is a debit to Cash/AR and a credit to Sales Revenue.

### C. Offline-First POS (`pos-web`)
* Cashiers must be able to operate during internet outages. The POS loads the day's catalog and customer list into IndexedDB. Sales are recorded locally in a `sync_queue`.
* When connectivity is restored, a background worker batches the queue to the backend API, resolving any inventory conflicts.

### D. Concurrency & Inventory Integrity
* Stock movements utilize MongoDB's optimistic concurrency control (versioning) to prevent race conditions when multiple branches sell the same SKU simultaneously.

## 4. Security & Compliance
* **RBAC:** Fine-grained permissions (e.g., `inventory:read`, `sales:void`).
* **Audit Trail:** Every critical CRUD operation logs the `actor`, `action`, `before_state`, and `after_state` in the `audit_logs` collection.
* **BIR Compliance:** Dedicated services for generating sequential OR/SI numbers and exporting Sales/Purchase Books in BIR-mandated formats.