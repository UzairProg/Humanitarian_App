# Al-Husseiniya Platform (منصة الحسينية)

> A modern, dignified, and year-round humanitarian relief, community kitchen coordination, and verified organization platform inspired by the universal values and lessons of Karbala.

---

## 🏛️ Technology Stack (Strict MERN)

The platform is strictly built on the **MERN** architecture:
- **MongoDB**: Pure Mongoose 8 document models with atomic concurrency, UUID keys, compound indexing, and zero alternative database engines.
- **Express.js**: Express 4 REST API architecture with modular routers, strict object-level authorization, centralized sanitizing error handlers, and rate limiting.
- **React**: React 18 frontend with Vite, TypeScript, React Router 6, rich accessible UI tokens (Brand Navy, Muted Teal, Restrained Warm Gold), and bidirectional LTR/RTL support.
- **Node.js**: Node.js runtime with TypeScript across the entire monorepo workspaces (`packages/types`, `packages/config`, `packages/ui`, `packages/utils`, `apps/web`, `backend`).

---

## 📦 Monorepo Architecture

```text
husyn/
├── apps/
│   └── web/                   # React 18 + Vite frontend
│       ├── src/
│       │   ├── components/    # Header (with notifications), Sidebar, ProtectedRoute
│       │   ├── context/       # AuthContext, LocalizationContext (EN / AR)
│       │   ├── pages/         # Dashboard, Requests, FoodPrograms, Organizations, Events, etc.
│       │   └── services/      # ApiClient with JWT rotation
├── backend/                   # Pure Express.js + Mongoose backend
│   └── src/
│       ├── common/            # Custom errors, guards, authorization
│       ├── config/            # Typed env & Mongoose DB connection manager
│       ├── database/          # Mongoose models and comprehensive dev seed
│       ├── middleware/        # JWT auth, RBAC, Rate-limit, Error middleware
│       ├── models/            # Pure Mongoose models (UUID string IDs)
│       ├── modules/           # Auth, Users, Requests, FoodPrograms, Orgs, Events, Impact, etc.
│       ├── services/          # AuthorizationService, AuditService, NotificationService, ImpactService
│       └── tests/             # Unit, integration, concurrency, and E2E security suites
└── packages/
    ├── config/                # Shared security limits, RBAC permissions matrix
    ├── types/                 # Domain models, Enums, DTOs, and API responses
    ├── ui/                    # Shared design system components
    └── utils/                 # Cryptographic and formatting helpers
```

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js >= 18.0.0
- npm >= 9.0.0
- MongoDB (or local memory server via `USE_MEMORY_DB=true`)

### 2. Install Dependencies
```bash
npm install
```

### 3. Build Packages
```bash
npm run build:packages
```

### 4. Seed the Database
```bash
npm run db:seed
```
Seeds initial roles, permissions, administrative and individual accounts with bcrypt hashing, request categories, verified organizations, food programs, and community events.

### 5. Run the Application
In development:
```bash
# Start backend Express server (Port 4000)
npm --workspace=backend run start:dev

# Start web frontend Vite dev server (Port 5173)
npm --workspace=apps/web run dev
```

---

## 🧪 Testing & Validation

```bash
# Run full backend test suites
npm test

# Run security and object-level authorization test suites
npm run test:security

# Typecheck all monorepo packages
npm run typecheck

# Production builds
npm run build:backend
npm run build:web
```

---

## 🔒 Security & Privacy Commitments
- **Zero Fabricated Metrics**: All impact aggregations reflect real database counts and sums.
- **Strict Object-Level Authorization**: Requester privacy is enforced on every document retrieval and update. ID manipulation yields 403 Forbidden.
- **Atomic Food Reservations & Cancellation**: Capacity decrements use MongoDB `$inc` with `$gte` guards to guarantee zero negative allocations, while reservation cancellations safely return capacity and reopen programs.
- **Search Sanitization**: All public search queries safely escape regex operators to prevent ReDoS and regex injection, and private humanitarian requests are strictly excluded from search indexes.
- **Abuse Prevention**: Rate limiters protect authentication and public submission endpoints; duplicate pending reports on the same target within 24 hours are rejected.
- **Audit Trail**: State transitions, role changes, and administrative verifications are immutably logged with actor IDs and timestamps.

---

## 💾 Backup & Recovery Readiness (Production Ops)

### 1. MongoDB Database Backup
```bash
# Dump complete database
mongodump --uri="$MONGODB_URI" --gzip --archive=/backups/al_husseiniya_$(date +%Y%m%d_%H%M%S).gz

# Restore database
mongorestore --uri="$MONGODB_URI" --gzip --archive=/backups/al_husseiniya_backup_file.gz --drop
```

### 2. Environment & Secret Restoration
- Verify `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET` are stored in a secure secret manager (e.g., AWS Secrets Manager, HashiCorp Vault).
- Production startup automatically halts if default or weak development JWT keys are detected.

### 3. File Asset Storage Recovery
- When using `STORAGE_DRIVER=s3`, enable S3 Bucket Versioning and Cross-Region Replication for uploaded documents and verification evidence.
- When using `STORAGE_DRIVER=local`, include `./uploads` in the daily volume snapshot and backup rotation.
