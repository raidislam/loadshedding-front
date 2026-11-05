# Load Shedding & Power Management System (frontend)

A frontend-only academic project built with **Next.js 16 (App Router)**, **TypeScript**, **Tailwind CSS v4** and **shadcn/ui**.
It shows the full workflow of an electricity distribution company: infrastructure, scheduled load shedding,
customer outage reports, technician repairs and power restoration.

> All data is **demonstration data** stored in the browser (localStorage). There is no backend, database or real
> authentication. Nothing here is a live feed from an electricity authority.

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
npm run lint
npx tsc --noEmit
npm run build && npm start
```

## Demo accounts

Use the three **Demo Login** buttons on `/login`, or type the credentials:

| Role        | Email                        | Password      | Lands on      |
| ----------- | ---------------------------- | ------------- | ------------- |
| Admin       | `admin@powergrid.demo`       | `admin123`    | `/admin`      |
| Customer    | `customer@powergrid.demo`    | `customer123` | `/dashboard`  |
| Technician  | `technician@powergrid.demo`  | `tech123`     | `/technician` |

New customers can sign up at `/register`. Admins can add admin, customer and technician users.
**Admin → Settings → Reset demo data** restores the original sample data.

## The main workflow to try

1. **Customer** reports a power failure (`/dashboard/report-outage`). Status: `REPORTED`.
2. **Admin** reviews it under *Reports* and assigns a technician. An outage is created. Status: `ASSIGNED`.
3. **Technician** accepts the job, starts the repair, adds notes and evidence, and submits completion.
   Status: `IN_PROGRESS` then `REPAIR_COMPLETED`.
4. **Admin** confirms restoration. Status: `RESTORED`. Customers in the area are notified.

Admins can also schedule load shedding with the 5-step form at `/admin/outages/new`.

## How the code is organised

```
src/
  app/            routes: (public), (auth), admin, dashboard (customer), technician, payment
  components/
    ui/           shadcn/ui primitives
    shared/       reusable pieces: DataTable, Pagination, SearchFilterBar, StatusBadge, ConfirmDialog ...
    layout/       dashboard shell (sidebar + header), public navbar/footer, AuthProvider
    admin/ customer/ technician/ public/   feature components
  services/       mock "API": async functions with a short delay, reading/writing localStorage
  mock-data/      seed data (zones, substations, feeders, areas, outages, reports ...)
  types/          shared TypeScript types
  constants/      status labels/colours and role navigation
  hooks/          useUrlFilters (search/filter/page in the URL), useLoad (loading + error state)
  lib/            validation schemas (Zod), formatting, storage helpers
```

Key decisions:

- **Service layer**: pages call functions such as `getOutages()` or `assignTechnician()`. To connect a real backend later,
  only the bodies of the functions in `src/services/` need to change.
- **One place for status changes**: `applyOutageStatus()` in `services/outages.ts` updates the outage, the customer's
  report timeline, the technician's availability and the notifications together.
- **URL state**: search, filters and pages are kept in the query string, for example
  `/admin/outages?type=UNEXPECTED&status=ASSIGNED&page=1`.
- **Route protection**: each role's layout redirects other roles. This is a **demo only** and is not secure.
- **Cache Components** is enabled in `next.config.ts`, so pages that read the URL are wrapped in `<Suspense>`.
  Pages whose content comes from browser storage set `export const instant = false` to skip a dev-only check.

## Known limits

- Photos and evidence are not uploaded. Only the file names are kept.
- Passwords are stored in plain text in localStorage because this is a demo.
- `/payment/success` and `/payment/cancel` are labelled demonstration pages. There is no payment gateway.
