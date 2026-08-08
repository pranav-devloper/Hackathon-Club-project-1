# Manufactory ERP

**Next-Gen Industrial Systems** — Manufacturing ERP for wood furniture production with 0.001mm tolerance precision.

---

## Overview

Manufactory ERP is a full-stack web application designed for managing the complete manufacturing lifecycle of wood furniture products. It covers production planning, inventory management, work order tracking, and operational analytics.

## Features

- **Manufacturing Orders (MO)** — Create, track, and manage production orders with status workflows (Draft → Confirmed → In-Progress → Done → Cancelled)
- **Work Orders (WO)** — Track individual operations (cutting, planing, CNC routing, assembly, sanding, lacquering)
- **Bills of Materials (BOM)** — Define raw material recipes and operational steps for each product
- **Stock Ledger** — Inventory management for finished goods and raw materials (lumber, plywood, veneer, hardware, adhesives, lacquers)
- **Work Centers** — Manage factory stations (panel saws, CNC routers, planers, edgebanders, sanders, spray booths, assembly stations, kilns)
- **Reports & Analytics** — Operational dashboards with charts and performance metrics
- **Authentication** — JWT-based auth with signup, login, forgot password, OTP email verification, password reset
- **Excel Export** — Export data to XLSX spreadsheets

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Tailwind CSS 4, Lucide React, Recharts, Motion |
| Backend | Node.js, Express 4, Vite (dev server) |
| Database | PostgreSQL (via Drizzle ORM) / In-memory fallback |
| Auth | JWT, bcryptjs, crypto (OTP) |
| Email | Nodemailer (SMTP) |
| AI | Google Gemini API |
| Build | Vite, esbuild |

## Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL (optional — runs with in-memory data by default)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd Hackathon-Club-project-1

# Install dependencies
npm install
```

### Environment Setup

Create a `.env.local` file in the project root:

```env
# Required
JWT_SECRET=your-secret-key-here

# SMTP (for OTP emails)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=your-email@gmail.com

# PostgreSQL (optional - defaults to in-memory)
SQL_HOST=localhost
SQL_USER=postgres
SQL_PASSWORD=your-password
SQL_DB_NAME=manufactory

# Google OAuth (optional)
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret

# Twilio (optional - SMS)
TWILIO_ACCOUNT_SID=your-sid
TWILIO_AUTH_TOKEN=your-token
```

### Run Development Server

```bash
npm run dev
```

The app starts at `http://localhost:3000`.

### Run Tests

```bash
npm test
```

### Production Build

```bash
npm run build
npm start
```

## Project Structure

```
├── server.js                    # Express backend (API routes, auth, middleware)
├── index.html                   # Vite SPA entry point
├── package.json
├── vite.config.js               # Vite config (React + Tailwind plugins)
│
└── src/
    ├── App.jsx                  # Root React component
    ├── main.jsx                 # React DOM entry
    ├── index.css                # Tailwind CSS
    ├── types.js                 # Status/category constants
    │
    ├── components/              # UI components
    │   ├── AuthModal.jsx
    │   ├── AuthScreen.jsx
    │   ├── BentoDashboard.jsx
    │   ├── BillsOfMaterials.jsx
    │   ├── Header.jsx
    │   ├── ManufacturingOrders.jsx
    │   ├── MasterMenu.jsx
    │   ├── ProfileView.jsx
    │   ├── ReportsView.jsx
    │   ├── StockLedgerView.jsx
    │   ├── WorkCenterView.jsx
    │   └── WorkOrders.jsx
    │
    ├── config/config.js         # Environment configuration
    ├── controllers/             # Auth controller
    ├── data/mockData.js         # Seed data
    ├── db/
    │   ├── index.js             # PostgreSQL pool + Drizzle
    │   └── schema.js            # Database schema (10 tables)
    ├── models/                  # In-memory data stores
    ├── routes/auth.routes.js    # Auth routes
    ├── services/email.service.js
    ├── tests/                   # Unit tests
    └── utils/utils.js           # OTP + template helpers
```

## API Overview

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/signup` | Register new user |
| POST | `/api/auth/login` | Login (rate-limited) |
| GET | `/api/auth/me` | Get current user |
| POST | `/api/auth/forgot-password` | Request password reset OTP |
| POST | `/api/auth/verify-otp` | Verify 6-digit OTP |
| POST | `/api/auth/reset-password` | Reset password |
| GET | `/api/products` | List all products |
| POST | `/api/products` | Create product |
| GET | `/api/work-centers` | List work centers |
| POST | `/api/work-centers` | Create work center |
| GET | `/api/boms` | List bills of materials |
| POST | `/api/boms` | Create BOM |
| GET | `/api/mo` | List manufacturing orders |
| POST | `/api/mo` | Create manufacturing order |
| POST | `/api/mo/:id/status` | Update MO status |
| GET | `/api/work-orders` | List work orders |
| PUT | `/api/work-orders/:id` | Update work order |
| GET | `/api/stats` | Dashboard statistics |
| GET | `/api/health` | Health check |

See [architecture.md](architecture.md) for full API documentation.

## Security

- JWT authentication with 7-day token expiry
- Rate limiting on login (5 attempts → 15-minute lockout)
- OTP brute-force protection (3 attempts max, 5-minute expiry)
- Strong password validation (8+ chars, uppercase, lowercase, number, special char)
- Timing-safe OTP comparison
- Metadata sanitization on event logs
