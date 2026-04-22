# Spec-Driven Development with OpenSpec and Cursor

## Overview

This document describes a structured, AI-assisted development workflow applied to the **Migration System** project — an Angular application built with the Clarity Design System. The workflow connects Jira story authoring, design assets from Figma, spec generation via the OpenSpec Framework, and automated code execution in Cursor. The goal is to reduce ambiguity between design intent and implementation by producing a machine-readable spec before any code is written.

The workflow is split into two phases: **Spec Phase** (completed) and **Verification Phase** (planned).

---

## Project Context

The workflow was applied within the **Migration System** — an Angular project using the Clarity Design System for UI components, UI graphics and diagrams, and the TM UI common component library for shared building blocks.

A key enabler of this workflow is the project's investment in **Cursor AI configuration assets**, which give the AI coding agent precise, project-specific knowledge before a single line of code is generated:

| Asset Type | Coverage |
|---|---|
| **Cursor Rules** | Angular coding conventions, Clarity component usage patterns, TM UI integration guidelines |
| **Skills** | Reusable instruction sets for Clarity graphics and diagram generation, form patterns, and layout composition |
| **Commands** | Shorthand workflows for common tasks such as generating components, running specs, and scaffolding features |

These assets directly improve both the **spec writing phase** (the AI understands the component vocabulary of the project) and the **execution phase** (Cursor applies the correct patterns without needing them re-explained in every prompt). The combination of a structured OpenSpec artifact and a well-configured Cursor workspace significantly reduces back-and-forth and keeps generated code consistent with the project's standards.

---

## Workflow Diagram

```
Jira Story + Figma Design
        │
        ▼
  Fetch via Jira MCP
        │
        ▼
 Write OpenSpec (Opus 4.6)
        │
        ▼
   Read & Review Spec
        │
        ▼
Execute Spec (Sonnet 4.6)
  [Cursor Rules, Skills & Commands]
        │
        ▼
  [PLANNED] Launch localhost
        │
        ▼
  [PLANNED] Playwright CLI Verification
```

---

## Phase 1 — Spec Generation (Completed)

### Step 1: Author the Jira Story

A Jira story was created with a **detailed description** covering the acceptance criteria, expected behavior, and component scope. A **Figma design screenshot** was attached directly to the ticket to serve as the visual reference for the AI tooling.

**Best practices applied:**
- Description written with enough detail for the AI to infer component structure, interaction states, and layout constraints.
- Figma image attached to the ticket (not linked externally) so it is accessible via the Jira MCP server.

---

### Step 2: Fetch Jira Story via MCP

The Jira MCP server was used directly inside Claude to retrieve both the ticket description and the attached Figma image. No manual copy-pasting was required.

**What was fetched:**
- Ticket title and full description text
- Attached image (Figma design screenshot)

**Why this matters:** Feeding raw Jira content to the AI ensures the spec reflects the actual acceptance criteria, not a paraphrased or summarized version.

---

### Step 3: Write the Spec with OpenSpec Framework (Opus 4.6)

Using the fetched Jira description and Figma image as input, an OpenSpec-structured spec was generated using **Claude Opus 4.6**.

The OpenSpec Framework structures development intent into the following artifacts:

| Artifact | Purpose |
|---|---|
| `proposal.md` | High-level summary of what is being built and why |
| `design.md` | Component breakdown, layout decisions, state modeling |
| `tasks.md` | Ordered, atomic implementation tasks for the executor |
| Spec (combined) | Full structured spec consumed by the coding model |

**Why Opus 4.6 for spec writing:** The planning phase benefits from deep reasoning — Opus produces higher-quality design decisions, edge case coverage, and task decomposition than faster models. Because the spec references Clarity components, UI graphics, and TM UI building blocks, the model's understanding of the project context (informed by the Cursor rules and skills) carries into the spec's design decisions.

---

### Step 4: Review the Spec

Before execution, the generated spec was **manually reviewed** to verify:

- Alignment with the Figma design
- Correct interpretation of acceptance criteria from Jira
- Task ordering and completeness in `tasks.md`
- No ambiguous or conflicting instructions that could mislead the executor

This step is a quality gate — catching misunderstandings at the spec level is cheaper than catching them after code is written.

---

### Step 5: Execute the Spec (Sonnet 4.6)

The reviewed spec was passed to **Claude Sonnet 4.6** inside Cursor for implementation. Sonnet handled the code generation tasks defined in `tasks.md`.

**Why Sonnet for execution:** Execution tasks are well-defined by the time the spec reaches this stage. Sonnet offers the best balance of speed, cost, and code quality for structured, context-rich implementation work.

**Cursor integration:** The spec artifacts were available in the Cursor workspace, and the project's existing rules, skills, and commands ensured that generated code used the correct Angular patterns, Clarity components, and TM UI utilities — without extra prompting.

---

## Phase 2 — Verification (Planned)

### Step 6: Launch the Application

The next step is to open the locally running application in a browser (`localhost`) and navigate to the area of the UI where the new feature was implemented.

---

### Step 7: Playwright CLI Verification

A Playwright CLI session will be used to navigate to the newly implemented feature and verify that the UI matches the Figma design and satisfies the Jira acceptance criteria.

**Planned verification checks:**
- Feature renders without console errors
- Component layout matches the Figma reference
- Interactive states (hover, focus, validation) behave as specified
- Accessibility attributes are present where required

> **Note:** Playwright verification closes the loop between the original Jira story and the deployed UI, making the workflow end-to-end traceable.

---

## Tools & Technologies

| Tool / Technology | Role in Workflow |
|---|---|
| **Jira** | Story authoring and Figma image hosting |
| **Jira MCP Server** | Programmatic story + image retrieval into Claude |
| **OpenSpec Framework** | Spec structure (`proposal.md`, `design.md`, `tasks.md`) |
| **Claude Opus 4.6** | Spec generation (planning + reasoning) |
| **Claude Sonnet 4.6** | Spec execution (code generation in Cursor) |
| **Cursor** | AI-assisted development environment with project rules, skills, and commands |
| **Angular** | Application framework (Migration System) |
| **Clarity Design System** | UI component library and graphics/diagram primitives |
| **TM UI** | Shared common component library |
| **Playwright CLI** | Automated UI verification against spec |
| **Figma** | Visual design reference |

---

## Key Principles

**Spec before code.** No implementation starts without a reviewed OpenSpec artifact. This separates planning (high-reasoning model) from execution (fast, cost-efficient model).

**MCP over copy-paste.** Using the Jira MCP server eliminates manual transcription and keeps the spec grounded in the actual ticket content.

**Project context as a force multiplier.** The Migration System's Cursor rules, skills, and commands mean the AI agent arrives at every task already knowing the Angular conventions, Clarity component API, and TM UI patterns. This reduces prompt length, avoids repeated corrections, and produces more consistent output.

**Model selection by task type.** Opus for reasoning-heavy spec work, Sonnet for execution. This optimizes both quality and cost across the workflow.

**Verification closes the loop.** Playwright CLI verification links the final UI output back to the original Jira story, making the entire workflow auditable.

---

## Related Resources

- [OpenSpec Framework](https://github.com/Fission-AI/OpenSpec)
- [Playwright CLI Documentation](https://playwright.dev/docs/intro)
- [Cursor Documentation](https://docs.cursor.com)
- [Anthropic Model Overview](https://docs.anthropic.com/en/docs/about-claude/models/overview)
