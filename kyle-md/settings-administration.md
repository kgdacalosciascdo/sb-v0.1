# 2026-09-09 — Settings & Administration Landing Page

## Objective

Implement the Settings & Administration landing page UI from the SimpleBIZ reference design in `ui/pages/SimpleBIZ One UI - 1100 - 001 Settings & Administration Landing-02.jpg`, keeping this phase focused on the frontend landing experience.

## Route and specification

- Route: `/settings`
- Design specification: `modules/MDS-1100 Settings & Administration Module Design Specification v1.1.docx`
- Page component: `web/src/pages/settings/SettingsPage.tsx`
- Page transition styles: `web/src/pages/settings/settings.css`

## Completed UI

- Added the Settings & Administration heading and supporting description.
- Added nine settings workspace cards:
  - Account & Subscription
  - Business Setup
  - Users & Access
  - Finance & Documents
  - Workflow & Approvals
  - Modules & Preferences
  - Notifications
  - Data & Integrations
  - Security & Audit
- Added the Recent Changes panel beside the second row on wide layouts.
- Matched the reference’s soft light-blue card treatment, blue line icons, white action controls, restrained borders, and compact typography.
- Added responsive grid behavior for narrow, medium, and wide layouts.

## Entrance transition

The page now follows the same staged entrance pattern used by Home and Dashboard:

- The heading fades upward first.
- The settings card grid fades and scales into place shortly afterward.
- `prefers-reduced-motion: reduce` disables the animations and restores the content immediately.

## Data and interaction boundary

The page is currently a presentation-layer landing page. Account, business, user, finance, workflow, notification, integration, and security actions are intentionally static placeholders until the underlying workflows and APIs are implemented. No Settings & Administration business functionality was added in this phase.

Before implementing settings workflows, use `MDS-000` for shared conventions and `MDS-1100` for the module-specific requirements.

## Handoff notes

- Keep settings-specific implementation under `web/src/pages/settings/` where practical.
- Preserve the existing AppShell, sidebar, navbar, route, and navigation contract unless a future requirement explicitly changes it.
- The visual reference is the source for layout and visual direction; authentication, authorization, persistence, validation, audit behavior, and integrations remain future work.
