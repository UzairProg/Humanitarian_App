# AL-HUSSEINIYA
## PHASE 1 — FOUNDATION, ARCHITECTURE AND ENGINEERING SETUP
### Antigravity Autonomous Build Specification
### Version 1.0 | September 2026

---

# 0. EXECUTION INSTRUCTION

You are the lead software architect, senior full-stack engineer, security engineer, database architect, DevOps engineer and product-minded technical lead responsible for building the first phase of a real product called **Al-Husseiniya**.

This document is an implementation specification and autonomous execution prompt. Do not treat it as a request for a mockup, static prototype, visual-only demo, or collection of placeholder screens.

The eventual goal is a production-quality mobile application plus web-based provider and administration systems. This Phase 1 task establishes the technical foundation on which all later phases will be built.

## IMPORTANT WORKING MODE

The product owner has limited time for manual testing and does not want to be asked to verify routine implementation details.

Therefore:
- Work autonomously.
- Inspect the repository/environment before changing anything.
- Make reasonable engineering decisions without asking unnecessary questions.
- Implement the foundation completely.
- Run appropriate checks yourself.
- Fix deterministic errors yourself.
- Re-run checks after fixing them.
- Only stop and ask the product owner when a decision genuinely requires business, legal, religious or product-owner input and cannot safely be inferred.
- Do not invent unresolved business rules.
- Do not invent religious authority or religious verification decisions.
- Do not invent production credentials.
- Do not claim an external service is configured when it is not.

At the end of the phase, provide a concise implementation report.

---

# 1. PRODUCT IDENTITY

## Product name

**Al-Husseiniya**

Use this as the working product name throughout the codebase unless the existing repository already contains an approved branding configuration.

---

# 2. PRODUCT CONTEXT

Al-Husseiniya is envisioned as a year-round humanitarian and community platform inspired by the values and lessons associated with Imam Hussein and Karbala.

The initial vision comes from the culture surrounding Muharram, Ashura and Arbaeen, including community service, food distribution, welcoming visitors and bringing people together.

**Al-Husseiniya is NOT intended to be only a Muharram application.** The product should continue operating throughout the year.

The platform is intended to connect:
- Individuals
- People seeking humanitarian assistance
- Hussainiyas
- NGOs
- Community organizations
- Businesses
- Restaurants
- Volunteers
- Scholars
- Preachers
- Religious specialists
- Administrators
- Moderators

The product should provide practical humanitarian and community services while also providing trusted educational and cultural experiences.

The platform should be welcoming to both Muslims and non-Muslims.

---

# 3. IMPORTANT RELIGIOUS ROLE DISTINCTION

This distinction is critical and must be preserved throughout the technical architecture.

Al-Husseiniya is primarily:

**TECHNICAL + ADMINISTRATIVE + OPERATIONAL INFRASTRUCTURE**

It is NOT a replacement for religious authorities.

Religious scholars, specialists and appropriate authorities remain responsible for religious expertise, religious guidance and religious decisions.

Al-Husseiniya complements their work by providing:
- technology
- administrative workflows
- identity/profile infrastructure
- content infrastructure
- review workflows
- access control
- communication infrastructure
- organization
- operational management

The platform may support religious contributors, scholars and preachers, but it must not represent itself as independently issuing religious authority.

A future contributor workflow may involve:

Application → Administrative information → Personal/technical interview → Specialist review where required → Approval → Appropriate contributor access

The exact religious review process is NOT finalized in Phase 1. Therefore the architecture must support configurable review states without hardcoding assumptions about who has religious authority.

---

# 4. CORE PRODUCT PURPOSE

The product should translate values associated with Karbala into practical action.

The core concepts are:

**GET HELP**
**GIVE HELP**
**SERVE**
**LEARN**
**PARTICIPATE**
**CONNECT**
**SEE IMPACT**

Working product definition:

> Al-Husseiniya is a trusted year-round humanitarian and community platform that connects people who need help with trusted people and organizations willing to provide it, while creating a broader ecosystem around service, participation, community and knowledge inspired by the values of Karbala.

---

# 5. PRODUCT PRINCIPLES

1. **Humanitarian first:** make practical help possible; do not become only a content or social platform.
2. **Trust by design:** verification, moderation, authorization and accountability are core functionality.
3. **Year-round:** never assume operation only during Muharram or Arbaeen.
4. **Inclusive:** humanitarian experiences should be understandable and usable by Muslims and non-Muslims.
5. **Respect religious authority:** provide technical/administrative infrastructure; do not independently establish religious authority.
6. **Privacy:** humanitarian requests may contain sensitive information; collect and expose only what is necessary.
7. **Least privilege:** every user/system component gets only required access.
8. **Auditability:** important administrative and operational actions must be traceable.
9. **Accessibility:** Arabic, English, RTL and accessibility must be considered from the beginning.
10. **Build for evolution:** support future growth without premature complexity.

---

# 6. PHASE 1 OBJECTIVE

Phase 1 is the **technical foundation phase**.

Do NOT attempt to build the entire Al-Husseiniya ecosystem in this phase. Do NOT implement all humanitarian workflows yet. Do NOT implement payments, donations, advanced matching, complex messaging or advanced analytics unless necessary for the foundation.

Establish:
- repository structure
- application architecture
- backend architecture
- database architecture
- authentication foundation
- authorization/RBAC foundation
- API conventions
- security foundation
- configuration management
- shared types/utilities
- design system foundation
- mobile application shell
- web application shell
- documentation
- automated quality checks
- development environment
- test foundation

Phase 1 must leave the project ready for Phase 2.

---

# 7. RECOMMENDED TECHNOLOGY STACK

Unless the existing repository contains a strong reason to use a compatible alternative:

**Mobile:** Flutter + Dart

**Web:** React + TypeScript

**Backend:** Node.js + NestJS + TypeScript

**Database:** PostgreSQL

**Cache / queues:** Redis

**File storage:** S3-compatible object storage abstraction

**Authentication:** secure JWT/session architecture with refresh-token strategy as appropriate

**Notifications:** provider abstraction for push, email and SMS

**Maps:** provider abstraction; do not couple business logic to one vendor

**Search:** PostgreSQL initially; allow OpenSearch/Elasticsearch later

**Monitoring:** structured logs, error tracking, health checks and metrics

Use mature libraries. Do not introduce unnecessary dependencies.

---

# 8. ARCHITECTURE STYLE

Use a **modular monolith** initially. Do NOT create microservices in Phase 1.

Create clear domain boundaries inside one backend application.

Initial domains:
- Auth
- Users
- Roles
- Permissions
- Organizations
- Businesses
- Humanitarian Requests
- Food Programs
- Events
- Knowledge
- Contributors
- Volunteers
- Notifications
- Reports
- Moderation
- Impact
- Audit

Some modules may initially contain only interfaces, models, shared contracts or placeholders for later implementation. Do not create fake functionality merely to populate folders.

---

# 9. HIGH-LEVEL ARCHITECTURE

Use this conceptual model:

```text
                    AL-HUSSEINIYA
                          |
          +---------------+---------------+
          |                               |
     Mobile App                      Web Applications
       Flutter                    React + TypeScript
          |                               |
          +---------------+---------------+
                          |
                         API
                          |
                 NestJS Backend
                          |
       +------------------+------------------+
       |                  |                  |
   Domain Modules     Infrastructure     Shared
       |                  |               Contracts
       |                  |
       |          +-------+--------+
       |          |       |        |
       |       PostgreSQL Redis  Object Storage
       |
       +--------------------------------------+
       |
   Auth / RBAC / Verification / Audit
```

Keep presentation, domain/business logic, data access, infrastructure and configuration separated. Business rules must not be buried inside UI components.

---

# 10. REPOSITORY INSPECTION

Before creating or modifying files:
1. Inspect the complete repository.
2. Identify existing applications.
3. Identify package manager.
4. Identify framework choices.
5. Identify database setup.
6. Identify environment files.
7. Identify build scripts.
8. Identify tests.
9. Identify documentation.
10. Identify deployment configuration.

Do NOT blindly overwrite existing work.

If empty, initialize cleanly. If useful work exists, preserve and integrate it. If technology conflicts with this specification, determine whether migration is genuinely necessary. Do not rewrite a functioning system merely for stylistic preference.

Document major architecture decisions.

---

# 11. REPOSITORY STRUCTURE

Prefer:

```text
al-husseiniya/
├── apps/
│   ├── mobile/
│   ├── web/
│   └── admin/
├── backend/
├── packages/
│   ├── types/
│   ├── config/
│   ├── utils/
│   └── ui/
├── docs/
│   ├── architecture/
│   ├── api/
│   ├── database/
│   ├── security/
│   └── development/
├── infrastructure/
├── scripts/
├── .env.example
└── README.md
```

Adapt this to the chosen workspace tooling if necessary. The important requirement is clean separation and no circular dependencies.

---

# 12. ENVIRONMENT CONFIGURATION

Create `.env.example` and separate development/staging/production concepts.

Validate environment variables at startup.

Never commit:
- database passwords
- JWT secrets
- API keys
- cloud credentials
- private certificates
- service account files

If a production service is not configured, create the abstraction and safe development configuration, document the required production variable, and do not fabricate credentials.

---

# 13. DATABASE FOUNDATION

Use PostgreSQL and migration-based schema management.

Use UUIDs or another robust identifier strategy.

Major tables should have timestamps. Use soft deletion only where it makes sense.

Use foreign keys, indexes, unique constraints and transactions where required.

Do not over-normalize unnecessarily.

---

# 14. INITIAL DATABASE ENTITIES

Create foundations for:

### User
Identity, profile, account status, locale, timezone, timestamps.

### Role
id, name, description.

### Permission
id, key, description.

### UserRole
Links users to roles.

### RolePermission
Links roles to permissions.

### Organization
name, description, logo/media reference, location, contact, status, verification status, timestamps.

### OrganizationMember
organizationId, userId, organization role, status.

### OrganizationVerification
organizationId, status, reviewer, decision, notes, submittedAt, reviewedAt.

### Business
name, category, description, location, contact, status, verification status, timestamps.

### BusinessVerification
Use a reusable verification approach where practical.

### HumanitarianRequest
requesterId, categoryId, title/summary, description, location, status, priority if needed, timestamps.

### RequestCategory
Configurable assistance categories.

### RequestStatusHistory
Every important request state transition must be traceable.

### FoodProgram
organizationId, title, description, location, date, startTime, endTime, capacity, status, instructions, timestamps.

### FoodProgramAvailability
Use if required by the implementation design.

### Event
organizer, title, description, location, startAt, endAt, category, status, media reference, timestamps.

### KnowledgeContent
title, summary, body/media reference, contributorId, category, language, review status, publication status, timestamps.

### ContributorProfile
userId, contributorType, biography, credentials metadata where appropriate, verification status, review status, visibility.

### ContributorVerification / Review History
Store verification/review state and decisions without assuming religious authority belongs to the platform.

### VolunteerProfile
userId, skills, interests, availability, location, status.

### VolunteerOpportunity
organizationId, title, description, location, date/time, requirements, capacity, status.

### Report
reporterId, target entity, reason, description, evidence, status, assigned reviewer, resolution, timestamps.

### Notification
userId, type, title, body, data/payload, readAt, createdAt.

### ImpactRecord
entity type, entity id, metric type, value, source, timestamp.

### AuditLog
actorId, action, targetType, targetId, metadata, timestamp, requestId.

---

# 15. AUTHENTICATION

Implement a secure authentication foundation:
- registration
- login
- logout
- refresh/session handling
- password hashing
- password reset architecture
- account status
- email/phone verification architecture

Do not store plaintext passwords.

Use secure password hashing. Add rate limiting to sensitive authentication endpoints.

Keep authentication independent from business domains.

---

# 16. ROLE AND PERMISSION SYSTEM

Initial roles:

```text
INDIVIDUAL
ORGANIZATION_ADMIN
ORGANIZATION_STAFF
BUSINESS_ADMIN
VOLUNTEER
CONTRIBUTOR
MODERATOR
ADMIN
SUPER_ADMIN
```

Example permissions:

```text
request:create
request:view
request:update
organization:create
organization:update
organization:view
organization:verify
business:create
business:update
business:verify
food:create
food:update
food:manage
event:create
event:update
event:publish
content:create
content:edit
content:submit
content:publish
contributor:apply
contributor:review
report:create
report:view
report:resolve
user:view
user:manage
user:suspend
audit:view
```

Do not create hundreds of unnecessary permissions, but keep the system extensible.

---

# 17. OBJECT-LEVEL AUTHORIZATION

This is mandatory.

Do not only check roles. Also check ownership and organizational relationships.

Examples:
- A user can only access their own private humanitarian requests.
- Organization members can only access data belonging to their organization according to their role.
- Organization A cannot access Organization B's private data.
- Contributors can only edit their own profiles unless authorized otherwise.
- Users cannot change their own roles through API payloads.
- Users cannot change verification status through API payloads.
- IDs must never bypass authorization.

Server-side authorization is authoritative.

---

# 18. API FOUNDATION

Create a consistent API architecture.

Use:
- versioned routes
- DTOs
- validation
- consistent response conventions
- consistent error conventions
- pagination
- filtering
- sorting
- authentication guards
- authorization guards

Use a predictable base such as `/api/v1/`.

Generate OpenAPI/Swagger documentation if appropriate.

---

# 19. VALIDATION AND ERROR MODEL

Validate all external input: body, query, params, IDs, dates, numbers, enums and file metadata.

Frontend validation is for UX; backend validation is authoritative.

Create consistent API errors with:
- machine-readable code
- human-readable message
- optional field errors
- request/correlation ID where useful

Never expose stack traces, SQL, internal paths or secrets in production responses.

---

# 20. SECURITY FOUNDATION

Build in:
- input validation
- authentication
- authorization
- rate limiting
- secure headers
- CORS configuration
- CSRF protection where applicable
- secure file-upload strategy
- MIME/type validation
- file-size limits
- audit logging
- sensitive-data protection
- environment validation
- error sanitization
- request IDs
- structured logging

Do not trust frontend role information.

---

# 21. FILE UPLOAD FOUNDATION

Prepare secure file handling:
- MIME validation
- extension validation
- file size limits
- safe filenames
- private storage by default
- access-controlled downloads
- signed URLs where appropriate

Verification documents must never become public merely because their URL is known.

---

# 22. SERVICE ABSTRACTIONS

Create clean interfaces for:

```text
StorageService
MapService
NotificationService
EmailService
SmsService
SearchService
AnalyticsService
```

Domain code should not directly depend on one vendor.

Example:

```text
OrganizationService
       |
StorageService
       |
Provider Adapter
```

---

# 23. DESIGN SYSTEM FOUNDATION

Visual direction:
- professional
- human
- calm
- trustworthy
- modern
- culturally respectful
- international

Suggested palette:
- deep navy
- warm ivory/off-white
- muted teal/green
- restrained warm gold

Do not make gold dominant.

Avoid excessive gradients, glassmorphism, giant pills, heavy shadows, overly decorative religious imagery and generic AI-dashboard styling.

---

# 24. TYPOGRAPHY AND RTL

Use a modern readable typeface system supporting English and Arabic.

Build RTL structurally from the beginning.

Use semantic typography tokens such as:
- display
- heading1
- heading2
- heading3
- body
- bodySmall
- label
- caption

Do not build English first and bolt RTL on later.

---

# 25. DESIGN TOKENS AND COMPONENTS

Centralize tokens for:
- colors
- spacing
- radius
- typography
- shadows/elevation
- animation durations
- breakpoints
- RTL direction

Create reusable components as needed:
- Button
- IconButton
- TextInput
- PasswordInput
- SearchInput
- Select
- Checkbox
- Radio
- Switch
- Card
- Badge
- StatusBadge
- Avatar
- Divider
- Modal
- BottomSheet
- Toast/Snackbar
- Tabs
- Navigation
- ListItem
- EmptyState
- LoadingState
- ErrorState
- Skeleton
- FormField

Do not create duplicate versions of the same component.

---

# 26. MOBILE APPLICATION SHELL

Create the Flutter application foundation with:
- startup
- splash/loading
- localization architecture
- authentication shell
- protected navigation
- bottom navigation
- theme
- error handling
- network abstraction
- API client abstraction
- state management architecture

Initial navigation can be:

```text
Home
Help
Community
Knowledge
Profile
```

Create foundation placeholders using the real design system, but do not fake future functionality.

---

# 27. WEB APPLICATION FOUNDATION

Create the React + TypeScript foundation for provider/admin experiences:
- routing
- authentication
- protected routes
- responsive shell
- sidebar
- header
- user menu
- error boundaries
- loading states

Support separate provider and admin access through permissions.

---

# 28. LOCALIZATION

Build localization infrastructure for:
- English
- Arabic

Architecture must later support:
- Urdu
- Persian

Do not hardcode user-facing strings inside business logic.

---

# 29. ACCESSIBILITY

Implement foundational accessibility:
- semantic labels
- keyboard navigation on web
- screen-reader labels
- sufficient contrast
- touch target size
- scalable text
- visible focus states
- understandable form errors

---

# 30. STATE MANAGEMENT

Choose one coherent state-management approach per application.

Separate:
- server state
- local UI state
- authentication state
- cached state

Avoid unnecessary global state.

---

# 31. API CLIENT

Create a centralized API client supporting:
- base URL
- authentication
- refresh handling
- error normalization
- retries where appropriate
- request IDs if used
- cancellation where appropriate

Do not duplicate network logic across screens.

---

# 32. DEVELOPMENT SEED DATA

Create clearly marked development-only seed data for:
- one normal user
- one organization
- one organization admin
- one moderator
- one admin
- one contributor
- one business

Do not use real people's information. Do not make seed users appear to be real religious authorities.

---

# 33. TESTING FOUNDATION

Set up:

### Unit tests
Permissions, role checks, validation, domain utilities.

### Integration tests
Database, authentication, authorization and API modules.

### Security tests
Unauthorized access, ID tampering, role escalation, cross-organization access.

### UI test foundation
Establish the framework needed for later critical-flow testing.

At minimum prove:
1. User cannot access another user's private data.
2. User cannot change their own role.
3. Organization A cannot access Organization B private data.
4. Unauthenticated users cannot access protected endpoints.
5. Normal users cannot access admin endpoints.
6. Moderators cannot perform super-admin actions.
7. Verification status cannot be changed by unauthorized users.
8. IDs cannot bypass authorization.
9. Sensitive fields are not returned to unauthorized roles.
10. Passwords are never returned in API responses.

---

# 34. LOGGING AND HEALTH

Use structured logs without logging passwords, tokens, private documents or unnecessary humanitarian content.

Include request IDs where appropriate.

Create health/readiness endpoints such as:

```text
/api/health
/api/ready
```

Do not expose sensitive infrastructure details.

---

# 35. DOCUMENTATION

Create/update:

```text
README.md
docs/architecture/README.md
docs/database/README.md
docs/api/README.md
docs/security/README.md
docs/development/README.md
docs/product/README.md
```

Document:
- what the product is
- how to run it
- architecture
- database
- authentication
- RBAC
- environment variables
- testing
- deployment assumptions
- known limitations

Document major architecture decisions, including why modular monolith, PostgreSQL, RBAC/object-level authorization, provider abstractions and localization-first architecture were chosen.

---

# 36. DEVELOPMENT COMMANDS

Create reliable scripts for:

```text
install
dev
build
test
lint
format
typecheck
db:migrate
db:seed
```

Use the selected package manager's conventions.

Do not create scripts that silently fail.

---

# 37. CODE QUALITY

Follow:
- strict typing where practical
- clear naming
- small modules
- single responsibility
- predictable errors
- typed interfaces
- reusable utilities
- minimal duplication

Avoid:
- giant files
- giant controllers
- business logic in controllers
- business logic in UI components
- copy-pasted API logic
- unexplained magic constants
- unnecessary abstractions

---

# 38. NO FAKE COMPLETION

Do NOT create fake production implementations such as alert-only success messages, hardcoded API responses, fake authentication, fake permissions, hardcoded admin access or hidden bypasses.

Development mocks are allowed only when clearly isolated from production behavior.

---

# 39. PRIVACY FOUNDATION

Classify data conceptually:

### Public
Published organization profiles, published events, public knowledge.

### Authenticated
Personal profile, notifications.

### Restricted
Humanitarian requests, organization internal operations, contributor review information.

### Highly sensitive
Verification documents and sensitive personal information.

Access must follow classification.

Humanitarian request data must never be casually logged, publicly exposed or returned to unrelated users.

---

# 40. FUTURE-PROOFING WITHOUT OVERBUILDING

The architecture should allow later phases to add:
- volunteer matching
- business participation
- campaigns
- donations
- payments
- consultations
- messaging
- advanced search
- intelligent matching
- analytics

But do not implement these now merely because they may exist later.

---

# 41. WHAT MUST REMAIN UNDECIDED

Do not invent final answers for:
- exact business/revenue model
- donation model
- payment fees
- religious authority structure
- exact specialist identities
- legal compliance claims
- launch geography
- exact humanitarian eligibility rules
- final contributor approval policy

Make these configurable where useful and document them as open product decisions.

---

# 42. AUTONOMOUS EXECUTION

Execute Phase 1 end-to-end.

Do not stop after creating architecture. Do not stop after creating database models. Do not stop after authentication.

When encountering an implementation problem:
1. Diagnose it.
2. Determine whether it is code, configuration, dependency or environment.
3. Fix it if under your control.
4. Re-run the relevant check.
5. Continue.

Only ask the product owner if the decision genuinely cannot be inferred.

---

# 43. QUALITY CONTROL LOOP

After implementation, perform:

```text
IMPLEMENT
   ↓
TYPECHECK
   ↓
LINT
   ↓
TEST
   ↓
MIGRATION CHECK
   ↓
BUILD
   ↓
INSPECT
   ↓
FIX
   ↓
RE-RUN
```

Do not report obvious deterministic failures without attempting to fix them.

---

# 44. CLEAN BUILD VALIDATION

Where the environment permits, verify from a clean state:

1. dependencies install
2. environment loads
3. database connects
4. migrations run
5. seed runs
6. backend starts
7. health endpoint works
8. authentication works
9. authorization works
10. web builds
11. mobile analysis/build succeeds
12. tests pass
13. lint passes
14. type checking passes

If an external service prevents full production validation, isolate the dependency and document it clearly.

---

# 45. SECURITY SELF-AUDIT

Search the codebase for:

```text
password
secret
token
apiKey
privateKey
console.log
debug
TODO
FIXME
bypass
disable-auth
mock
dummy
test-password
```

Review every occurrence. Remove insecure temporary code. Do not blindly remove legitimate documentation or configuration names.

---

# 46. FINAL PHASE 1 ACCEPTANCE CRITERIA

Phase 1 is complete only when all of the following exist:

## Architecture
- modular monolith
- clear domains
- clean separation of concerns

## Repository
- clean structure
- reproducible setup
- documented commands

## Backend
- NestJS foundation
- API conventions
- validation
- error handling
- health checks

## Database
- PostgreSQL
- migrations
- core entities
- indexes
- constraints
- seed data

## Authentication
- secure login foundation
- password handling
- session/token strategy
- protected routes

## Authorization
- roles
- permissions
- server-side checks
- object-level authorization

## Security
- rate limiting foundation
- input validation
- secure configuration
- secure file architecture
- audit foundation

## Mobile
- Flutter shell
- navigation
- theme
- localization architecture
- RTL architecture
- API abstraction

## Web
- React/TypeScript shell
- routing
- protected routes
- provider/admin separation

## Design
- design tokens
- components
- typography
- colors
- accessibility foundation

## Documentation
- README
- architecture
- database
- API
- security
- development

## Quality
- tests
- lint
- type checks
- builds
- clean migrations

---

# 47. EXPECTED FINAL REPORT

When Phase 1 is complete, return a concise but useful report containing:

1. Implementation summary
2. Final architecture
3. Database entities and migration status
4. Authentication implementation
5. RBAC and permission architecture
6. Security controls implemented
7. Design foundation
8. Tests executed and results
9. Build results
10. External dependencies still requiring configuration
11. Known limitations
12. Explanation of why the repository is ready for Phase 2

Do not claim something is complete if it is not.

---

# 48. FINAL INSTRUCTION

Build Phase 1 as if another senior engineering team will receive this repository tomorrow and immediately continue building Phase 2.

The code must be understandable.
The architecture must be intentional.
Security must be treated seriously.
The database must be coherent.
The application must be runnable.
The foundation must not require rewriting when humanitarian workflows are introduced.

Do not optimize for the appearance of progress.
Optimize for a strong foundation for the real Al-Husseiniya product.

Begin by inspecting the current repository/environment, then execute this specification end-to-end.
