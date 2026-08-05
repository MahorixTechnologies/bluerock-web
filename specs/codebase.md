````markdown id="v8pk6m"
# BlueRock Web Codebase Cleanup & Component Organization Specification

## Overview

Refactor and reorganize the `bluerock-web` codebase to improve maintainability, scalability, consistency, and developer experience.

The objective is to establish a clean architecture that separates reusable UI components, feature-specific components, business logic, hooks, services, and utilities while preserving all existing functionality.

This refactor **must not introduce breaking changes**.

---

# Objective

The AI should:

- Clean the project structure
- Organize components into appropriate folders
- Remove duplicate code
- Improve naming consistency
- Simplify imports
- Improve code discoverability
- Preserve existing functionality

---

# Scope

Work only within:

```
bluerock-web/
```

Do not modify:

- `bluerock-backend`
- `bluerock-mobile`
- `bluerock-admin`
- `packages/shared`

unless required for shared imports.

---

# Recommended Folder Structure

```
src/

├── app/
│
├── components/
│   ├── ui/
│   ├── common/
│   ├── layout/
│   ├── feedback/
│   ├── navigation/
│   └── feature/
│
├── features/
│
├── hooks/
│
├── services/
│
├── api/
│
├── providers/
│
├── store/
│
├── lib/
│
├── utils/
│
├── constants/
│
├── types/
│
├── theme/
│
├── assets/
│
└── styles/
```

---

# Component Organization

## components/ui

Contains reusable design system components.

Examples:

```
Button

Input

Textarea

Select

Checkbox

Radio

Switch

Badge

Chip

Avatar

Icon

Divider

Card

Modal

Drawer

Popover

Tooltip

Dropdown

Tabs

Accordion

Table

Pagination

Spinner

Skeleton

EmptyState

ErrorState

LoadingOverlay

SearchInput

DatePicker
```

UI components must:

- Be reusable
- Be presentation-only
- Contain no feature-specific business logic

---

## components/common

Reusable application components.

Examples:

```
Header

PageHeader

Section

Breadcrumb

SearchBar

PropertyCard

RoomCard

BookingCard

PriceTag

Rating

LocationBadge

ImageGallery

StatCard

FilterBar
```

Used across multiple features.

---

## components/layout

Contains layout primitives.

Examples:

```
Container

Page

Section

Stack

Row

Column

Grid

Sidebar

Content

AuthLayout

DashboardLayout

PageLayout
```

---

## components/feedback

Examples:

```
Alert

Banner

Toast

Snackbar

Loading

ErrorView

RetryView

OfflineBanner
```

---

## components/navigation

Examples:

```
Navbar

Sidebar

Topbar

Breadcrumbs

BackButton

Pagination
```

---

## components/feature

Feature-level reusable components.

Example:

```
listing/

booking/

payments/

auth/

profile/
```

Components here should only be shared within their respective feature.

---

# Feature Organization

Each feature should encapsulate its own logic.

Example:

```
features/

listing/

    components/

    hooks/

    services/

    utils/

    types/
```

Feature-specific code should remain within the feature unless reused elsewhere.

---

# Page Components

Pages should only compose components and orchestrate data.

Avoid placing business logic directly inside page components.

Keep pages focused on:

- Data loading
- Routing
- Layout composition

---

# Hooks

Move reusable hooks into:

```
hooks/
```

Examples:

```
useAuth

useListings

useBooking

useModal

usePagination

useSearch

useFilters

useDebounce

useMediaQuery

useLocalStorage

useTheme
```

Hooks should:

- Be reusable
- Contain no JSX
- Follow React Hook conventions

---

# Services

Move business logic into:

```
services/
```

Examples:

```
ListingService

BookingService

PaymentService

AuthService

NotificationService
```

---

# API

Move API clients into:

```
api/
```

Examples:

```
client.ts

auth.ts

bookings.ts

listings.ts

payments.ts

users.ts
```

Avoid making HTTP requests directly inside components.

---

# Utilities

Move helper functions into:

```
utils/
```

Examples:

```
formatCurrency

formatDate

formatPrice

validators

calculateDistance

stringHelpers

numberHelpers
```

Utilities should be pure functions.

---

# Providers

Move providers into:

```
providers/
```

Examples:

```
ThemeProvider

QueryProvider

AuthProvider

ModalProvider

ToastProvider
```

---

# Theme

Organize theme configuration.

```
theme/

colors.ts

spacing.ts

typography.ts

radius.ts

shadows.ts

breakpoints.ts

index.ts
```

---

# Types

Move reusable application types into:

```
types/
```

Prefer importing shared domain types from:

```
packages/shared
```

Do not duplicate interfaces already defined in the shared package.

---

# Styling

Ensure styles are:

- Consistent
- Reusable
- Token-based
- Responsive

Avoid inline styles unless necessary.

Do not duplicate styling logic.

---

# Barrel Exports

Add `index.ts` files where appropriate.

Examples:

```
components/ui/index.ts

components/common/index.ts

hooks/index.ts

services/index.ts
```

Simplify imports across the application.

---

# Naming Conventions

Components

```
PascalCase
```

Examples

```
Button.tsx

PropertyCard.tsx

BookingCard.tsx
```

Hooks

```
camelCase
```

Examples

```
useModal.ts

useListings.ts
```

Utilities

```
camelCase
```

Examples

```
formatCurrency.ts

validateEmail.ts
```

---

# Cleanup

The AI should:

- Remove duplicate components
- Remove duplicate hooks
- Remove duplicate utilities
- Remove unused files
- Remove unused exports
- Remove unused imports
- Remove commented-out code
- Remove obsolete folders
- Consolidate repeated logic

---

# Imports

Use project aliases wherever possible.

Example:

```
@/components/ui

@/hooks

@/services

@/utils

@/features
```

Avoid deep relative imports.

Maintain a consistent import order throughout the project.

---

# Refactoring Rules

The AI must:

- Preserve existing functionality
- Reuse existing components where possible
- Avoid unnecessary rewrites
- Move files instead of recreating them
- Update imports after moving files
- Preserve public component APIs where practical

---

# Validation

After refactoring:

- The application builds successfully.
- No broken imports remain.
- Linting passes.
- TypeScript errors do not increase.
- Existing pages continue to function correctly.
- Duplicate logic has been reduced.

---

# Deliverables

The AI should provide:

1. Updated folder structure
2. List of moved files
3. Updated imports
4. Removed duplicate code
5. Deleted unused files (if any)
6. Summary of architectural improvements
7. Recommendations for future cleanup

---

# Acceptance Criteria

- Reusable UI components are separated from feature-specific components.
- Features encapsulate their own business logic and reusable pieces.
- Pages remain focused on composition and routing.
- Hooks, services, utilities, providers, and theme files are consistently organized.
- Shared domain types are imported from `packages/shared`.
- Imports are standardized using project aliases.
- The codebase is easier to navigate, maintain, and extend.
- No existing functionality is broken by the refactor.
````
