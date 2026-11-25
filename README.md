# Load Shedding & Power Management System (frontend)

The web app for an academic electricity-distribution project. It covers the network (zones → substations → feeders → areas),
scheduled load shedding, customer outage reports, technician repairs, monthly bills and online payment.

- **Frontend:** Next.js 16 (App Router), TypeScript, Tailwind CSS v4, shadcn/ui
- **Backend:** [loadsheeding-backend](https://loadsheeding-backend.vercel.app/), an Express + Prisma + PostgreSQL REST API (`/api/v1`)
- **Payments:** SSLCommerz **sandbox** (test mode, no real money)

All data comes from the backend database. The frontend has no mock data.

## Demo accounts

Use the one-click **Demo Login** buttons on `/login`, or type the credentials:

| Role       | Email                              | Password           | Lands on      |
| ---------- | ---------------------------------- | ------------------ | ------------- |
| Admin      | `demo.admin@loadshedding.com`      | `DemoAdmin@123`    | `/admin`      |
| Customer   | `demo.customer@loadshedding.com`   | `DemoCustomer@123` | `/dashboard`  |
| Technician | `demo.technician@loadshedding.com` | `DemoTech@123`     | `/technician` |

New customers can sign up at `/register`. Admins create technician accounts under **User Management**.

## Run it locally

```bash
npm install
cp .env.example .env.local   # then fill in the demo emails and passwords above
npm run dev                  # http://localhost:3000
```

Checks:

```bash
npm run lint
npx tsc --noEmit
npm run build && npm start
```

### Environment variables

| Name                                   | Used by        | Purpose                                                      |
| -------------------------------------- | -------------- | ------------------------------------------------------------ |
| `BACKEND_API_URL`                      | server only    | Backend base URL, e.g. `https://loadsheeding-backend.vercel.app/api/v1` |
| `NEXT_PUBLIC_DEMO_ADMIN_EMAIL` / `_PASSWORD`      | browser | Demo Login button for the admin      |
| `NEXT_PUBLIC_DEMO_CUSTOMER_EMAIL` / `_PASSWORD`   | browser | Demo Login button for the customer   |
| `NEXT_PUBLIC_DEMO_TECHNICIAN_EMAIL` / `_PASSWORD` | browser | Demo Login button for the technician |

The demo accounts must exist in the backend database. When the frontend is deployed, set the backend's
`FRONTEND_URL` to the frontend address so SSLCommerz sends the customer back to the right site.

## Workflows to try

**Outage report → repair**

1. **Customer** reports a power failure at *Report Outage*. Status: `PENDING`.
2. **Admin** opens *Customer Reports*, reviews it (`UNDER_REVIEW`) or rejects it, then assigns a technician (`ASSIGNED`).
3. **Technician** accepts the job and starts work (`IN_PROGRESS`), then submits a repair report.
4. The report becomes `RESOLVED`. The customer is notified at each step and can follow the progress timeline.

**Scheduled load shedding:** Admin → *Outage Management* → *Create outage* (a 5-step form). Customers in the area
are notified, and the outage appears on the public `/outage-status` page.

**Bill payment (SSLCommerz sandbox)**

1. **Admin** creates a monthly bill for a customer under *Bills*.
2. **Customer** opens *My Bills* and clicks *Pay now*. The browser goes to the SSLCommerz sandbox page.
3. Pay with one of the sandbox test methods shown on that page.
4. The backend validates the payment with SSLCommerz, marks the bill `PAID`, and redirects to `/payment/success`
   (or `/payment/cancel`). The result page shows the real payment record. *Payment History* lists every attempt.

## How it works

```
Browser ──> Next.js route handlers (/api/auth/*, /api/backend/*) ──> Backend API
              stores JWTs in httpOnly cookies, adds the Bearer token,
              refreshes the access token on a 401
```

- **Auth (BFF pattern):** `/api/auth/login|register|logout` set the httpOnly `ls_access` and `ls_refresh` cookies and a
  readable `ls_role` cookie. JavaScript never sees the tokens. The browser only calls this app, so no CORS is needed.
- **Protected routes:** `src/proxy.ts` (Next.js 16's name for middleware) sends visitors who are not logged in to `/login`,
  and sends users who open another role's section to their own dashboard. The backend still checks the JWT and the
  role on every request.
- **Role-based UI:** each role has its own sidebar menu (`constants/navigation.ts`) and section: `/admin`, `/dashboard`
  (customer) and `/technician`.
- **Data fetching:** TanStack Query (`hooks/useApi.ts`: `useList`, `useDetail`, `useOptions`). Mutations invalidate the
  related lists. Search, filters and the page number live in the URL (`hooks/useUrlFilters.ts`).
- **State:** Zustand (`store/authStore.ts`) holds the logged-in user.
- **Forms:** React Hook Form + Zod (`lib/validations.ts`). The rules match the backend's validation.
- **Server Components:** the public pages (home stats, `/outage-status`) fetch on the server, with `"use cache"` where
  the data can be a few minutes old. Dashboards are client components because they use the user's session.
- **Loading and errors:** each section has `loading.tsx` (skeletons) and `error.tsx` (error boundary). There is also
  `global-error.tsx` and `not-found.tsx`.
- **Time zone:** all dates are shown in Asia/Dhaka time.

## Folder structure

```
src/
  app/
    (public)/       home, about, services, contact, outage-status, payment/success|cancel
    (auth)/         login, register
    admin/          overview, network (zones, substations, feeders, areas), outages, reports,
                    repair jobs, bills, users, audit log, notifications, settings
    dashboard/      customer: overview, report outage, my reports, bills, payments, notifications, profile
    technician/     overview, assigned jobs, job details, history, notifications, profile
    api/            auth route handlers + /api/backend/[...path] forwarder
  components/
    ui/             shadcn/ui primitives
    shared/         DataTable, Pagination, SearchFilterBar, StatusBadge, FormDialog, ConfirmDialog, ...
    layout/         dashboard shell, sidebar, public navbar/footer, AuthProvider
    admin/ customer/ technician/ public/   feature components
  hooks/            useApi, useUrlFilters
  lib/              api client, validation schemas, formatting, server-only backend helpers
  store/            Zustand auth store
  constants/        status labels, navigation, notification icons
  types/api.ts      types that match the backend responses
  proxy.ts          route protection
```

## Known limits

- The contact form has no backend endpoint. It opens the visitor's email app with the message filled in.
- The contact details on the public pages are examples. This is not a real electricity authority.
