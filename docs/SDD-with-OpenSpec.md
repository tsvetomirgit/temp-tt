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
| **Commands** | Shorthand workflows including the custom orchestration command that drives the entire spec-driven pipeline |

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
 [Custom Cursor Command]──────────────────────────┐
        │                                          │
        ▼                                          │
 Write OpenSpec (Opus 4.6)               Orchestrates all steps
        │                                          │
        ▼                                          │
   Read & Review Spec                              │
        │                                          │
        ▼                                          │
Execute Spec (Sonnet 4.6)                          │
  [Cursor Rules, Skills & Commands]◄───────────────┘
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

> **Note:** The custom Cursor command that orchestrates this workflow also accepts free-form text as input. This means a Jira ticket is not strictly required — the command can be invoked with a plain text description of the feature when a formal story does not yet exist or when prototyping quickly outside the Jira process.

---

### Step 2: Fetch Jira Story via MCP

The Jira MCP server was used directly inside Claude to retrieve both the ticket description and the attached Figma image. No manual copy-pasting was required.

**What was fetched:**
- Ticket title and full description text
- Attached image (Figma design screenshot)

**Why this matters:** Feeding raw Jira content to the AI ensures the spec reflects the actual acceptance criteria, not a paraphrased or summarized version.

---

### Step 3: Orchestrate with a Custom Cursor Command

The entire spec-driven pipeline is triggered and managed by a **custom Cursor command** created specifically for this workflow. Rather than manually invoking each step in sequence, the command orchestrates the full process from a single entry point inside Cursor chat.

**What the command does:**
- Accepts the Jira ticket reference as input
- Coordinates the Jira MCP fetch (description + image)
- Passes the fetched content to the OpenSpec spec-writing phase with the correct model (Opus 4.6)
- Signals when the spec is ready for human review
- Hands off the reviewed spec to the execution phase (Sonnet 4.6)

**Why this matters:** Without the command, each step requires a manual context switch and prompt construction. The command eliminates that overhead, enforces the correct step order, and makes the workflow repeatable by any team member with a single invocation. It is stored in `.cursor/commands/` alongside the rest of the project's Cursor configuration assets.

---

### Step 4: Write the Spec with OpenSpec Framework (Opus 4.6)

Using the fetched Jira description and Figma image as input, an OpenSpec-structured spec was generated using **Claude Opus 4.6**.

#### OpenSpec Folder Structure

When initialized in the project (`openspec init --tools cursor`), OpenSpec creates the following directory layout:

```
openspec/
├── specs/          # Main specifications — the living source of truth
├── changes/        # One subfolder per proposed change, e.g.:
│   └── add-region-form/
│       ├── proposal.md     # Why this change, what it covers
│       ├── specs/          # Requirements and acceptance scenarios
│       ├── design.md       # Technical approach and component decisions
│       └── tasks.md        # Ordered, atomic implementation checklist
└── config.yaml     # Project configuration (tech stack context, schema, rules)

.cursor/
├── skills/         # OpenSpec workflow skills for Cursor
└── commands/       # OpenSpec slash commands (opsx:*)
```

Each change gets its own isolated folder so multiple features can be specced in parallel without collision.

#### OpenSpec Artifacts

| Artifact | Purpose |
|---|---|
| `proposal.md` | High-level summary of what is being built and why |
| `specs/` | Detailed requirements and acceptance scenarios |
| `design.md` | Component breakdown, layout decisions, state modeling |
| `tasks.md` | Ordered, atomic implementation tasks for the executor |

#### OpenSpec Cursor Integration — Skills, Rules, and Commands

When initialized for Cursor, OpenSpec installs the following into the `.cursor/` directory:

**Skills** (`.cursor/skills/`) — Reusable instruction blocks the AI loads on demand. The core profile installs skills for the main workflows: `propose`, `explore`, `apply`, and `archive`. Each skill teaches Cursor how to generate, refine, or execute a specific type of OpenSpec artifact correctly.

**Commands** (`.cursor/commands/`) — Slash commands invokable directly in the Cursor chat interface. The key commands are:

| Command | What it does |
|---|---|
| `/opsx:propose` | Creates a new change folder and generates all artifacts (`proposal.md`, `specs/`, `design.md`, `tasks.md`) in one step |
| `/opsx:explore` | Investigates a problem or requirement before committing to a change |
| `/opsx:new` + `/opsx:continue` | Step-by-step artifact creation for incremental control |
| `/opsx:apply` | Executes the tasks in `tasks.md`, implementing the spec |
| `/opsx:archive` | Archives a completed change, syncing its specs into the main `openspec/specs/` source of truth |

In this project, the custom orchestration command (Step 3) wraps these OpenSpec commands into a single pipeline invocation, so the full Jira → spec → code cycle runs from one entry point.

**Why Opus 4.6 for spec writing:** The planning phase benefits from deep reasoning — Opus produces higher-quality design decisions, edge case coverage, and task decomposition than faster models. Because the spec references Clarity components, UI graphics, and TM UI building blocks, the model's understanding of the project context (informed by the Cursor rules and skills) carries into the spec's design decisions.

---

### Step 5: Review the Spec

Before execution, the generated spec was **manually reviewed** to verify:

- Alignment with the Figma design
- Correct interpretation of acceptance criteria from Jira
- Task ordering and completeness in `tasks.md`
- No ambiguous or conflicting instructions that could mislead the executor

This step is a quality gate — catching misunderstandings at the spec level is cheaper than catching them after code is written.

---

### Step 6: Execute the Spec (Sonnet 4.6)

The reviewed spec was passed to **Claude Sonnet 4.6** inside Cursor for implementation via `/opsx:apply`. Sonnet handled the code generation tasks defined in `tasks.md`.

**Why Sonnet for execution:** Execution tasks are well-defined by the time the spec reaches this stage. Sonnet offers the best balance of speed, cost, and code quality for structured, context-rich implementation work.

**Cursor integration:** The spec artifacts were available in the Cursor workspace, and the project's existing rules, skills, and commands ensured that generated code used the correct Angular patterns, Clarity components, and TM UI utilities — without extra prompting.

---

## Phase 2 — Verification (Planned)

### Step 7: Launch the Application

The next step is to open the locally running application in a browser (`localhost`) and navigate to the area of the UI where the new feature was implemented.

---

### Step 8: Playwright CLI Verification

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
| **OpenSpec Framework** | Spec structure (`proposal.md`, `design.md`, `tasks.md`) and Cursor integration |
| **Custom Cursor Command** | Orchestrates the full Jira → spec → code pipeline from a single invocation |
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

**Orchestration as a first-class artifact.** The custom Cursor command is not a convenience shortcut — it is a versioned, repeatable workflow definition that any team member can invoke. Storing the pipeline as a command makes the process auditable and transferable.

**Project context as a force multiplier.** The Migration System's Cursor rules, skills, and commands mean the AI agent arrives at every task already knowing the Angular conventions, Clarity component API, and TM UI patterns. This reduces prompt length, avoids repeated corrections, and produces more consistent output.

**Model selection by task type.** Opus for reasoning-heavy spec work, Sonnet for execution. This optimizes both quality and cost across the workflow.

**Verification closes the loop.** Playwright CLI verification links the final UI output back to the original Jira story, making the entire workflow auditable.

---

## Alternative Spec-Driven Frameworks

The approach described in this document is not tied to OpenSpec. The same workflow principles — spec before code, artifact-guided execution, human review gates — can be applied with other frameworks. Below is a comparison of the main options in the ecosystem as of 2026.

### GitHub Spec Kit

Spec Kit is an open-source toolkit published by GitHub that structures spec-driven development into four phases: **Specify → Refine → Plan → Tasks → Implement**. It uses a CLI tool called `specify` and installs template artifacts into the project. The framework is compatible with GitHub Copilot, Claude Code, Gemini CLI, Cursor, and Windsurf.

Compared to OpenSpec, Spec Kit is more thorough but heavier-weight. It excels at greenfield projects and feature work in existing codebases where the spec-as-contract model is strictly enforced. Its main entry command is `/specify`.

### BMad Method

BMad (Breakthrough Method for Agile AI-Driven Development) is the most comprehensive SDD framework available today. Rather than a single AI assistant, it introduces **21 specialized AI agent personas** — Product Manager, Architect, Scrum Master, Developer, UX Designer, QA, and others — each defined as a self-contained Markdown file. Agents hand off work between phases, simulating a full agile team.

BMad is scale-adaptive: it automatically adjusts planning depth from a quick bug fix (tech-spec only) to a full enterprise delivery (PRD + Architecture + UX + Security + DevOps). It is 100% free and open source, and integrates with Claude Code, Cursor, VS Code, and others. For the Migration System workflow, BMad would be the strongest choice if the team wanted to formalize multiple reviewer roles (e.g., mapping Ralph's spec approval and code review checkpoints to dedicated BMad agent handoffs).

### Framework Comparison

| Dimension | OpenSpec | Spec Kit (GitHub) | BMad Method |
|---|---|---|---|
| **Approach** | Lightweight, artifact-guided | Four-phase CLI workflow | Multi-agent agile simulation |
| **Best for** | Brownfield features, fast iteration | Greenfield and feature work | Enterprise, complex systems |
| **Agent model** | Single assistant + commands | Single assistant + CLI | 21 specialized agent personas |
| **Cursor support** | Native (skills + commands) | Via template install | Via agent Markdown files |
| **Weight** | Lightweight | Moderate | Comprehensive |
| **Open source** | Yes | Yes (GitHub) | Yes (MIT) |

> This workflow can be reproduced with any of these frameworks. The core discipline — agree on the spec before writing code, review it as a human, execute it with a fast model — transfers directly.

---

## Related Resources

### Spec-Driven Framework Documentation

- [OpenSpec Framework](https://github.com/Fission-AI/OpenSpec) — official repository and docs
- [OpenSpec Commands Reference](https://github.com/Fission-AI/OpenSpec/blob/main/docs/commands.md) — full slash command reference
- [OpenSpec CLI Reference](https://github.com/Fission-AI/OpenSpec/blob/main/docs/cli.md) — folder structure and init options
- [GitHub Spec Kit](https://github.com/github/spec-kit) — official repository
- [Spec Kit Documentation](https://github.github.com/spec-kit/) — official docs site
- [GitHub Blog: Spec-Driven Development with Spec Kit](https://github.blog/ai-and-ml/generative-ai/spec-driven-development-with-ai-get-started-with-a-new-open-source-toolkit/) — introduction article
- [BMad Method](https://github.com/bmad-code-org/BMAD-METHOD) — official repository
- [BMad Method Documentation](https://docs.bmad-method.org/) — official docs site

### Other Tools

- [Playwright CLI Documentation](https://playwright.dev/docs/intro)
- [Cursor Documentation](https://docs.cursor.com)
- [Anthropic Model Overview](https://docs.anthropic.com/en/docs/about-claude/models/overview)
