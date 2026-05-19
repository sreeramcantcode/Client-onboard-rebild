# Rebild Client Portal — PRD

## Original Problem Statement
Build an all-in-one client onboarding portal for Rebild Marketing Agency. Two
separate surfaces: a **Client Portal** (login + dashboard + invoices + updates + reports + add-ons + support + profile) and an **Admin Panel** (create client credentials, issue invoices, post updates, manage services/add-ons, handle support tickets). Premium, "sexy", responsive across web + mobile. Brand: Rebild (orange #F77418 + obsidian black + white).

**Iteration 2 (2026-01-21):** Rebuilt the entire frontend on **Next.js 14 App Router + TypeScript + Tailwind** (no CRA, no Craco, no webpack overrides). Routes mounted under `/client-portal/*` for drop-in integration into an existing Next.js app. Backend completely untouched.

## Architecture
- **Backend** (unchanged): FastAPI + Motor (MongoDB) + bcrypt + PyJWT — single `server.py` exposing `/api/*` routes
- **Frontend** (rewritten): Next.js 14.2 + TypeScript + Tailwind 3.4 + lucide-react + axios + clsx/twMerge
- **Auth**: JWT (access 12h). Both httpOnly cookie (`secure=true samesite=none`) and Bearer token (localStorage `rebild_token`)
- **Routing**: All routes under `/client-portal/*`:
  - `/client-portal/login` — branded login
  - `/client-portal/admin/*` — admin panel (RoleGate: admin)
  - `/client-portal/client/*` — client portal (RoleGate: client)
  - `/` → redirects to `/client-portal/login`
- **Layout**: Dark obsidian "L-shape" sidebar+topbar wrapping a rounded white content area

## Folder Structure
```
/app/frontend/
├── package.json (Next.js 14, no CRA/Craco)
├── tsconfig.json
├── next.config.js
├── tailwind.config.ts
├── postcss.config.js
└── src/
    ├── app/
    │   ├── layout.tsx, page.tsx, globals.css
    │   └── client-portal/
    │       ├── layout.tsx (AuthProvider)
    │       ├── page.tsx (auto-route)
    │       ├── login/page.tsx
    │       ├── admin/
    │       │   ├── layout.tsx (RoleGate admin → AppShell)
    │       │   ├── page.tsx, clients/, services/, invoices/,
    │       │   │   updates/, addons/, tickets/, settings/
    │       └── client/
    │           ├── layout.tsx (RoleGate client → AppShell)
    │           ├── page.tsx, services/, addons/, invoices/,
    │           │   updates/, reports/, support/, profile/
    ├── components/
    │   ├── app-shell.tsx, role-gate.tsx,
    │   ├── primitives.tsx (PageHeader, StatCard, Pill, Modal, Input, etc.)
    │   └── rebild-logo.tsx
    └── lib/
        ├── api.ts, auth-context.tsx, utils.ts, constants.ts
```

## User Personas
1. **Agency Admin** — onboards clients, creates invoices, posts updates, manages services/add-ons/tickets.
2. **Client** — receives credentials from agency, views dashboard, services, invoices, updates/reports, requests add-ons, opens support tickets.

## Implemented (2026-01-21)
### Backend (unchanged from iteration 1)
- ✅ Auth: login / logout / me + Bearer + cookie + role guards
- ✅ Admin seed on startup + 5 default services + 4 default add-ons
- ✅ Clients CRUD with auto-generated password & reset-password
- ✅ Services CRUD, Add-ons CRUD + client request flow
- ✅ Invoices CRUD with line items + client mock-pay
- ✅ Updates broadcast/per-client + auto-notifications
- ✅ Support tickets (threaded, status changes)
- ✅ Notifications feed + mark-all-read
- ✅ Admin & client dashboard stats endpoints

### Frontend (Next.js rebuild — same UI/UX, same data-testids preserved)
- ✅ Branded login page (glassmorphism on radial gradient) at `/client-portal/login`
- ✅ AppShell with desktop sidebar + topbar + mobile hamburger drawer
- ✅ All 8 client pages + all 8 admin pages
- ✅ Role gates with auto-redirect for wrong role
- ✅ Notifications bell with unread badge + profile dropdown with logout
- ✅ Fully responsive (verified at 375x800)

### Testing (iteration 2)
- ✅ Backend: 22/22 pytest cases pass (no regressions)
- ✅ Frontend: 17/17 end-to-end flows pass on Next.js

## Backlog / Future Enhancements
### P1 — Revenue & engagement
- Stripe / Razorpay integration for real invoice payments (currently mock)
- Email notifications (SendGrid/Resend) for new invoice, ticket reply, posted update
- Welcome email with credentials on client creation

### P2 — Polish
- File uploads (contracts / brand assets)
- Calendar/meeting scheduler
- Performance charts on Reports (Recharts)
- Brute-force lockout on `/api/auth/login`
- CSRF protection on cookie-auth state-changing endpoints
- Suppress noisy 401 console errors from initial `/api/auth/me` ping when unauthenticated

### P3 — Nice-to-have
- Multi-admin / team roles
- White-label / multi-tenant per agency

## Test Credentials
Stored in `/app/memory/test_credentials.md`:
- Admin: `admin@rebild.com` / `Rebild@2026`
- Clients: created on-demand by admin (`generated_password` returned in response)
