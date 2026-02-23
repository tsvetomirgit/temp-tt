# Create a simple Clarity datagrid page

Create a new Angular page that uses the Clarity Design System with a datagrid, a **New** button on top, and **Edit** and **Delete** as contextual (per-row) actions.

## Requirements

1. **Location**: Add the new page under `angular/src/app/` in a new feature folder (e.g. `items/` or a name the user specified). Use a standalone Angular component.

2. **Layout**: Use the project’s Clarity layout: `main-container` → `header` → `content-container` → `content-area`. If the user wants only the datagrid block (e.g. to embed in an existing page), create just the component with the toolbar + datagrid and no full-page layout.

3. **Toolbar above the datagrid**:
   - Place a toolbar or heading row **above** the `<clr-datagrid>`.
   - Add a single primary action: a **New** button (`class="btn btn-primary"`) that calls a `onNew()` method (stub is fine; user can wire later).

4. **Datagrid**:
   - Use `<clr-datagrid>` with columns appropriate to the entity (or placeholder columns like Name, Status, Actions if the entity is unspecified).
   - Use `*ngFor` over a component property (e.g. `items` or `users`) for rows.
   - Include a **footer** (`<clr-dg-footer>`) with the total count.

5. **Contextual actions (per row)**:
   - Add an **Actions** column as the last column.
   - In each row, provide **Edit** and **Delete** actions. Prefer Clarity dropdown (`clrDropdown`) in the cell: trigger with a “actions” or “overflow” icon, menu items “Edit” and “Delete” that call `onEdit(item)` and `onDelete(item)` (stubs are fine).
   - If the user prefers buttons instead of a dropdown, use two icon or text buttons (Edit, Delete) in the cell that call the same methods.

6. **Technical**:
   - Standalone component; `imports: [ClarityModule, CommonModule]`.
   - Use an interface or type for the row model (e.g. `Item` or `User`) with at least `id` and the fields used in the columns.
   - Add stub methods: `onNew()`, `onEdit(item: T)`, `onDelete(item: T)` (e.g. `console.log` or empty body so the app runs).
   - Follow existing project patterns: see `angular/src/app/datagrid/` and `.cursor/rules/clarity-components.mdc` / `clarity-angular-patterns.mdc`.

7. **Routing** (if it’s a full page): Add a route for the new component when the user wants it navigable (e.g. in `app.routes.ts`).

Deliver the new component files (`.ts`, `.html`, and optional `.css`) and any routing change. Keep the page simple and fully Clarity-based.
