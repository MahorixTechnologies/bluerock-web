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
│   │   │       ├── verify/page.tsx   # 4-digit code
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
│   │       ├── HomePage.tsx
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
| `/` | `app/page.tsx` | HomePage — mobile-style discovery |
| `/search` | `app/search/page.tsx` | Search, filters, stacked listing cards |
| `/listing/[id]` | `app/listing/[id]/page.tsx` | Detail page with images, amenities, booking widget |
| `/bookings` | `app/bookings/page.tsx` | Renter booking history |
| `/login` | `app/login/page.tsx` | Login (same credentials as mobile) |
| `/register` | `app/register/page.tsx` | Role selection (Homeowner / Renter) |
| `/register/[role]` | `app/register/[role]/page.tsx` | Personal info form |
| `/register/[role]/verify` | `app/register/[role]/verify/page.tsx` | Email verification step |
| `/register/[role]/password` | `app/register/[role]/password/page.tsx` | Password + confirm + rules |
| `/register/[role]/success` | `app/register/[role]/success/page.tsx` | Success screen → redirect |

### Auth gating

- `/bookings` requires a signed-in session via `WebAuthProvider`. If no session exists it renders a signed-out hero with login CTA.
- `/register` routes are always reachable; role param must be one of `homeowner` or `renter` (case insensitive match).

---

## 4. Design System (source of truth)

The web is the design anchor for the whole BlueRock product. `bluerock-admin` is intentionally restyled to match these tokens. Stick with them everywhere.

### 4.1 Color tokens

| Token | Value | Usage |
|---|---|---|
| `--bg` | `#f5f7ff` | Page background (pale blue wash) |
| `--panel` | `#ffffff` | Auth card, content card, sidebar panels |
| `--panel-2` | `#eef2ff` | Hero/soft surfaces behind forms |
| `--primary` | `#1d4ed8` | Primary action buttons |
| `--primary-600` | `#1e40af` | Hover state |
| `--primary-soft` | `rgba(37,99,235,0.10)` | Pills, chip backgrounds, active nav |
| `--accent` | `#0b2466` | Headings, logo, strong text |
| `--text` | `#111827` | Body text |
| `--muted` | `#6b7280` | Secondary copy, placeholders, labels |
| `--border` | `rgba(17,24,39,0.10)` | Hairline card/input borders |
| `--success` | `#16a34a` · `soft: rgba(22,163,74,0.12)` | Success pills / validations |
| `--danger` | `#ef4444` · `soft: rgba(239,68,68,0.12)` | Errors, warnings |

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

- `HomePage.tsx`: hero + stat tiles + `ListingCard` grid
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
