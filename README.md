# Employee Management System (EMS)

A full-stack employee management platform built with the MERN stack and React Router framework mode. Features role-based access control, AI-powered insights, and real-time notifications.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, React Router 8 (framework mode), TanStack Query, Tailwind CSS 4, Shadcn UI |
| **Backend** | Express 5, MongoDB (Mongoose 9), JWT auth, Inngest (background jobs) |
| **Email** | Resend |
| **Runtime** | Bun |
| **Deploy** | Vercel |

## Quickstart

### Prerequisites

- [Bun](https://bun.sh) v1.x
- MongoDB instance (local or Atlas)
- Vercel account (for deployment)

### Setup

```bash
# Clone and install
git clone <repo-url>
cd ems
bun install

# Backend setup
cd backend
cp .env.example .env   # fill in your values (see Environment Variables)
bun run seed            # optional: populate demo data
cd ..

# Frontend setup
cd frontend
cp .env.example .env   # fill in your values
cd ..
```

### Development

```bash
# Backend (port 5000)
cd backend && bun run dev

# Inngest local background worker (required for AI generation; separate terminal)
cd backend && bun run inngest:dev

# Frontend (port 5173)
cd frontend && bun run dev
```

AI insights and AI-generated performance reviews require a `GEMINI_API_KEY` in
`backend/.env`. For local development, set `INNGEST_DEV=1` and keep the Inngest
dev server running alongside the backend. In production, configure
`INNGEST_EVENT_KEY` and register the `/api/inngest` endpoint with Inngest.

### Production Build

```bash
cd backend && bun run build   # TypeScript compile
cd frontend && bun run build  # React Router build
```

### Typecheck

```bash
cd backend && bun run typecheck
cd frontend && bun run typecheck
```

## Environment Variables

### Backend

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Server port | `5000` |
| `MONGO_URI` | MongoDB connection string | `mongodb://localhost:27017/ems` |
| `JWT_SECRET` | Secret for signing JWT tokens | `your-super-secret-key` |
| `JWT_EXPIRES_IN` | Token expiry | `7d` |
| `CORS_ORIGIN` | Allowed frontend origin | `http://localhost:5173` |
| `RESEND_API_KEY` | Resend API key for email | `re_xxx` |
| `GEMINI_API_KEY` | Google Gemini API key for AI insights and reviews | `your-gemini-api-key` |
| `INNGEST_DEV` | Use the local Inngest dev server (`1` for local development) | `1` |
| `INNGEST_EVENT_KEY` | Inngest event key for production background jobs | `your-event-key` |
| `NODE_ENV` | `development` or `production` | `production` |

### Frontend

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `http://localhost:5000/api` |

## Project Structure

```
ems/
├── backend/                        # Express REST API
│   ├── src/
│   │   ├── server.ts               # Express app entry + route mounting
│   │   ├── db/                     # Mongoose connection
│   │   ├── models/                 # Mongoose schemas
│   │   │   ├── User.ts
│   │   │   ├── Department.ts
│   │   │   ├── Leave.ts
│   │   │   ├── Attendance.ts
│   │   │   ├── Task.ts
│   │   │   ├── Announcement.ts
│   │   │   ├── PerformanceReview.ts
│   │   │   ├── Feedback.ts
│   │   │   ├── AiInsight.ts
│   │   │   └── ActivityLog.ts
│   │   ├── controllers/            # Business logic per resource
│   │   ├── routes/                 # Express routers (auth + role gated)
│   │   ├── middlewares/            # requireAuth, requireRole, rateLimit
│   │   ├── lib/                    # Utilities (jwt, permissions, leavePolicies, activityLog)
│   │   └── inngest/                # Background AI functions
│   └── api/
│       └── index.ts                # Vercel serverless entry point
│
└── frontend/                       # React Router 8 app
    └── app/
        ├── routes/                 # Page components (framework-mode loaders)
        │   ├── dashboard.tsx
        │   ├── attendance.tsx
        │   ├── leaves.tsx
        │   ├── tasks.tsx
        │   ├── announcements.tsx
        │   ├── performance-reviews.tsx
        │   ├── feedback.tsx
        │   ├── ai-insights.tsx
        │   ├── profile.tsx
        │   └── admin/             # Admin-only pages
        ├── components/
        │   ├── ui/                 # Shadcn components
        │   ├── globals/            # Reusable layout components
        │   └── auth/               # Login, RequireAuth
        ├── hooks/                  # TanStack Query hooks
        ├── lib/
        │   └── api.ts              # Axios client (withCredentials)
        └── types.ts                # Shared TypeScript interfaces
```

## Features

### Authentication & Authorization

- JWT-based authentication with httpOnly cookies
- Role-based access control: **admin**, **head**, **employee**
- Permission-gated routes via middleware (`requireAuth`, `requireRole`)

### Employee Management

- Full employee profiles (personal info, contact, employment details)
- Department assignment and management
- User CRUD with role-based permissions

### Attendance

- Clock in / clock out tracking
- Daily attendance records with status (present, late, absent, half-day, on leave)
- Attendance overview per month

### Leave Management

- Apply for leave with type, date range, and reason
- Leave balance tracking per type (sick, vacation, personal, etc.)
- Admin/head approval workflow
- Configurable leave policies per department

### Tasks

- Create, assign, and track tasks
- Status updates (todo, in-progress, review, done)
- Priority levels (low, medium, high, urgent)

### Performance Reviews

- Admin-initiated performance reviews for employees
- Rating system with written feedback

### Feedback

- Employee feedback submission

### Announcements

- Admin-created announcements visible to all employees

### AI Insights

- AI-powered analytics for workforce management
- Admin dashboard with generated insights

### Activity Logging

- Full audit trail of user actions across the system

### Dashboard

- **Admin/Head**: department stats, leave overview, task metrics, attendance overview
- **Employee**: personal attendance rate, leave balance, active tasks, completed tasks

### Notifications

- Real-time notification system for users

## API Routes

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/api/auth/login` | Login | Public |
| `POST` | `/api/auth/logout` | Logout | Public |
| `GET` | `/api/auth/me` | Current user | Auth |
| CRUD | `/api/users` | User management | Admin |
| CRUD | `/api/departments` | Department management | Admin |
| CRUD | `/api/leaves` | Leave applications | Auth |
| CRUD | `/api/attendance` | Attendance records | Auth |
| CRUD | `/api/tasks` | Task management | Auth |
| CRUD | `/api/announcements` | Announcements | Admin |
| CRUD | `/api/performance-reviews` | Performance reviews | Admin/Head |
| CRUD | `/api/feedback` | Feedback | Auth |
| CRUD | `/api/ai-insights` | AI insights | Admin |
| `GET` | `/api/dashboard/analytics` | Admin/head dashboard | Admin/Head |
| `GET` | `/api/dashboard/my` | Employee dashboard | Auth |
| CRUD | `/api/notifications` | Notifications | Auth |
| `GET` | `/api/reports` | Reports | Admin/Head |
| `GET` | `/api/activity-logs` | Activity log | Admin |

## Roles & Permissions

| Feature | Employee | Head | Admin |
|---------|----------|------|-------|
| View own profile | ✅ | ✅ | ✅ |
| View all profiles | ❌ | ❌ | ✅ |
| Clock in/out | ✅ | ✅ | ✅ |
| View own attendance | ✅ | ✅ | ✅ |
| View all attendance | ❌ | ✅ | ✅ |
| Apply for leave | ✅ | ✅ | ✅ |
| Approve leaves | ❌ | ✅ | ✅ |
| Manage leave policies | ❌ | ❌ | ✅ |
| Create/update tasks | ✅ | ✅ | ✅ |
| View department dashboard | ❌ | ✅ | ✅ |
| Manage departments | ❌ | ❌ | ✅ |
| Manage users | ❌ | ❌ | ✅ |
| Create announcements | ❌ | ❌ | ✅ |
| AI insights | ❌ | ❌ | ✅ |
| Activity log | ❌ | ❌ | ✅ |

## Deployment

Deploy this monorepo as **two Vercel projects** connected to the same Git
repository. The backend uses `backend/vercel.json`; the frontend uses the
official React Router Vercel preset.

### 1. Prepare external services

- Create a MongoDB Atlas database and a database user with access only to the
  EMS database. Allow Vercel to reach the cluster in Atlas Network Access.
- Create a Gemini API key in Google AI Studio if AI insights and AI reviews are
  required.
- Create an Inngest Cloud app. The backend's `/api/inngest` endpoint hosts the
  registered background functions.
- Use a custom domain with both frontend and API on the same site, for example
  `ems.example.com` and `api.example.com`. This avoids browsers treating the
  cross-origin authentication cookie as a third-party cookie.

### 2. Deploy the backend

In Vercel, import the repository as a project and set **Root Directory** to
`backend`. Keep the included Vercel configuration and use the Node.js runtime
version `22.22.0` or newer. Set these environment variables for Production
(and Preview if you deploy previews):

| Variable | Value |
|----------|-------|
| `MONGO_URI` | MongoDB Atlas connection string for the EMS database |
| `JWT_SECRET` | New, long, random secret |
| `COOKIE_SECRET` | A different, new, long, random secret |
| `CORS_ORIGIN` | Exact frontend origin, e.g. `https://ems.example.com` |
| `NODE_ENV` | `production` |
| `GEMINI_API_KEY` | A rotated Gemini API key (AI features) |
| `INNGEST_EVENT_KEY` | Event key from the Inngest Cloud app |
| `INNGEST_SIGNING_KEY` | Signing key from the Inngest Cloud app |

`JWT_EXPIRES_IN` is optional and defaults to `7d`. Email delivery is optional;
configure `RESEND_API_KEY`, `FROM_EMAIL`, and `APP_URL` if you want email
notifications.
Do not set `INNGEST_DEV=1` in Vercel; it is only for local development.

### 3. Deploy the frontend

Create a second Vercel project from the same repository and set **Root
Directory** to `frontend`. Vercel detects React Router and uses the preset.
Set this build-time environment variable to the backend's public API origin:

```text
VITE_API_URL=https://api.example.com/api
```

Add the frontend's exact deployed origin to the backend's `CORS_ORIGIN`.
Because login uses httpOnly cookies, use HTTPS for both domains. Keep the
frontend and API on the same registrable domain so their secure cookies work
reliably in browsers.

### 4. Register and verify background jobs

In Inngest Cloud, register/sync the app using
`https://api.example.com/api/inngest`. Confirm both `generate-insight` and
`generate-review` functions appear in the Inngest dashboard before testing AI.

### 5. Create the first administrator and verify

Create an initial admin account using the production database and a strong,
unique password. The idempotent seed script reads `ADMIN_NAME`,
`ADMIN_EMAIL`, `ADMIN_PASSWORD`, and `MONGO_URI` from `backend/.env`; keep that
file local and never commit it.

After deployment:

1. Open `https://api.example.com/` and confirm the API health message.
2. Sign in at the frontend domain and verify authenticated pages load.
3. Trigger an AI insight and confirm the Inngest run completes.
4. Check CORS, function, MongoDB, and Inngest logs if any step fails.

**Secret hygiene:** `.env` files are ignored and must never be committed. Any
API key or password previously pasted into chat should be revoked/changed
before production deployment. Set production secrets in Vercel's Environment
Variables settings; do not put them in frontend variables (except the public
API URL).

## License

Private — All rights reserved.
