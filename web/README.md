# SimpleBIZ One web frontend

The frontend is a React 19 + TypeScript + Vite single-page application styled with Tailwind CSS 3 and routed with React Router.

## Commands

```bash
npm install
npm run dev
npm run build
npm run lint
```

The initial foundation contains the responsive AppShell, typed Sidebar/Navbar navigation, login preview flow, protected routes, and Dashboard placeholder. Non-dashboard destinations are intentionally presented as coming-soon placeholders until their governing module phase.

## Source organization

- `src/app/` — application composition and router.
- `src/components/layout/` — AppShell, Sidebar, and Navbar.
- `src/features/auth/` — isolated temporary preview auth.
- `src/layouts/` — reusable route structures.
- `src/pages/` — route screens.
- `src/routes/` — typed navigation definitions.
- `src/styles/` — Tailwind entrypoint and global base styles.
