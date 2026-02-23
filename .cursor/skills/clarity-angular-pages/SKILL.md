---
name: clarity-angular-pages
description: Builds pages and UIs with Clarity Design System in Angular. Use when creating or editing pages with Clarity, adding Clarity components (datagrid, forms, modals, tabs, cards), or when the user mentions Clarity, clarity.design, datagrid, modals, or Clarity layout.
---

# Building pages with Clarity Angular

This skill guides building pages and features using **Clarity Design System** ([clarity.design](https://clarity.design/)) in an **Angular** app. The Angular app lives under **`angular/`**. Reference: [ng-clarity](https://github.com/vmware-clarity/ng-clarity).

## Quick reference

- **Layout:** [Clarity layout](https://clarity.design/foundation/layout) — `main-container`, `header`, `content-container`, `content-area`.
- **Angular components:** Use `@clr/angular`; import `ClarityModule` in standalone components that use Clarity in the template.
- **Icons:** `<clr-icon shape="...">`; ensure Clarity icons are loaded (e.g. via `ClarityModule` or `ClarityIcons` in app bootstrap).

## Page types and patterns

### 1. List / data page

- Use **`<clr-datagrid>`** for tabular data.
- Define `<clr-dg-column>` for each column, then `<clr-dg-row>` with `*ngFor` and `<clr-dg-cell>` per column.
- Add `<clr-dg-footer>` for count or summary.
- Optionally add toolbar, filters, or row actions; follow existing project patterns.

**Minimal example:**

```html
<clr-datagrid>
  <clr-dg-column>Name</clr-dg-column>
  <clr-dg-column>Status</clr-dg-column>
  <clr-dg-row *ngFor="let item of items">
    <clr-dg-cell>{{ item.name }}</clr-dg-cell>
    <clr-dg-cell>{{ item.status }}</clr-dg-cell>
  </clr-dg-row>
  <clr-dg-footer>{{ items.length }} item(s)</clr-dg-footer>
</clr-datagrid>
```

Component: `imports: [ClarityModule, CommonModule]`, and expose `items` (array) as property or via `@Input()`.

### 2. Form page

- Use **reactive forms** (`FormGroup` / `FormControl`) with Clarity form components.
- Use Clarity form containers and directives (e.g. `clr-input-container`, `clrInput`) so labels and validation display correctly.
- Use Clarity buttons: `class="btn btn-primary"` for submit, `btn-secondary` for cancel.
- Keep form layout inside the standard page layout (`content-area`).

### 3. Dashboard / cards

- Use Clarity **card** components or card layout classes for dashboard tiles.
- Use grid/layout utilities for responsive columns.
- Reuse existing layout (`main-container` → `content-container` → `content-area`) for the page.

### 4. Detail page

- Use the same layout (header + `content-area`). Use sections, headings, and optionally **Clarity tabs** (`clr-tabs`) for multiple sections.
- Use Clarity buttons for actions (e.g. Edit, Back).

### 5. Modal or wizard

- Use **Clarity modal** or **wizard** components for dialogs and multi-step flows.
- Follow Clarity docs for opening/closing and binding data.

## Checklist when adding a page

- [ ] Use project layout: `main-container` → `header` → `content-container` → `content-area` (or match existing shell).
- [ ] Use Clarity components (datagrid, buttons, forms, alerts, etc.) instead of raw HTML where applicable.
- [ ] In standalone components, import `ClarityModule` and `CommonModule` (or equivalent) where the template uses Clarity or `*ngFor`/`*ngIf`/pipes.
- [ ] Follow project conventions in `.cursor/rules/` (Clarity components and Angular patterns).
- [ ] Place new components under `angular/src/app/` with a clear folder/name (e.g. `feature-name/feature-name.component.ts`).

## Example: existing list page in this project

The app already has a datagrid example:

- **Component:** `angular/src/app/datagrid/datagrid.component.ts` — standalone, `imports: [ClarityModule, CommonModule]`, `@Input() users`.
- **Template:** `angular/src/app/datagrid/datagrid.component.html` — `<clr-datagrid>` with columns, `*ngFor` rows, footer.
- **Shell:** `angular/src/app/app.html` — `main-container`, `header`, `content-container`, `content-area`, then `<datagrid [users]="users">`.

Use this as a reference for new list or grid-based pages.

## Additional resources

- [Clarity Design System](https://clarity.design/)
- [Clarity Angular (ng-clarity) GitHub](https://github.com/vmware-clarity/ng-clarity)
- Project rules: `.cursor/rules/clarity-components.mdc`, `.cursor/rules/clarity-angular-patterns.mdc`
- Project context: `AGENTS.md`
