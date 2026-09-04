# SimpleBIZ One

SimpleBIZ One is an entrepreneur-first business platform being built as a Laravel modular monolith with a React SPA frontend. The authoritative module specifications live in `modules/`; supplied UI references live in `ui/pages/` and `ui/forms/`.

## Current status

The repository is currently at the initial foundation phase. It includes a responsive React application shell, login preview flow, protected Dashboard placeholder, centralized routing, Tailwind CSS, and Laravel backend module boundaries. Business transactions, real authentication, APIs, database-dependent logic, and final Dashboard analytics are intentionally deferred.

## Project structure

- `backend/` — Laravel 13 application and future module boundaries under `backend/app/Modules/`.
- `web/` — React 19 + TypeScript + Vite frontend.
- `modules/` — authoritative SimpleBIZ MDS documents.
- `ui/` — supplied page and form visual references.
- `docs/` — implementation context and developer handoff logs.

## Frontend development

```bash
cd web
npm install
npm run dev
```

Validation commands:

```bash
npm run build
npm run lint
```

The login page is a clearly marked preview-only flow. Any valid-looking email and non-empty password opens the authenticated shell; only a demo auth flag is stored, never a password.

## Backend development

```bash
cd backend
composer install
php artisan serve
php artisan test
```

PostgreSQL is the intended database for future business modules. No database-dependent business functionality is part of the current foundation phase.
