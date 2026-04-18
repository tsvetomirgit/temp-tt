---
name: /opsx-orchestrate
id: opsx-orchestrate
category: Workflow
description: Propose and immediately apply an OpenSpec change in one command
---

Orchestrate OpenSpec end-to-end in one run:
1) run propose from your description
2) run apply for the newly created change

---

**Input**: The argument after `/opsx-orchestrate` is required and can be:
- a change description
- a kebab-case change name
- a Jira story key (for example `PROJ-123`)

If no input is provided, ask:
> "What change do you want to build? Provide a short description."

---

## Steps

1. **Resolve input into a propose-ready prompt**
   - Detect if input looks like a Jira story key (`^[A-Z][A-Z0-9]+-[0-9]+$`).
   - If input is **not** a Jira key:
     - Use the raw input as `proposeInput`.
   - If input **is** a Jira key:
     - Use MCP Jira tools to fetch:
       - issue summary/title
       - issue description/body
       - attached image metadata and URLs/files
     - If the Jira MCP server requires authentication, run its auth tool first.
     - Build `proposeInput` from fetched Jira data:
       - include Jira key + summary
       - include full description text
       - include attached image references and short notes
     - If Jira fetch fails or issue is missing, stop and report the error.

2. **Capture baseline active changes**
   - Run:
   ```bash
   openspec list --json
   ```
   - Save currently active change names as `beforeChanges`.

3. **Run propose workflow**
   - Execute the existing `/opsx-propose` behavior using `proposeInput`.
   - Do not skip any artifact generation steps required by that command.

4. **Detect target change to apply**
   - Run:
   ```bash
   openspec list --json
   ```
   - Compare with `beforeChanges`:
     - If exactly one new active change appears, use it.
     - If no new change appears, infer the most likely target from the input (kebab-case name) and verify with:
       ```bash
       openspec status --change "<candidate>" --json
       ```
     - If multiple candidates exist, ask the user to choose with **AskUserQuestion**.

5. **Run apply workflow automatically**
   - Execute the existing `/opsx-apply <detected-change-name>` behavior.
   - Continue until tasks are complete or a blocker requires user input.

6. **Final report**
   - Show:
     - proposed/applied change name
     - source input type (text or Jira key)
     - artifacts created
     - apply progress (`N/M`)
     - completion state (done or paused with blocker)

---

## Output Format

```md
## Orchestration: <change-name>

### Phase 1: Propose
- Created/updated artifacts: ...

### Phase 2: Apply
- Progress: N/M tasks complete
- Status: Complete | Paused

<If paused, include blocker and options>
```

---

## Guardrails

- Always run propose before apply in this command.
- Always pass resolved `proposeInput` into propose.
- For Jira input, always fetch description and available attached images via MCP before propose.
- Do not guess the change name when ambiguous; ask the user.
- If propose fails, stop and report the error.
- If apply is blocked by missing artifacts, report and suggest running `/opsx-continue` or rerunning `/opsx-propose`.
