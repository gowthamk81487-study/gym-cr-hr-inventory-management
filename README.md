# Gym HR, Membership & Client Continuity System - Project Foundation (Stage 1)

This project represents the interactive MVP prototype for **Gym HR, Membership & Client Continuity Management System**, an enterprise SaaS product developed under the startup **Provolution Technologies**.

---

## 1. Project Overview & Scope
Stage 1 implements the complete **Project Foundation**. It configures the design system, compiles all reusable atomic and layout UI controls, and deploys the routing skeleton for both the Public Marketing website and the Secure Management Portal. 

All business modules (Dashboard, CRM, HR, Workouts, Diets, Inventory, Finance) serve as pre-routed **"Coming Soon"** placeholders displaying clear documentation and target REST API mapping contracts.

---

## 2. Technology Stack
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 (with `@theme` variables inside CSS)
- **Form Management**: React Hook Form
- **Form Validation**: Zod
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Visualization**: Recharts (Scaffolded)
- **Utilities**: `clsx`, `tailwind-merge`

---

## 3. Folder Structure
The codebase utilizes a strictly decoupled architecture, separating layouts from pages and mock logic from future API models:

```
src/
├── app/                      # App router route files
│   ├── layout.tsx            # Global layout with ToastContext
│   ├── globals.css           # Design tokens, color system, button styles
│   ├── (public)/             # Marketing page group (Home, About, Pricing, PT, etc.)
│   └── (portal)/             # Secure Management Portal group (Dashboard, CRM, HR, etc.)
├── layouts/                  # Reusable layout templates (Sidebar, TopNav, Container, Section, PageLayout, Footer)
├── components/               # Presentation component folders
│   ├── ui/                   # Reusable atomic controls (Button, Input, Badge, Avatar, Skeleton, Dropdown, Modal, SearchBar)
│   └── common/               # Compound widgets (Table, ComingSoon panel)
├── hooks/                    # Reusable custom hooks
├── types/                    # Domain TypeScript models (Client, Coach, Staff, Payment, etc.)
├── constants/                # Navigation paths and app settings
├── utils/                    # Shared helper functions (formatCurrency, cn classname merger)
├── services/                 # Async API services returning Promise stubs
├── mock/                     # Empty mock directories structure
├── config/                   # Global SaaS settings & feature flags
└── future-api/               # REST API client bridge contracts and JWT headers
```

---

## 4. Design System Tokens (`src/app/globals.css`)
Our premium dark-themed SaaS aesthetic is driven by custom theme variables:
- **Color System**: Space Dark (`#030712` background), Slate Neutrals (`#1e293b` borders), Blue (`#2563eb` primary actions), Emerald (`#10b981` success/status indicators), and Rose (`#f43f5e` errors/alerts).
- **Spacing Scale**: Governed by an 8px modular baseline units (`--spacing-unit: 8px`).
- **Typography**: Inter Sans font stack with relaxed line heights.
- **Glassmorphism**: `.glass-panel` utilizes `backdrop-filter: blur(12px)` and semi-transparent borders for glowing depth.

---

## 5. Reusable UI Components Checklist
All foundation components are fully type-safe, production-ready, and support modular parameters:
- **Button**: Supports 6 color variants, 3 sizes, loading loaders, disabled states, hover transitions, and active scale animations.
- **Input**: Integrates label tags, validation errors, and prefix/suffix Lucide icon anchors.
- **SearchBar**: Custom search box with search icons and quick clear `(X)` triggers.
- **Badge**: Status chips with muted fills and color borders.
- **Avatar**: Initials fallback handler on missing or broken image sources.
- **Modal & Dialog**: Framer Motion overlay blocks with click-outside hooks.
- **Table**: Fully paginated rows layout with column sorting hooks.
- **Dropdown**: Floating actions menu anchored to trigger buttons.
- **Toast**: Context notifications system exposing `useToast` hooks.
- **LoadingSpinner**: Animated SVG spinner.
- **Skeleton**: Shimmer loading block.
- **EmptyState**: Standardized database empty placeholder.
- **ErrorState**: Simulated connection error layout.

---

## 6. Future Backend Integration Plan
The frontend is pre-wired to transition to a backend API with minimal changes:
- **API Client Bridge (`src/future-api/apiClient.ts`)**: Exposes placeholder Axios wrappers that parse token payloads. To migrate, replace `localStorage` services inside `src/services/` with requests through `FutureApiClient`.
- **JWT Authentication & RBAC**: The settings panel includes simulated identity profiles (GM, Receptionist, Coach). These will be mapped to JWT header tokens in production.
- **Stripe Gateway**: Placeholders are mapped under `POST /api/v1/payments/stripe-intent` to authorize card entries.
- **AI Processing**: Target REST routes are prepared under `POST /api/v1/payments/verify-slip-ai` to verify payment slips via Gemini Vision.
- **Continuity Prediction**: Attendance averages and historical patterns are prepared for `GET /api/v1/reports/attendance` to feed model predictors.

---

## 7. Development & Deployment
To run the project locally or compile static bundles:

### Installation
```bash
npm install
```

### Start Development Server
```bash
npm run dev
```

### Compile Production Build
```bash
npm run build
```

### Start Production Server
```bash
npm run start
```
