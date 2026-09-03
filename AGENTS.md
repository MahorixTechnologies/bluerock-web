# BlueRock Web · AGENTS.md

> Living playbook for anyone — human or agent — working in `bluerock-web`.
> This is the public facing Next.js web application that mirrors the mobile app's user experience.

---

## 1. Stack & Versions (read this first)

| Area | Package / Version |
|---|---|
| Framework | **Next.js 16.2.10** (App Router) |
| React | **React 19.2.4** |
| Language | **TypeScript 5** (strict via `next/tsconfig`) |
| Compiler | **Babel React Compiler** enabled in `next.config.ts` |
| CSS | **Tailwind CSS v4** + PostCSS (`@tailwindcss/postcss`) |
| Linting | ESLint with `eslint-config-next 16.2.10` |

**Critical reminder:** Next.js has changed significantly in v16 — APIs, conventions, and file structure may differ from your training data. When adding `generateMetadata`, server actions, `not-found`, middleware, or new `app/` routes, open `node_modules/next/dist/docs/` if available and heed deprecation notices instead of assuming classic Next.js 13/14 APIs.

---

## 2. Project Structure

```
bluerock-web/
├── public/                        # static assets (next.svg, vercel.svg, etc.)
├── src/
│   ├── app/                       # App Router entry
│   │   ├── layout.tsx             # root layout, html/head, metadata, WebAuthProvider
│   │   ├── globals.css            # Tailwind @import + design-system tokens
│   │   ├── page.tsx               # HomePage wrapper
│   │   ├── favicon.ico
│   │   ├── bookings/
│   │   │   └── page.tsx           # Bookings page
│   │   ├── listing/[id]/
│   │   │   └── page.tsx           # Listing detail
│   │   ├── login/
│   │   │   └── page.tsx           # Login (uses LoginStep)
│   │   ├── register/
│   │   │   ├── page.tsx           # Register → role selection
│   │   │   └── [role]/
│   │   │       ├── page.tsx       # Personal info step
│   │   │       ├── verify/page.tsx   # 6-digit code
│   │   │       ├── password/page.tsx # Password + confirm + strength
│   │   │       └── success/page.tsx  # Created → redirect
│   │   └── search/
│   │       └── page.tsx           # Search + filters
│   ├── components/
│   │   ├── auth/                  # Auth shell, elements, step components
│   │   │   ├── AuthShell.tsx
│   │   │   ├── AuthElements.tsx   # Inputs, PasswordInput, buttons, badges
│   │   │   ├── icons.tsx
│   │   │   ├── data.ts            # role descriptions
│   │   │   └── steps/             # One file per auth step
│   │   └── web/                   # Product-facing (logged in) UI
│   │       ├── AppShell.tsx       # Sidebar + header layout
│   │       ├── WebAuthProvider.tsx  # Session + login/logout context
│   │       ├── ListingsHome.tsx
│   │       ├── SearchPage.tsx
│   │       ├── ListingCard.tsx
│   │       ├── ListingDetailClient.tsx
│   │       └── BookingsPage.tsx
│   └── lib/
│       ├── bookings.ts            # local bookings store + read/write
│       ├── mock-data.ts           # Seed listing data (mirrors mobile)
│       ├── models.ts              # Listing, Booking, User types
│       └── utils.ts               # Money/date/copy helpers
├── .gitignore
├── eslint.config.mjs
├── next.config.ts                 # reactCompiler: true
├── postcss.config.mjs
├── tsconfig.json
└── package.json
```

---

## 3. Routing

Next.js App Router file-based routing. All routes live under `src/app/*`.

### Route map

| Path | File | Description |
|---|---|---|
| `/` | `app/page.tsx` | Role-dispatched: LANDLORD→LandlordDashboard, RENTER/ADMIN/signed-out→ListingsHome (shared discovery screen) |
| `/search` | `app/search/page.tsx` | Search, filters, stacked listing cards |
| `/listing/[id]` | `app/listing/[id]/page.tsx` | Detail page with images, amenities, booking widget |
| `/bookings` | `app/bookings/page.tsx` | Renter booking history |
| `/host/listings` | `app/host/listings/page.tsx` | Landlord-only: host property list with occupancy/revenue + Become-a-Host prompt for renters |
| `/host/bookings` | `app/host/bookings/page.tsx` | Landlord-only: guest booking approval + messaging |
| `/host/payouts` | `app/host/payouts/page.tsx` | Landlord-only: disbursement history + payment methods |
| `/login` | `app/login/page.tsx` | Login (same credentials as mobile) |
| `/register` | `app/register/page.tsx` | Role selection (Homeowner / Renter) |
| `/register/[role]` | `app/register/[role]/page.tsx` | Personal info form |
| `/register/[role]/verify` | `app/register/[role]/verify/page.tsx` | 6-digit code |
| `/register/[role]/password` | `app/register/[role]/password/page.tsx` | Password + confirm + strength |
| `/register/[role]/success` | `app/register/[role]/success/page.tsx` | Created → redirect |

### Role routing

Role dispatch lives in `<DashboardRouter />` (`components/feature/home/DashboardRouter.tsx`) used by `/` plus every `/host/*` route. Rules:

- **LANDLORD signed in** → landlord routes render full host UI; `/` renders `LandlordDashboard` (revenue KPIs, listing rows, booking/payout summaries)
- **RENTER / ADMIN signed in** → `/host/*` routes render a soft "This section is for hosts only" CTA; `/` renders `ListingsHome` — just a curated-category chip row (`All listings` / `Featured` / `New this week`) and a listing grid, no dashboard chrome
- **Signed out** → `/host/*` shows same host CTA; `/` renders the same `ListingsHome` discovery screen as signed-in renters

The AppShell sidebar nav also switches per role:
- RENTER/PUBLIC: `Home, Search, Bookings`
- LANDLORD: `Dashboard (/) , My Listings (/host/listings), Guest Bookings (/host/bookings), Payouts (/host/payouts)`
- Sidebar section title reflects the active role ("Browse Menu" / "Renter Menu" / "Host Menu")

### Auth gating

- `/bookings` requires a signed-in session via `WebAuthProvider`. If no session exists it renders a signed-out hero with login CTA.
- `/host/*` routes are *not* hard-blocked on session; they render a gentle host-role upsell card for renters/signed-out visitors via DashboardRouter.

---

## 4. Design System (source of truth)

The web is the design anchor for the whole BlueRock product. `bluerock-admin` is intentionally restyled to match these tokens. Stick with them everywhere.

### 4.1 Color tokens

These are defined in `src/app/globals.css` under `:root` — that file is the source of truth; keep this table in sync with it.

| Token | Value | Usage |
|---|---|---|
| `--bg` | `#eef2f5` | Page background |
| `--panel` | `#ffffff` | Auth card, content card, sidebar panels |
| `--panel-soft` | `#f7f8fa` | Hero/soft surfaces behind forms, stat tiles |
| `--sidebar` | `#0A2A8C` | Sidebar background |
| `--sidebar-hover` | `#0F37A8` | Sidebar item hover |
| `--sidebar-active` | `#1442C4` | Sidebar item active state |
| `--primary` | `#1E5BFF` | Primary action buttons |
| `--primary-600` | `#1849D6` | Hover state |
| `--primary-soft` | `rgba(30,91,255,0.10)` | Pills, chip backgrounds, active nav |
| `--accent` | `#0b2466` | Headings, logo, strong text |
| `--text` | `#111827` | Body text |
| `--muted` | `#6b7280` | Secondary copy, placeholders, labels |
| `--muted-2` | `#9ca3af` | Tertiary copy, faint labels |
| `--border` | `rgba(17,24,39,0.08)` | Hairline card/input borders |
| `--border-strong` | `rgba(17,24,39,0.14)` | Emphasized borders |
| `--success` | `#16a34a` · `soft: rgba(22,163,74,0.12)` · `bg: #f0fdf4` | Success pills / validations — kept visually distinct from `--primary` |
| `--danger` | `#ef4444` · `soft: rgba(239,68,68,0.12)` · `bg: #fef2f2` | Errors, warnings |
| `--trend-up` / `--trend-down` | `#1E5BFF` / `#ec4899` | Stat-tile trend indicators |

Prefer referencing these as CSS variables (`var(--primary)`, `bg-[var(--muted)]`, etc.) instead of hardcoding the hex values above inside components — see section 8.

### 4.2 Typography

- Headings: `font-weight: 700–800`, color `--accent`, `font-family` via system stack in `globals.css`.
- Card radius: `16–24px`. Auth panels look best at `28px` radius.
- Inputs: `12–14px` radius, `44–52px` height, `1px solid var(--border)`.

### 4.3 Navigation: sidebar layout

`AppShell.tsx` composes each product screen with a **left sidebar** containing:
1. BlueRock brand header
2. Primary nav (`Home`, `Search`, `Bookings`, `Register`, `Login`)
3. Signed-in user card + logout, OR a signed-out login prompt
4. Footer meta

**Do not change the sidebar into a top nav; it is an intentional product design choice to match the visual weight of the mobile tab bar.**

---

## 5. Auth & Session

### 5.1 WebAuthProvider

Wraps the whole tree via `src/app/layout.tsx`. Provides:

```ts
type WebAuthState = {
  status: 'loading' | 'signedIn' | 'signedOut';
  user: WebUser | null;
  login:  (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (...) => Promise<void>;
};
```

### 5.2 Credentials parity with mobile

The **exact same fake users** that the mobile app recognizes also work in the web app. These are:

```
admin@bluerock.com    / admin123     (session is accepted, but no admin UI shown on web)
landlord@bluerock.com / landlord123  (LANDLORD role)
renter@bluerock.com   / renter123    (RENTER role)
```

Login flow order:
1. If `NEXT_PUBLIC_API_URL` is set, attempt `POST <url>/api/v1/auth/login` and require a real JWT.
2. Otherwise fall back to local demo mode that accepts the 3 credentials above and stores a session in localStorage.

### 5.3 Storage

A single session object is stored in `localStorage` under `bluerock.web.v1.session`. It is not encrypted on the web — do not write anything but role + email + name + a local timestamp into it.

---

## 6. Shared UI Patterns

### 6.1 Auth screens

All auth steps are composed via:
- `AuthShell.tsx` - the tall soft panel, logo area, footer login helper, copyright
- `AuthElements.tsx` - `Input`, `PasswordInput`, `PrimaryButton`, `SecondaryButton`, `Badge`
- One file per step in `components/auth/steps/*`

Do **not** duplicate auth styling elsewhere. If a new auth screen is needed (e.g. forgot password), add a new step file and reuse `AuthShell` + `AuthElements`.

### 6.2 Product screens

- `ListingsHome.tsx`: curated-category chips (`All listings` / `Featured` / `New this week`) + `ListingCard` grid, shared by signed-in renters and signed-out visitors
- `SearchPage.tsx`: sidebar filters + results list
- `ListingDetailClient.tsx`: images + host + amenities + booking summary
- `BookingsPage.tsx`: hero summary + highlighted latest reservation + stacked booking cards

### 6.3 Listing / Booking data

- `lib/mock-data.ts` is the canonical listing fixture file. Keep it in visual parity with the mobile mock list (names: Aurora Retreat, Palmview Estate, The Courtyard Villa, etc.).
- `lib/bookings.ts` is the web-only optimistic booking store. Bookings created from ListingDetail flow through here and read back on `/bookings`.

---

## 7. Running & Verifying

```bash
cd bluerock-web

# install
npm install

# wire backend (optional — without it, demo mode still works)
export NEXT_PUBLIC_API_URL=http://localhost:3000

# dev server (localhost:3000 by default, or next available)
npm run dev

# typecheck + build
npm run build

# lint
npm run lint
```

Verification checklist after any significant change:
1. `npm run build` must pass.
2. Smoke tests:
   - load `/` (home)
   - open `/login` → sign in with `renter@bluerock.com / renter123`
   - go to `/bookings` → verify bookings render
   - open `/listing/<some-id>` → verify booking widget behaves

---

## 8. Things You Will NOT Do

- Do **not** create a Pages Router `pages/` directory. Use App Router only.
- Do **not** install `next/font` at this time — use the system font stack in `globals.css`.
- Do **not** hardcode raw hex colors inside component files — use the CSS variables in `globals.css` or extend Tailwind tokens.
- Do **not** bypass `PasswordInput`/`Input` from `AuthElements.tsx` for any auth UI in the web app.
- Do **not** invent new credentials for demo mode. If the backend is missing, accept the 3 known ones or reject everything else.
- Do **not** use raw `<img>` elements for listing cards and booking cards; prefer `next/image` to clear the Next.js `next-image` lint rule, or add the ignore if it is a remote image and `next/image` cannot reach the host.
- Do **not** add code comments inline unless explicitly asked. Keep the component names and prop names self-documenting.

---

## 9. Environment

```
NEXT_PUBLIC_API_URL=http://localhost:3000
```

If `NEXT_PUBLIC_API_URL` is missing, the app still works in demo mode. This is intentional to keep the UI usable during backend outages.
