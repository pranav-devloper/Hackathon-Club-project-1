# Architecture — Manufactory ERP

## System Overview

Manufactory ERP is a full-stack single-page application (SPA) with a RESTful API backend. It follows a monolithic architecture where the Express server handles both API routing and static file serving in production.

```
┌─────────────────────────────────────────────────────────┐
│                        CLIENT                           │
│  React 19 SPA + Tailwind CSS + Recharts + Motion       │
│  Served by Vite (dev) or Express static (prod)         │
└──────────────────────┬──────────────────────────────────┘
                       │ HTTP / REST API
                       ▼
┌─────────────────────────────────────────────────────────┐
│                     EXPRESS API                         │
│  server.js — Routes, Auth Middleware, Body Parsing      │
│  ├── /api/auth/*    (signup, login, OTP, reset)         │
│  ├── /api/products/*                                    │
│  ├── /api/work-centers/*                                │
│  ├── /api/boms/*                                        │
│  ├── /api/mo/*                                          │
│  ├── /api/work-orders/*                                 │
│  ├── /api/stats                                         │
│  └── /api/health                                        │
└──────────────────────┬──────────────────────────────────┘
                       │
          ┌────────────┴────────────┐
          ▼                         ▼
┌──────────────────┐    ┌──────────────────────────┐
│   IN-MEMORY      │    │   PostgreSQL (optional)  │
│   Arrays         │    │   via Drizzle ORM        │
│   (default)      │    │   10 tables + relations  │
└──────────────────┘    └──────────────────────────┘
          │
          ▼
┌──────────────────────────────────────────────────────────┐
│                   EXTERNAL SERVICES                      │
│  ├── Nodemailer (SMTP) — OTP emails                      │
│  ├── Twilio — SMS notifications                          │
│  └── Google Gemini API — AI capabilities                 │
└──────────────────────────────────────────────────────────┘
```

## Tech Stack Details

### Frontend

| Component | Technology | Purpose |
|---|---|---|
| UI Library | React 19 | Component-based UI |
| Styling | Tailwind CSS 4 | Utility-first CSS |
| Icons | Lucide React | SVG icon library |
| Charts | Recharts | Dashboard visualizations |
| Animations | Motion (Framer Motion) | Page transitions, micro-interactions |
| Excel Export | XLSX | Spreadsheet generation |
| Build | Vite 6 | Dev server, HMR, bundling |

### Backend

| Component | Technology | Purpose |
|---|---|---|
| Runtime | Node.js | JavaScript execution |
| Framework | Express 4 | HTTP server, routing, middleware |
| Auth | JWT + bcryptjs | Token-based authentication |
| OTP | Node crypto | Secure random OTP generation |
| Dev Server | Vite middleware | HMR, fast refresh |

### Database

| Component | Technology | Purpose |
|---|---|---|
| Primary | PostgreSQL | Production data store |
| ORM | Drizzle ORM | Type-safe SQL queries |
| Fallback | In-memory arrays | Development without PostgreSQL |

### External Services

| Service | Technology | Purpose |
|---|---|---|
| Email | Nodemailer (SMTP) | OTP delivery, password reset |
| SMS | Twilio | Optional SMS notifications |
| AI | Google Gemini | AI-powered features |

## Database Schema

### Entity Relationship Diagram

```
┌──────────────┐       ┌──────────────────┐       ┌──────────────┐
│    users     │       │   userEvents     │       │   products   │
├──────────────┤       ├──────────────────┤       ├──────────────┤
│ id (PK)      │──┐    │ id (PK)          │       │ id (PK)      │
│ username     │  │    │ userId (FK)      │       │ code (UQ)    │
│ email (UQ)   │  └───▶│ eventType        │       │ name         │
│ passwordHash │       │ eventName        │       │ category     │
│ displayName  │       │ pagePath         │       │ unitCost     │
│ verified     │       │ metadata (JSONB) │       │ unit         │
│ createdAt    │       │ createdAt        │       │ onHand       │
│ updatedAt    │       └──────────────────┘       │ freeToUse    │
└──────────────┘                                  │ incoming     │
                                                  │ outgoing     │
                                                  │ createdAt    │
                                                  └──────┬───────┘
                                                         │
            ┌────────────────────────────────────────────┤
            │                                            │
            ▼                                            ▼
┌──────────────────┐                          ┌──────────────────┐
│      boms        │                          │  workCenters     │
├──────────────────┤                          ├──────────────────┤
│ id (PK)          │                          │ id (PK)          │
│ code (UQ)        │                          │ code (UQ)        │
│ productId (FK)   │◀─── products             │ name             │
│ quantity         │                          │ costPerHour      │
│ reference        │                          │ capacity         │
│ createdAt        │                          │ status           │
└───────┬──────────┘                          │ createdAt        │
        │                                     └────────┬─────────┘
        │                                              │
        ├──▶ bomComponents                             │
        │    ├── id (PK)                               │
        │    ├── bomId (FK)                            │
        │    ├── componentProductId (FK)               │
        │    └── quantity                              │
        │                                              │
        └──▶ bomOperations                             │
             ├── id (PK)                               │
             ├── bomId (FK)                            │
             ├── operationName                         │
             ├── workCenterId (FK)◀────────────────────┘
             └── expectedDuration

┌──────────────────────┐
│ manufacturingOrders  │
├──────────────────────┤
│ id (PK)              │
│ code (UQ)            │
│ finishedProductId    │◀─── products
│ bomId (FK)           │◀─── boms
│ quantity             │
│ unit                 │
│ scheduleDate         │
│ assignee             │
│ status               │
│ createdAt            │
└───────┬──────────────┘
        │
        ├──▶ moComponents
        │    ├── id (PK)
        │    ├── moId (FK)
        │    ├── productId (FK)◀─── products
        │    ├── toConsume
        │    ├── consumed
        │    └── availability
        │
        └──▶ workOrders
             ├── id (PK)
             ├── code
             ├── moId (FK)
             ├── operation
             ├── workCenterId (FK)◀─── workCenters
             ├── expectedDuration
             ├── realDuration
             ├── status
             ├── startedAt
             └── createdAt
```

### Tables Summary

| Table | Purpose | Key Relationships |
|---|---|---|
| `users` | User accounts | 1:N → userEvents |
| `userEvents` | Behavior analytics | N:1 → users |
| `products` | Inventory items (raw + finished) | Referenced by boms, mo, moComponents |
| `workCenters` | Factory stations | Referenced by bomOperations, workOrders |
| `boms` | Material recipes | 1:N → bomComponents, bomOperations; N:1 → products |
| `bomComponents` | Raw materials per BOM | N:1 → boms, products |
| `bomOperations` | Production steps per BOM | N:1 → boms, workCenters |
| `manufacturingOrders` | Production orders | 1:N → moComponents, workOrders; N:1 → products, boms |
| `moComponents` | Material consumption per MO | N:1 → manufacturingOrders, products |
| `workOrders` | Individual operations per MO | N:1 → manufacturingOrders, workCenters |

## Authentication Flow

```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│  Signup  │     │  Login   │     │ JWT Auth │     │ Password │
│          │     │          │     │          │     │  Reset   │
└────┬─────┘     └────┬─────┘     └────┬─────┘     └────┬─────┘
     │                │                │                │
     ▼                ▼                ▼                ▼
┌─────────┐    ┌───────────┐    ┌───────────┐    ┌───────────┐
│ Validate│    │ Check     │    │ Verify    │    │ Request   │
│ password│    │ credentials│   │ Bearer    │    │ OTP via   │
│ (strong)│    │ + rate    │    │ token in  │    │ email     │
│         │    │ limiting  │    │ Authorization│  │           │
└────┬────┘    └─────┬─────┘    └─────┬─────┘    └─────┬─────┘
     │               │                │                │
     ▼               ▼                ▼                ▼
┌─────────┐    ┌───────────┐    ┌───────────┐    ┌───────────┐
│ Hash    │    │ Generate  │    │ Attach    │    │ Verify    │
│ password│    │ JWT token │    │ user to   │    │ 6-digit   │
│ bcrypt  │    │ (7 day)   │    │ request   │    │ OTP       │
└────┬────┘    └─────┬─────┘    └───────────┘    └─────┬─────┘
     │               │                                  │
     ▼               ▼                                  ▼
┌─────────┐    ┌───────────┐                     ┌───────────┐
│ Store   │    │ Return    │                     │ Reset     │
│ user    │    │ token +   │                     │ password  │
│         │    │ user data │                     │           │
└─────────┘    └───────────┘                     └───────────┘
```

### Security Measures

| Feature | Implementation |
|---|---|
| Password hashing | bcryptjs with salt rounds |
| OTP generation | `crypto.randomInt` (CSPRNG) |
| OTP storage | HMAC-SHA256 hashed |
| OTP verification | Timing-safe comparison (`crypto.timingSafeEqual`) |
| Rate limiting | Login: 5 attempts → 15min lockout; OTP: 60s cooldown |
| OTP brute-force | 3 verification attempts max |
| OTP expiry | 5 minutes |
| JWT expiry | 7 days |
| Metadata sanitization | Strips password, token, secret, API key from logs |

## Data Flow: Manufacturing Order Lifecycle

```
1. CREATE MO
   User fills form → POST /api/mo
   ┌─────────────────────────────────────────┐
   │ Server validates BOM exists             │
   │ Server validates product exists         │
   │ Auto-generates MO code (MO-XXX)         │
   │ Creates MO record (status: "draft")     │
   │ Creates moComponents from BOM           │
   │ Creates workOrders from BOM operations  │
   └─────────────────────────────────────────┘

2. CONFIRM MO
   POST /api/mo/:id/status { status: "confirmed" }
   ┌─────────────────────────────────────────┐
   │ Validates status transition allowed     │
   │ Updates MO status                       │
   └─────────────────────────────────────────┘

3. START MO
   POST /api/mo/:id/status { status: "in-progress" }
   ┌─────────────────────────────────────────┐
   │ Updates MO status                       │
   │ Work orders become active               │
   └─────────────────────────────────────────┘

4. COMPLETE WORK ORDERS
   PUT /api/work-orders/:id { realDuration, status: "done" }
   ┌─────────────────────────────────────────┐
   │ Individual operations marked complete   │
   │ Duration tracked for reporting          │
   └─────────────────────────────────────────┘

5. COMPLETE MO
   POST /api/mo/:id/status { status: "done" }
   ┌─────────────────────────────────────────┐
   │ All work orders must be done            │
   │ Stock quantities updated                │
   │ MO marked complete                      │
   └─────────────────────────────────────────┘
```

## API Architecture

### Route Organization

All routes are defined in `server.js` as a monolithic Express application:

```
server.js
├── Middleware
│   ├── CORS
│   ├── Body Parser (JSON)
│   └── Static file serving (production)
│
├── Auth Middleware
│   └── verifyToken() — JWT verification
│
├── Routes
│   ├── POST   /api/auth/signup
│   ├── POST   /api/auth/login
│   ├── GET    /api/auth/me
│   ├── POST   /api/auth/forgot-password
│   ├── POST   /api/auth/verify-otp
│   ├── POST   /api/auth/reset-password
│   ├── GET    /api/products          (auth required)
│   ├── POST   /api/products          (auth required)
│   ├── PUT    /api/products/:id      (auth required)
│   ├── GET    /api/work-centers      (auth required)
│   ├── POST   /api/work-centers      (auth required)
│   ├── GET    /api/boms              (auth required)
│   ├── POST   /api/boms              (auth required)
│   ├── GET    /api/mo                (auth required)
│   ├── POST   /api/mo               (auth required)
│   ├── POST   /api/mo/:id/status    (auth required)
│   ├── GET    /api/work-orders       (auth required)
│   ├── PUT    /api/work-orders/:id   (auth required)
│   ├── GET    /api/stats             (auth required)
│   └── GET    /api/health
│
└── Vite middleware (dev) / Static serving (prod)
```

### Data Storage Strategy

```
┌─────────────────────────────────────────────┐
│           Data Storage Decision              │
├─────────────────────────────────────────────┤
│                                             │
│  SQL_HOST is set?                           │
│  ├── YES → Connect to PostgreSQL            │
│  │         Use Drizzle ORM queries          │
│  │         Persistent storage               │
│  │                                          │
│  └── NO  → Use in-memory arrays             │
│            Data lost on restart             │
│            Fast development iteration       │
│                                             │
└─────────────────────────────────────────────┘
```

## Build & Deployment

### Development

```
npm run dev
    │
    ├── Express server starts on port 3000
    ├── Vite dev server integrated as middleware
    ├── HMR enabled (hot module replacement)
    └── In-memory data store
```

### Production Build

```
npm run build
    │
    ├── vite build → dist/ (static assets)
    └── esbuild → dist/server.cjs (bundled server)

npm start
    │
    └── node dist/server.cjs
        ├── Serves static files from dist/
        ├── SPA fallback to index.html
        └── API routes active
```

### Port Configuration

- Default: `3000`
- Auto-detects available port if 3000 is occupied
- Configurable via `PORT` environment variable
