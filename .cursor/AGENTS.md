# Project context for AI agents

## UI stack: Clarity Design System

This project uses **Clarity Design System** for Angular:

- **Docs:** [clarity.design](https://clarity.design/)
- **Angular library (ng-clarity):** [github.com/vmware-clarity/ng-clarity](https://github.com/vmware-clarity/ng-clarity)

The Angular app lives in the **`angular/`** directory. All Clarity usage is in that app.

### Conventions

- Use **Clarity layout** (`main-container`, `header`, `content-container`, `content-area`) for page structure.
- Use **Clarity components** (datagrid, buttons, alerts, forms, modals, tabs, etc.) instead of custom or raw HTML where they fit.
- Use **standalone Angular components** and import `ClarityModule` from `@clr/angular` where Clarity is used.
- Follow the patterns and component choices described in `.cursor/rules/` (Clarity component and Angular patterns).

### Commands (Angular app)

From the **`angular/`** directory:

- `npm start` — run dev server
- `npm run build` — production build
- `npm test` — run tests

When creating or editing pages, prefer Clarity components and the existing layout so new colleagues can build UIs consistently.
