# Cursor Best Practices, Organized by Topic

---

## 🗂️ 1. Structure Your Prompts

Cursor interprets structured prompts much more reliably than paragraph text. Use sections: **Goal / Context / Current Behavior / Desired Behavior / Acceptance Criteria / Constraints.**

**Example:**
```
Goal: Add pagination to /invoices API
Constraints: Preserve existing filters and sorting
Acceptance Criteria:
1. Works with page + limit params
2. Filtering still applies
3. No existing API contracts break
```

---

## 🧠 2. Plan BEFORE You Code

The most impactful change you can make is to plan before writing code. If the agent builds something that doesn't meet expectations, don't try to fix it with new prompts — go back to the plan, revert the changes, refine the plan, and run it again. It's faster and produces cleaner results.

> **Good strategy:** Use **Ask Mode** with o3 to generate a step-by-step plan, then switch to **Agent Mode** with a reasoning model (Gemini 2.5 Pro or o4-mini) for implementation.

---

## 🔬 3. Small Tasks, Frequent Commits

Work in small steps and commit often — you get clearer diffs, safer rollbacks, and better agent alignment.

Generate a `tasks.json` from your PRD, then give Cursor each task individually. The difference between *"Build the entire blog engine"* and *"Create the Post model with title, body, and timestamps"* is enormous.

---

## 📎 4. Context with @ References

Give the agent better context using the `@` key. Instead of saying *"change the navbar background"*, type `@navbar.tsx` directly in the prompt to point to the exact file.

Add `"Don't do anything else"` at the end of the prompt — the agent sometimes modifies unrelated files. This keeps it focused only on the desired change.

---

## 🧪 5. Test-Driven Approach

Add to your prompt:

> *"Write tests first, then the code, then run the tests and update the code until tests pass."*

This turns the agent from a "code writer" into a self-verifying system.

---

## 💬 6. One Chat = One Task

In long chats the model's performance drops and it loses context. Open a new chat for each task to maintain a consistent level of quality.

---

## 📋 7. Cursor Rules (`.cursor/rules/`)

The `.cursorrules` file is subject to git versioning and allows team sharing. *"Rules for AI"* in Settings is more suited for personal preferences.

If you keep repeating the same instructions in prompts — add them as a Rule instead.

---

## 🖼️ 8. Use Images

The agent processes images directly — paste a screenshot of a design mockup and ask for implementation. The agent sees layout, colors, and spacing.

You can also screenshot errors and ask for the cause — it's faster than describing them in words.

---

## ⚙️ 9. YOLO Mode for Automation

YOLO mode allows the agent to keep writing code until it verifies correctness — not just lint checks. Configure an allow list: tests, build commands, file creation. If there are TypeScript errors, the agent will find and fix them on its own.

---

## Summary

> The era of **"vibe coding"** is over. Now it's **"Agentic Engineering"** — you design the architecture, define the rules, and the agents execute. Your job is oversight and quality, not syntax.
