---
name: frontend-design
description: Create distinctive, production-grade frontend interfaces using only the Clarity Design System in Angular. Use when building web components, pages, dashboards, or applications with Clarity; styling or beautifying Clarity-based UI; or when the user asks for frontend design within this project's Angular + Clarity stack.
---

This skill guides creation of distinctive, production-grade frontend interfaces using **only the Clarity Design System** ([clarity.design](https://clarity.design/)) in **Angular**. All UI must be implemented with Clarity components, layout, and theming. Reference: [ng-clarity](https://github.com/vmware-clarity/ng-clarity).

The user provides frontend requirements: a component, page, or interface to build. Implement using Clarity layout, components (datagrid, forms, modals, tabs, cards, alerts, buttons, etc.), and Clarity design tokens—no custom design systems or one-off component libraries.

## Design thinking (within Clarity)

Before coding, clarify context and intent:

- **Purpose**: What problem does this interface solve? Who uses it?
- **Tone**: Choose a direction that fits the product (minimal/utilitarian, data-dense/dashboard, workflow-oriented, etc.). Clarity supports both light and dark themes; use the theme that fits.
- **Constraints**: Angular standalone components, Clarity modules only, accessibility (Clarity is built for a11y).
- **Differentiation**: Use layout composition, content hierarchy, and Clarity’s layout and components in intentional ways—not by introducing non-Clarity UI.

Then implement working Angular + Clarity code that is:

- Production-grade and functional
- Consistent with Clarity’s design language
- Cohesive and clearly structured
- Refined in spacing, hierarchy, and component choice

## Clarity-only implementation

- **Layout**: Use Clarity layout (`main-container`, `header`, `content-container`, `content-area`, vertical nav when needed). Do not invent custom layout systems.
- **Components**: Use Clarity components for all UI: buttons (`btn`, `btn-primary`), datagrid, forms (Clarity form containers and directives), alerts, modals, tabs, cards, icons (`clr-icon`). No raw custom equivalents (e.g. no custom tables instead of `clr-datagrid`).
- **Typography & color**: Use Clarity’s type scale and color tokens (CSS variables). Customize only via Clarity theming where the project allows. No arbitrary font or color stacks that override Clarity.
- **Motion**: Prefer Clarity’s built-in behavior and animations. If adding motion, keep it subtle and consistent with Clarity (e.g. transitions). Do not add heavy custom animation systems.
- **Spatial composition**: Use Clarity grid and spacing utilities. Create hierarchy and emphasis through layout structure and Clarity components, not custom CSS layouts.
- **Backgrounds & details**: Use Clarity surfaces and tokens. Add atmosphere only through Clarity-compatible theming (e.g. background tokens). No unrelated textures, grain, or decorative systems that clash with Clarity.

**NEVER** introduce non-Clarity UI frameworks, generic component libraries, or custom “design system” CSS that replaces Clarity. All pages and components must be clearly recognizable as Clarity-based.

**IMPORTANT**: Match implementation to the need. Data-heavy screens use `clr-datagrid` and Clarity layout. Forms use Clarity form components. Wizards and flows use Clarity modal/wizard patterns. Stay within Clarity’s patterns so the result is consistent and maintainable.

When in doubt, prefer the Clarity-documented pattern and the project’s existing Clarity rules (`.cursor/rules/clarity-*.mdc`) and skill (clarity-angular-pages).
