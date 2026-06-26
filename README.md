# HireHub Backend Architecture & Design

Welcome to the backend architecture repository of **HireHub**. This design is tailored to perfectly support the HireHub premium React frontend pages and features.

---

## 1. Tech Stack Overview

- **Runtime**: Node.js
- **Framework**: Express.js (REST API framework)
- **Database**: PostgreSQL (Relational database for robust transactions, relations, and arrays support)
- **ORM**: Prisma (Type-safe query builder and migration tool)
- **Authentication**: JWT (JSON Web Tokens) with `bcrypt` password hashing
- **File Uploads**: `multer` middleware (for uploading CV/Resume PDFs)

---

## 2. Directory Structure & Documentation Files

We have created modular design specifications for each section of the backend. You can access the detailed markdown documents below:

1. **[DATABASE_SCHEMA.md](file:///d:/hirehub/hirehub-backend/DATABASE_SCHEMA.md)**: Details the PostgreSQL table definitions, relations, enums, index optimizations, and the Prisma ORM schema script.
2. **[AUTH_API.md](file:///d:/hirehub/hirehub-backend/AUTH_API.md)**: Specifications for candidate registration, login, session checking, and admin verification endpoints.
3. **[JOBS_API.md](file:///d:/hirehub/hirehub-backend/JOBS_API.md)**: Public routes for jobs querying, advanced search filter mapping, category counts, details retrieval, and bookmarking.
4. **[APPLICATIONS_API.md](file:///d:/hirehub/hirehub-backend/APPLICATIONS_API.md)**: Flow chart of candidate application submissions, resume upload guidelines, and candidates tracking their own submissions.
5. **[ADMIN_API.md](file:///d:/hirehub/hirehub-backend/ADMIN_API.md)**: Analytics endpoints for dashboard KPIs (total users, daily application flows, categories, recent feeds) and administrative operations (CRUD for jobs, status controls for applications).

---

## 3. Frontend Pages to Backend API Mapping

Here is how each frontend page routes and links to the backend endpoints:

| Frontend Route | Page Component | Main Backend API Operations | Docs Reference |
| :--- | :--- | :--- | :--- |
| `/` | `Home.tsx` | <ul><li>GET `/api/jobs/featured`</li><li>GET `/api/jobs/categories`</li><li>POST `/api/newsletter/subscribe`</li></ul> | [JOBS_API.md](file:///d:/hirehub/hirehub-backend/JOBS_API.md), [APPLICATIONS_API.md](file:///d:/hirehub/hirehub-backend/APPLICATIONS_API.md) |
| `/jobs` | `Jobs.tsx` | <ul><li>GET `/api/jobs` (search, page, sort, filter parameters)</li></ul> | [JOBS_API.md](file:///d:/hirehub/hirehub-backend/JOBS_API.md) |
| `/jobs/:id` | `JobDetail.tsx` | <ul><li>GET `/api/jobs/:id` (includes related roles)</li><li>POST `/api/jobs/:id/apply` (multipart upload)</li><li>POST/DELETE `/api/jobs/:id/bookmark`</li></ul> | [JOBS_API.md](file:///d:/hirehub/hirehub-backend/JOBS_API.md), [APPLICATIONS_API.md](file:///d:/hirehub/hirehub-backend/APPLICATIONS_API.md) |
| `/login` | `Login.tsx` | <ul><li>POST `/api/auth/login` (generates JWT)</li></ul> | [AUTH_API.md](file:///d:/hirehub/hirehub-backend/AUTH_API.md) |
| `/register` | `Register.tsx` | <ul><li>POST `/api/auth/register` (generates candidate user + empty profile)</li></ul> | [AUTH_API.md](file:///d:/hirehub/hirehub-backend/AUTH_API.md) |
| `/admin/login` | `AdminLogin.tsx` | <ul><li>POST `/api/admin/auth/login` (admin specific credentials)</li></ul> | [AUTH_API.md](file:///d:/hirehub/hirehub-backend/AUTH_API.md) |
| `/admin` | `Dashboard.tsx` | <ul><li>GET `/api/admin/dashboard/stats` (weekly trend, metrics, category distribution)</li></ul> | [ADMIN_API.md](file:///d:/hirehub/hirehub-backend/ADMIN_API.md) |
| `/admin/jobs` | `AdminJobs.tsx` | <ul><li>GET `/api/admin/jobs`</li><li>DELETE `/api/admin/jobs/:id`</li></ul> | [ADMIN_API.md](file:///d:/hirehub/hirehub-backend/ADMIN_API.md) |
| `/admin/jobs/new` | `NewJob.tsx` | <ul><li>POST `/api/admin/jobs` (create new active/draft post)</li></ul> | [ADMIN_API.md](file:///d:/hirehub/hirehub-backend/ADMIN_API.md) |
| `/admin/applications`| `Applications.tsx` | <ul><li>GET `/api/admin/applications`</li><li>PATCH `/api/admin/applications/:id/status` (dropdown update)</li></ul> | [ADMIN_API.md](file:///d:/hirehub/hirehub-backend/ADMIN_API.md) |

---

## 4. Setup Recommendation

To initialize this backend:
1. Initialize the Express project: `npm init -y` inside `hirehub-backend/`.
2. Install dependencies: `npm install express cors dotenv jsonwebtoken bcryptjs multer @prisma/client`.
3. Install devDependencies: `npm install -D typescript prisma @types/express @types/cors @types/jsonwebtoken @types/bcryptjs @types/multer @types/node tsx`.
4. Initialize Prisma: `npx prisma init`.
5. Copy the schema defined in `DATABASE_SCHEMA.md` into `prisma/schema.prisma`.
6. Run migrations: `npx prisma migrate dev --name init`.
