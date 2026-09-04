# SimpleBIZ One implementation context

SimpleBIZ One is a modern, entrepreneur-first business platform. Its design direction is one governed platform with familiar business language, simple user journeys, reusable shared services, responsive access, and controlled growth from lightweight business tools toward ERP capability.

## Technology and architecture

- Backend: Laravel 13, PHP 8.3+, PostgreSQL as the intended database.
- Frontend: React 19, TypeScript, Vite, Tailwind CSS 3, React Router.
- Architecture: Laravel API/backend with a React SPA frontend in a modular monolith.
- Current phase: application foundation only — login preview, application shell, navigation, routing, and a neutral Dashboard placeholder.

## Authoritative module mapping

MDS-000 SimpleBIZ One Core governs common behavior. Module-specific MDS documents extend it and govern their own business meaning; they must not bypass or redefine common Core rules.

| Backend module | Governing MDS | Responsibility |
| --- | --- | --- |
| `Core` | MDS-000 | Shared platform services and controls |
| `Dashboard` | MDS-100 | Business overview and authorized navigation |
| `Sales` | MDS-200 | Sales & Receivables |
| `Collections` | MDS-300 | Collections & Receipts |
| `Purchases` | MDS-400 | Purchases & Payables |
| `Payments` | MDS-500 | Payments & Disbursements |
| `Inventory` | MDS-600 | Inventory |
| `CashAccounts` | MDS-700 | Cash Accounts |
| `Expenses` | MDS-800 | Expenses |
| `Reports` | MDS-900 | Reports & Analytics |
| `MasterRegistries` | MDS-1000 | Authoritative shared operational records |
| `Settings` | MDS-1100 | Settings & Administration |

The repository currently stores the authoritative MDS files in `modules/` and the supplied visual references in `ui/pages/` and `ui/forms/`. The original documents remain authoritative; this file is only a developer orientation aid.

## Frontend organization

- `src/app/` — application composition and centralized router.
- `src/components/layout/` — reusable AppShell, Sidebar, and Navbar pieces.
- `src/components/ui/` — reserved for low-level shared UI primitives.
- `src/features/auth/` — temporary development-only login preview flow.
- `src/layouts/` — route-level reusable page structures.
- `src/pages/` — route-level screens.
- `src/routes/` — typed navigation configuration.
- `src/lib/`, `src/types/`, `src/styles/`, and `src/assets/` — shared utilities, types, global styling, and assets.

Before implementing a module, read MDS-000 and the corresponding module MDS, plus any available UI/form reference for that module.
