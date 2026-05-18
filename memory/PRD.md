# Rebild Client Portal — PRD

## Original Problem Statement
Build an all-in-one client onboarding portal for Rebild Marketing Agency. Two
separate surfaces: a **Client Portal** (login + dashboard + invoices + updates + reports + add-ons + support + profile) and an **Admin Panel** (create client credentials, issue invoices, post updates, manage services/add-ons, handle support tickets). Premium, "sexy", responsive across web + mobile. Brand: Rebild (orange #F77418 + obsidian black + white).

## Architecture
- **Backend**: FastAPI + Motor (MongoDB) + bcrypt + PyJWT — single `server.py` exposing `/api/*` routes
- **Frontend**: React (CRA + craco) + Tailwind + shadcn primitives + lucide-react + react-router v7
- **Auth**: JWT (access 12h). Both httpOnly cookie (`secure=true samesite=none`) and Bearer token (localStorage `rebild_token`) supported.
- **Layout**: Dark obsidian "L-shape" sidebar+topbar wrapping a rounded white content area
- **Brand mark**: Custom typographic `<RebildLogo>` using Outfit Black

## User Personas
1. **Agency Admin** — runs Rebild, onboards clients, creates invoices, posts updates, manages services/add-ons/tickets.
2. **Client** — receives credentials from agency, views their dashboard, services, invoices, updates/reports, requests add-ons, opens support tickets.

## Core Requirements (static)
- Admin creates **all** client credentials (no public signup)
- Single `/login` entry point — auto-routes to `/admin` or `/client` based on role
- Sidebar nav per role + topbar with notifications + profile dropdown
- Responsive: mobile hamburger drawer
- Premium visual fidelity: brand colours, custom logo, glass login, "Control Room" stat grid, timeline updates

## Implemented (2026-01-20)
### Backend
- ✅ Auth: login / logout / me + Bearer + cookie + role guards (admin / client)
- ✅ Admin seed on startup (env-driven, idempotent, password sync)
- ✅ Default services (5) and add-ons (4) seeded on startup
- ✅ Clients CRUD (`/api/admin/clients/*`) with auto-generated password & reset-password endpoint
- ✅ Services CRUD (`/api/admin/services` + read at `/api/services`)
- ✅ Add-ons CRUD + client request flow (`/api/client/addons/request`)
- ✅ Invoices CRUD with line items, tax, totals, mark-paid + client mock-pay
- ✅ Updates posting (broadcast or per-client) + auto-notifications
- ✅ Support tickets (client create + thread, admin reply + status changes)
- ✅ Notifications (per-user feed + mark-all-read + per-item mark-read)
- ✅ Dashboard stats (`/api/admin/stats`, `/api/client/dashboard`)

### Frontend
- ✅ Login page — glassmorphism card on radial-gradient orange/black login_bg, Rebild brand panel
- ✅ AppShell with desktop sidebar + topbar (search hint, notifications bell, profile menu, logout)
- ✅ Mobile drawer + hamburger
- ✅ Client pages: Dashboard (hero action card + stats + services + updates feed + working hours + quick links), Services, Add-ons (request flow), Invoices (line-item modal w/ Rebild-branded invoice preview), Updates, Reports (filtered view), Support (chat threads), Profile
- ✅ Admin pages: Dashboard (control-room stats + recent activity), Clients (create modal + credentials reveal modal + edit + reset password + delete), Services, Invoices (multi-line creator with live total), Updates (broadcast / per-client), Add-ons (catalog + client request management), Tickets (threaded chat), Settings
- ✅ Data-testid on every interactive element

### Testing
- ✅ Backend: 22/22 pytest cases pass — auth, CRUD, role enforcement, password reset, broadcast updates, tickets
- ✅ Frontend: end-to-end browser tests pass for both admin + client flows, including mobile drawer

## Backlog / Future Enhancements
### P1 — Revenue & engagement
- Stripe / Razorpay integration for real invoice payments (currently mock)
- Email notifications (SendGrid) when invoice issued, ticket replied, update posted
- Client onboarding email with welcome credentials & quick-start tour

### P2 — Polish
- File uploads (project files / contracts / brand assets)
- Calendar / meeting scheduler integration
- Reports with charts (Recharts) — campaign performance per client
- Multi-admin / team roles
- Drag-and-drop kanban for client tasks
- Brute-force lockout on /api/auth/login (security hardening)
- Split `server.py` into `routers/*` modules for maintainability
- CSRF protection for state-changing endpoints (cookie auth)

### P3 — Nice-to-have
- Dark mode toggle for client portal (currently admin-shell-only is dark)
- Custom branded subdomain per agency (multi-tenant)
- White-label option

## Test Credentials
Stored in `/app/memory/test_credentials.md`
- Admin: `admin@rebild.com` / `Rebild@2026`
- Clients: created on-demand by admin (generated_password returned in response)
