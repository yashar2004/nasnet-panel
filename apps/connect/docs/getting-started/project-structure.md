---
sidebar_position: 3
title: Project Structure
---

# Project Structure

## Monorepo Layout

NasNetConnect is a **Nx monorepo**. The `apps/connect` frontend is one application within a larger
workspace:

```
NasNet/
├── apps/
│   ├── connect/              # Main React frontend (this app)
│   ├── backend/              # Go backend (GraphQL API, router proxy)
│   ├── star-setup-web/       # Onboarding setup wizard (web)
│   └── star-setup-docker/    # Onboarding setup wizard (container)
│
├── schema/                   # GraphQL schema (single source of truth)
│   ├── scalars.graphql
│   ├── auth.graphql
│   ├── core/                 # Router types, interfaces (20 files)
│   ├── network/              # VLANs, IP, routing, bridges (14 files)
│   ├── firewall/             # Address lists, NAT, port knocking (10 files)
│   ├── services/             # Feature marketplace (27 files)
│   ├── alerts/               # Alert rules, notifications (24 files)
│   └── ...
│
├── libs/
│   ├── api-client/           # Apollo Client + generated GraphQL hooks
│   ├── core/                 # Shared types, utils, constants, i18n
│   ├── data/                 # ent ORM (Go, backend only)
│   ├── features/             # Feature modules (dashboard, firewall, etc.)
│   ├── state/stores/         # Zustand stores
│   └── ui/                   # Component libraries (primitives, patterns, layouts)
│
├── tools/                    # Nx generators and code tools
├── package.json              # Root workspace package
├── nx.json                   # Nx configuration
└── codegen.ts                # GraphQL codegen config
```

---

## `apps/connect/` Structure

```
apps/connect/
├── src/
│   ├── main.tsx              # App entry point — router + i18n setup
│   ├── routeTree.gen.ts      # Auto-generated route tree (DO NOT EDIT)
│   ├── styles.css            # Global styles + Tailwind CSS entry
│   │
│   ├── app/                  # App-level logic and UI
│   │   ├── components/       # App shell components
│   │   │   ├── AppHeader.tsx     # Top navigation header
│   │   │   └── AppSidebar.tsx    # Collapsible sidebar navigation
│   │   ├── hooks/            # App-level custom hooks
│   │   │   ├── useConnectionHeartbeat.ts  # Backend connection monitoring
│   │   │   ├── useConnectionToast.tsx     # Toast on connect/disconnect
│   │   │   └── useDefaultCommands.ts      # Command palette registrations
│   │   ├── pages/            # Page components (organized by domain)
│   │   │   ├── dashboard/
│   │   │   ├── network/
│   │   │   ├── vpn/
│   │   │   └── wifi/
│   │   ├── providers/        # Root context providers
│   │   │   ├── index.tsx         # Providers wrapper (see below)
│   │   │   └── ThemeProvider.tsx # Dark/light mode theme
│   │   └── routes/           # Legacy route components (being migrated)
│   │       └── router-panel/ # Per-router panel tabs
│   │
│   ├── components/           # App-specific shared components
│   │   └── skeletons/        # Loading skeleton components
│   │
│   ├── lib/                  # App-level utilities
│   │   ├── config.ts         # Runtime config helpers
│   │   ├── utils.ts          # Re-exports cn() utility
│   │   └── verify-imports.ts # Import alias verification
│   │
│   ├── mocks/                # Mock Service Worker (MSW) setup
│   │   ├── browser.ts        # Browser worker for dev
│   │   ├── server.ts         # Node server for tests
│   │   └── handlers/
│   │       ├── graphql.ts    # GraphQL operation mocks
│   │       └── rest.ts       # REST endpoint mocks
│   │
│   ├── routes/               # TanStack Router file-based routes
│   │   ├── __root.tsx        # Root layout (providers, shell, error boundary)
│   │   ├── index.tsx         # "/" — Home/redirect
│   │   ├── home.tsx          # "/home" — Home page
│   │   ├── dashboard.tsx     # "/dashboard" — Dashboard layout
│   │   ├── dashboard.dns-lookup.tsx    # "/dashboard/dns-lookup"
│   │   ├── dashboard.network.tsx       # "/dashboard/network"
│   │   ├── dashboard.routes.tsx        # "/dashboard/routes"
│   │   ├── dashboard.troubleshoot.tsx  # "/dashboard/troubleshoot"
│   │   ├── network.tsx       # "/network" — Network layout
│   │   ├── routers.tsx       # "/routers" — Router list
│   │   ├── settings.tsx      # "/settings" — Settings layout
│   │   ├── wifi.tsx          # "/wifi" — Wi-Fi overview
│   │   │
│   │   ├── network/          # Network sub-routes
│   │   │   └── dhcp/
│   │   │       ├── index.tsx         # DHCP servers list
│   │   │       ├── leases.tsx        # DHCP leases
│   │   │       ├── new.tsx           # New DHCP server
│   │   │       └── $serverId.tsx     # DHCP server detail
│   │   │
│   │   ├── router/$id/       # Per-router management (dynamic segment)
│   │   │   ├── route.tsx     # Router panel layout wrapper
│   │   │   ├── index.tsx     # Router overview
│   │   │   ├── dhcp.tsx      # DHCP tab
│   │   │   ├── dns.tsx       # DNS tab
│   │   │   ├── logs.tsx      # Logs tab
│   │   │   ├── network.tsx   # Network tab
│   │   │   ├── plugins.tsx   # Plugins/marketplace tab
│   │   │   ├── routing.tsx   # Routing tab
│   │   │   ├── vlans.tsx     # VLAN management tab
│   │   │   ├── firewall.tsx  # Firewall layout
│   │   │   ├── firewall/     # Firewall sub-tabs
│   │   │   │   ├── address-lists.tsx
│   │   │   │   ├── connections.tsx
│   │   │   │   ├── logs.tsx
│   │   │   │   ├── mangle.tsx
│   │   │   │   ├── port-knocking.tsx
│   │   │   │   ├── rate-limiting.tsx
│   │   │   │   ├── raw.tsx
│   │   │   │   ├── service-ports.tsx
│   │   │   │   └── templates.tsx
│   │   │   ├── vpn/          # VPN sub-routes
│   │   │   │   ├── index.tsx
│   │   │   │   ├── clients.tsx
│   │   │   │   └── servers.tsx
│   │   │   ├── services/     # Services/marketplace sub-routes
│   │   │   │   ├── index.tsx
│   │   │   │   ├── templates.tsx
│   │   │   │   └── $instanceId.tsx
│   │   │   └── wifi/         # Wi-Fi sub-routes
│   │   │       ├── index.tsx
│   │   │       └── $interfaceName.tsx
│   │   │
│   │   └── settings/         # Settings sub-routes
│   │       └── notifications/
│   │           ├── index.tsx
│   │           └── webhooks.tsx
│   │
│   └── test/                 # Test infrastructure
│       ├── setup.ts          # Vitest global setup (RTL, MSW)
│       ├── index.ts          # Test utilities export
│       └── chr/
│           └── chr-utils.ts  # CHR (Cloud Hosted Router) test utilities
│
├── public/                   # Static assets (served as-is)
│   └── locales/              # i18n translation JSON files
│       ├── en/               # English translations
│       └── fa/               # Persian/Farsi translations
│
├── docs/                     # This documentation
├── vite.config.ts            # Vite + path aliases configuration
├── tsconfig.app.json         # TypeScript config for app code
├── tsconfig.json             # Root TypeScript config
├── vitest.config.ts          # Vitest test runner configuration
├── tsr.config.json           # TanStack Router config
├── tailwind.config.js        # Tailwind CSS configuration
├── postcss.config.js         # PostCSS configuration
└── components.json           # shadcn/ui components config
```

---

## Library Dependencies

### Strict Dependency Rules

The monorepo enforces a one-way dependency hierarchy. **Higher layers may import from lower layers
but not vice versa:**

```
apps/connect
    ↓ (can import from)
libs/features/*
    ↓
libs/ui/*  +  libs/state/stores  +  libs/api-client/*
    ↓
libs/core/*
    ↓
(nothing — pure utilities only)
```

**Key rule:** Feature libraries (`libs/features/*`) **cannot** import from other feature libraries.
Cross-feature communication goes through shared libs or the app layer.

### Library Quick Reference

| Library                   | Import Path                             | Contents                                            |
| ------------------------- | --------------------------------------- | --------------------------------------------------- |
| UI Primitives             | `@nasnet/ui/primitives`                 | shadcn/ui + Radix components (~40)                  |
| UI Patterns               | `@nasnet/ui/patterns`                   | Composite components with platform presenters (~56) |
| UI Layouts                | `@nasnet/ui/layouts`                    | Page shells, responsive layout wrappers             |
| UI Utils                  | `@nasnet/ui/utils`                      | `cn()` utility, class merging                       |
| Design Tokens             | `@nasnet/ui/tokens`                     | Animation tokens (TypeScript)                       |
| Token CSS                 | `@nasnet/ui/tokens/variables.css`       | CSS custom properties (compiled from tokens.json)   |
| Core Types                | `@nasnet/core/types`                    | Shared TypeScript interfaces                        |
| Core Utils                | `@nasnet/core/utils`                    | Pure utility functions                              |
| Core Constants            | `@nasnet/core/constants`                | App constants, well-known ports, routes             |
| Core Forms                | `@nasnet/core/forms`                    | Form utilities, validation helpers                  |
| API Client Core           | `@nasnet/api-client/core`               | Apollo Client setup, links, cache config            |
| API Client Queries        | `@nasnet/api-client/queries`            | Domain-specific GraphQL hooks                       |
| API Client Generated      | `@nasnet/api-client/generated`          | Auto-generated types, hooks, Zod schemas            |
| State Stores              | `@nasnet/state/stores`                  | Zustand stores (UI, sidebar, notifications)         |
| Feature: Dashboard        | `@nasnet/features/dashboard`            | Dashboard feature module                            |
| Feature: Firewall         | `@nasnet/features/firewall`             | Firewall feature module                             |
| Feature: Wireless         | `@nasnet/features/wireless`             | Wi-Fi feature module                                |
| Feature: Network          | `@nasnet/features/network`              | Network feature module                              |
| Feature: Alerts           | `@nasnet/features/alerts`               | Alerts and notification components                  |
| Feature: Logs             | `@nasnet/features/logs`                 | Log viewer feature module                           |
| Feature: Diagnostics      | `@nasnet/features/diagnostics`          | Diagnostics feature module                          |
| Feature: Services         | `@nasnet/features/services`             | Plugin marketplace feature module                   |
| Feature: Config Import    | `@nasnet/features/configuration-import` | Config import feature module                        |
| Feature: Router Discovery | `@nasnet/features/router-discovery`     | Router discovery feature module                     |

---

## Import Aliases

All aliases are defined in `apps/connect/vite.config.ts` and resolve to absolute paths in the
monorepo:

```typescript
'@/'                              → 'apps/connect/src/'
'@nasnet/core/types'              → 'libs/core/types/src'
'@nasnet/core/utils'              → 'libs/core/utils/src'
'@nasnet/core/constants'          → 'libs/core/constants/src'
'@nasnet/core/forms'              → 'libs/core/forms/src'
'@nasnet/ui/layouts'              → 'libs/ui/layouts/src'
'@nasnet/ui/primitives'           → 'libs/ui/primitives/src'
'@nasnet/ui/patterns'             → 'libs/ui/patterns/src'
'@nasnet/ui/utils'                → 'libs/ui/primitives/src/lib/utils'
'@nasnet/ui/tokens'               → 'libs/ui/tokens/src'
'@nasnet/ui/tokens/variables.css' → 'libs/ui/tokens/dist/variables.css'
'@nasnet/ui/patterns/motion'      → 'libs/ui/patterns/src/motion'
'@nasnet/features/dashboard'      → 'libs/features/dashboard/src'
'@nasnet/features/wireless'       → 'libs/features/wireless/src'
'@nasnet/features/firewall'       → 'libs/features/firewall/src'
'@nasnet/features/logs'           → 'libs/features/logs/src'
'@nasnet/features/network'        → 'libs/features/network/src'
'@nasnet/features/alerts'         → 'libs/features/alerts/src'
'@nasnet/features/diagnostics'    → 'libs/features/diagnostics/src'
'@nasnet/features/services'       → 'libs/features/services/src'
'@nasnet/api-client/core'         → 'libs/api-client/core/src'
'@nasnet/api-client/generated'    → 'libs/api-client/generated'
'@nasnet/api-client/queries'      → 'libs/api-client/queries/src'
'@nasnet/state/stores'            → 'libs/state/stores/src'
```

### Example Usage

```typescript
// From apps/connect/src — use @/ for local files
import { AppHeader } from '@/app/components/AppHeader';

// From libs — use @nasnet/* aliases
import { Button } from '@nasnet/ui/primitives';
import { ResourceCard } from '@nasnet/ui/patterns';
import { useRouterQuery } from '@nasnet/api-client/queries';
import { useSidebarStore } from '@nasnet/state/stores';
import { cn } from '@nasnet/ui/utils';
```

---

## Key Files to Know

| File                          | Purpose                                                                 |
| ----------------------------- | ----------------------------------------------------------------------- |
| `src/main.tsx`                | App entry point: creates the TanStack Router instance, initializes i18n |
| `src/routeTree.gen.ts`        | Auto-generated by TanStack Router — never edit manually                 |
| `src/routes/__root.tsx`       | Root layout: wraps all routes with providers, shell, header, sidebar    |
| `src/app/providers/index.tsx` | Root `<Providers>` component — 8 nested context providers               |
| `vite.config.ts`              | All import aliases, dev server proxy, build chunk splitting             |
| `tsconfig.app.json`           | TypeScript config — strict mode, path aliases                           |
| `vitest.config.ts`            | Test runner config — jsdom environment, setup files, coverage           |

---

## See Also

- [Key Commands](./key-commands.md) — How to run, build, test
- [Architecture Overview](../architecture/overview.md) — How the pieces connect
- [Routing](../architecture/routing.md) — TanStack Router file-based routing in depth
