# Migrator — New UI Features
## Video Production Script

**Duration:** ~5 minutes &nbsp;|&nbsp; **Format:** Conversational + UI Demo &nbsp;|&nbsp; **Language:** English  
**Content mix:** 35% Dialogue &nbsp;|&nbsp; 55% Product UI &nbsp;|&nbsp; 10% Cinematic  
**Tool:** VideoAI avatar presentation

---

## Feature Importance & Time Allocation

The scenes are ordered and timed by feature importance. The most important features
receive the most screen time, the most dialogue depth, and the most deliberate cursor pacing.

| Priority | Feature | Scene | Allocated time |
|----------|---------|-------|----------------|
| ⭐⭐⭐⭐⭐ | Edit step modal — HTML form for editing properties | Scene 5 | ~75 sec |
| ⭐⭐⭐⭐ | Step details side panel — alerts and notes | Scene 4C | ~25 sec |
| ⭐⭐⭐⭐ | Migration & evaluation details — status cards, gauge, messages | Scene 4A–B | ~35 sec |
| ⭐⭐⭐ | Migration history button | Scene 4D | ~15 sec |
| ⭐⭐⭐ | Overview tab | Scene 3 | ~30 sec |
| ⭐⭐ | Evaluations tab | Scene 2 | ~40 sec |
| ⭐⭐ | Cards list & adding a new source system | Scene 1B–C | ~25 sec |

---

## Characters

| Avatar | Name | Role | Dynamic |
|--------|------|------|---------|
| Avatar A | **Robert** | Cloud infrastructure engineer | Asks, challenges, drives the conversation |
| Avatar B | **Tsvetomir** | Cloud infrastructure engineer | Answers, demonstrates, narrates the UI |

> **VideoAI setup:** Two avatars, equal visual weight — no host vs guest framing. Use alternating cuts rather than persistent split-screen. Both backgrounds: blurred neutral office. Similar speaking pace (~135 wpm each).

---

## Content Type Legend

| Symbol | Type | Description |
|--------|------|-------------|
| 🎬 | Cinematic | Atmosphere / transition shot |
| 🎙 | Dialogue | Conversational avatar exchange |
| 🖥 | UI Demo | Screen recording of the product |

---

## Scene 1 — Introduction
**Timecode: 0:00 – 0:30**  
*Purpose: set the tone, introduce both characters as peers, name what's coming.*

| # | Type | Time | Visual | Script / Direction |
|---|------|------|--------|--------------------|
| 1A | 🎬 Cinematic | 0:00–0:08 | Slow zoom on the Migration page — two source cards visible: **vc1** (no status yet) and **vcd1** (Ready badge, "11 successful checks"). Ambient music fades in. | No dialogue. Mood-setter. |
| 1B | 🎙 Dialogue | 0:08–0:20 | Tsvetomir on screen. Robert cuts in. | See dialogue below. |
| 1C | 🎙 Dialogue | 0:20–0:30 | Both avatars, medium framing, relaxed energy. | See dialogue below. |

### Dialogue

**ROBERT:** Tsvetomir — I saw the Migrator release notes. Looks like a big one.

**TSVETOMIR:** It is. The UI has been reworked across the board. Let me show you the pieces that matter most — starting from where the real work happens, and working outward.

**ROBERT:** Lead the way.

---

## Scene 2 — Evaluations Tab
**Timecode: 0:30 – 1:10**  
*Purpose: show readiness assessment — scoped evaluation runs, domain-level breakdown, historical switching.*  
*Importance: ⭐⭐ — cover clearly but keep moving.*

| # | Type | Time | Visual | Script / Direction |
|---|------|------|--------|--------------------|
| 2A | 🖥 UI Demo | 0:30–0:45 | Click into **vcd1** → left sidebar → **Evaluations**. Tab loads. Header buttons: **EVALUATE** and **VIEW EVALUATION** (dropdown arrow). **Evaluation Details** panel: Name *May 14 (Provider Infra)*, State **Pending**, Last updated *05/14/2026, 01:09:39 PM*, Scope *Provider Infra*, circular progress indicator (Completed: 0, Failed: 0, Running: 0), START / STOP / RERUN inline controls. Scroll to show **Evaluation Summary** table (3 rows: Provider Infra / VCD Provider Infra / 27⚠ 5ℹ 3✓ / 543 steps; Coke / VCD Organization / 15⚠ 8ℹ 7✓ / 312; Pepsi / VCD Organization / 12⚠ 3ℹ 4✓ / 245) alongside **Most Common Issues** (Network overlap Alert×15, vApp template invalid storage class Alert×12, Edge gateway NSX-v only Warning×10). | See narration below. |
| 2B | 🖥 UI Demo | 0:45–0:55 | Click **VIEW EVALUATION** dropdown — 5 recent runs listed by date/name. Click **View All**. Modal opens: 10 evaluations, columns Last updated / Name / Scope / Metrics / State. One row highlighted blue (selected). SELECT button visible. | See narration below. |
| 2C | 🖥 UI Demo | 0:55–1:05 | Close modal. Click **EVALUATE**. **Start evaluation** modal opens — **All** (warns: several hours) or **Custom** (selected). Domain table: Provider Infra (unchecked), **Coke** (checked ✓), **Pepsi** (checked ✓), Nike (unchecked), Compute Cluster 1 (unchecked). Footer: 2 selected. START EVALUATION button. | See narration below. |
| 2D | 🎙 Dialogue | 1:05–1:10 | Quick avatar cut. | See dialogue below. |

### Narration & Dialogue

**TSVETOMIR (VO):** The **Evaluations** tab is where you assess readiness before touching anything. The current run — *May 14, Provider Infra scope* — is **Pending**. You have **Start**, **Stop**, and **Rerun** inline. Below, the **Evaluation Summary** breaks results by domain — Provider Infra, Coke, and Pepsi — each showing warning, info, and success metric counts and total step coverage. The **Most Common Issues** panel to the right surfaces what's recurring most: Network overlap at 15 alert occurrences, vApp template storage class issues at 12, and Edge gateway NSX-v only as a warning across 10. Click any row and the Issues table below filters dynamically.

**TSVETOMIR (VO):** **View Evaluation** switches between historical runs instantly. The **View All** modal gives the complete history — 10 evaluations here, with scope, metrics, and state. Select one and the whole tab refreshes to that run's data.

**TSVETOMIR (VO):** Starting a new evaluation with **Evaluate** lets you scope it precisely. **Custom** mode shows every domain — check only the ones you need. Here Coke and Pepsi are selected; everything else is skipped. Two domains, one targeted run.

**ROBERT:** So you don't have to wait for a full infrastructure scan just to re-check one organisation.

**TSVETOMIR:** Exactly. Let's look at the overview next.

---

## Scene 3 — Overview Tab
**Timecode: 1:10 – 1:40**  
*Purpose: portfolio-level visibility — all migrations and evaluations in one place.*  
*Importance: ⭐⭐⭐ — show the value clearly, one solid dialogue beat.*

| # | Type | Time | Visual | Script / Direction |
|---|------|------|--------|--------------------|
| 3A | 🖥 UI Demo | 1:10–1:25 | Click **Overview** in the left sidebar. Two scrollable panels side by side: **Migrations** (left) and **Evaluations** (right). Each shows truncated item names, status badges (*Ready For Migration*, *Waiting For Plan Review*, *Ready For Evaluation*), completion percentages (0%), last updated timestamps. Both panels have a **VIEW ALL** link and a filter icon. Scroll both panels to show depth. | See narration below. |
| 3B | 🖥 UI Demo | 1:25–1:33 | Click **filter icon** on the Evaluations panel. Dropdown: **All States**, Created, Completed, Failed, Pending, Running, Stopped, Stopping, **Ready For Evaluation**. | See narration below. |
| 3C | 🖥 UI Demo | 1:33–1:37 | Click **VIEW ALL** on Migrations. Modal: 23 migrations, page 1/2. Columns: **Name**, **State**, **Module Completion**, **Last updated**. States include Waiting For Plan Review, Ready For Migration, Created. | See narration below. |
| 3D | 🎙 Dialogue | 1:37–1:40 | Quick avatar cut. | See dialogue below. |

### Narration & Dialogue

**TSVETOMIR (VO):** The **Overview** tab is the portfolio view for the whole source. Two live panels side by side — **Migrations** and **Evaluations** — each a scrollable list showing name, status badge, completion percentage, and last updated. The filter on each panel narrows by state immediately; choose from eight options including Running, Failed, and Ready For Evaluation. **View All** opens a paginated modal — 23 migrations across two pages here — with full table sorting and column filters.

**ROBERT:** So this is the first stop before a standup — you see everything that's moving and everything that's blocked.

**TSVETOMIR:** In one page. No drilling in. Now let's go where the real detail lives — the migration itself.

---

## Scene 4 — Migration Details, History & Step Plan
**Timecode: 1:40 – 2:40**  
*Purpose: status cards + gauge + messages (⭐⭐⭐⭐), migration history (⭐⭐⭐), then the plan page as the bridge into step editing.*

| # | Type | Time | Visual | Script / Direction |
|---|------|------|--------|--------------------|
| 4A | 🖥 UI Demo | 1:40–1:55 | Navigate: **Provider Infrastructure Migration** tab → **nsxManager1 Infrastructure Migration**. Page loads. Header: **nsxManager1**, **VIEW MIGRATION WORKFLOW** top right. Three summary cards: **Status** (Migration: *Ready For Migration*, Evaluation: *Completed*), **Progress** donut (Completed: 0, Remaining: 12 — ring animated, orange arc visible), **Messages** (robot illustration, no active messages). Module table below: 12 rows, each with ✓ View evaluation link and ⚠ metric counts. Action bar: START MIGRATION, RERUN MIGRATION, ROLL BACK ALL, START EVALUATION. Right side: **MIGRATION HISTORY** ▾, VIEW MIGRATION MODULES. | See narration below. |
| 4B | 🖥 UI Demo | 1:55–2:08 | Toggle **Show Details** ON (top right). Description banner appears. Status card: Migration switches to **Running** (spinner animates). Progress donut updates: Completed 1, Remaining 11 (green arc appears). Messages: "Migration in Progress…" with spinner. Module row 1 (Configure NSX for Activating supervisor): Migration State → **Completed**. Module row 2 (Supervisor Migration Module): Plan column shows ⚠ View link, Migration State → **Waiting For Plan Review**. Let the spinner animate for 2 seconds. | See narration below. |
| 4C | 🖥 UI Demo | 2:08–2:18 | Click **MIGRATION HISTORY** ▾ dropdown. Show list of previous migration runs (dates, names, states). Cursor pauses on the list. | See narration below. |
| 4D | 🖥 UI Demo | 2:18–2:28 | Close history dropdown. Click **View** link on the Supervisor Migration Module plan (row 2). **Supervisor Migration Module** plan page loads. Yellow alert banner: *"Important: This migration plan contains steps with crucial user instructions. Review the steps carefully before proceeding."* Status card: Review Status **Pending**, Validation Status **Valid**, State **Waiting For Plan Review**. Progress donut: 0/5. Messages: *"Plan SUPERVISORS: WAITING FOR PLAN REVIEW"*. Steps table: 5 rows — Steps 1–4 Map, Step 5 Skip (Alerts **2⚠**, Instructions **4ℹ**, Target *supervisor-vc1*, Target Type *Supervisor*, State *Not Started*). Buttons: APPROVE, REJECT, SAVE AND VALIDATE. VIEW PLAN top right. | See narration below. |
| 4E | 🎙 Dialogue | 2:28–2:40 | Back to avatars. Robert questions. Tsvetomir bridges into step editing. | See dialogue below. |

### Narration & Dialogue

**TSVETOMIR (VO):** The **Provider Infrastructure Migration** page gives you three information cards across the top. **Status** shows migration state and evaluation state side by side — here *Ready For Migration* and *Completed*. **Progress** is a live donut gauge — 0 of 12 modules complete, the full ring unlit. **Messages** shows the robot illustration when there's nothing to flag. Together, these three cards tell you the health of the migration at a glance without reading a single table row.

**TSVETOMIR (VO):** Toggle **Show Details** and the picture changes. Migration flips to **Running** with a live spinner. The progress donut updates — one module complete, 11 remaining, the green arc appears. Messages shows "Migration in Progress". The first module, *Configure NSX for Activating supervisor*, shows **Completed**. The second, *Supervisor Migration Module*, has reached **Waiting For Plan Review** — the system generated a plan and is waiting for a human decision before it continues.

**TSVETOMIR (VO):** Before diving into that plan, the **Migration History** button. Click the dropdown and you get the list of previous migration runs for this source — dates, names, and their final states. If something went wrong in a prior run, you can pull up its state here without losing your place in the current one.

**TSVETOMIR (VO):** Clicking into the Supervisor module's plan opens the **Migration Plan Steps** page. A yellow banner immediately flags that this plan has steps with crucial user instructions. The status block shows **Waiting For Plan Review**. Five steps: the first four are **Map** activities — mapping Provider VDC entities to zones and zone cluster associations. Step 5 is a **Skip** with 2 alerts and 4 instructions. That's the step that needs attention.

**ROBERT:** The alerts and instructions are right in the table — you can see something needs reviewing before you even open anything.

**TSVETOMIR:** And you can read the full alert without opening the editor. Let me show you.

---

## Scene 5 — Step Details Side Panel & Edit Step Modal
**Timecode: 2:40 – 4:15**  
*Purpose: this is the centrepiece of the release. Give it full time, multiple dialogue beats, slow deliberate cursor.*  
*Importance: ⭐⭐⭐⭐⭐ (side panel ⭐⭐⭐⭐ + edit modal ⭐⭐⭐⭐⭐)*

| # | Type | Time | Visual | Script / Direction |
|---|------|------|--------|--------------------|
| 5A | 🖥 UI Demo | 2:40–2:55 | On the plan page, click the **three-dot menu** on Step 5. **Alerts & Notes** side panel slides in from the right. Panel header: *5. SupervisorStepConfig*. Two entries visible — a **Warning** block and an **Info / Instructions** block. Warning text: Supervisor configuration will be SKIPPED because an existing Supervisor was detected; it is assumed the Supervisor is already enabled and configured; if incorrect, change ACTION to CREATE. Three numbered expectations listed below. Cursor slowly scrolls through the panel content. | See narration below. |
| 5B | 🎙 Dialogue | 2:55–3:05 | Avatar cut — Robert reacts. | See dialogue below. |
| 5C | 🖥 UI Demo | 3:05–3:15 | Close side panel. Click the **edit action** on Step 5. **Edit SupervisorStepConfig Step** modal opens. **Customizations** tab is active. Two alert banners at the top: ⚠ Warning (same Supervisor skip message, dismissible ×), ℹ Info (instructions only needed if ACTION changes to CREATE, dismissible ×). Cursor pauses to let the banners read. | See narration below. |
| 5D | 🖥 UI Demo | 3:15–3:28 | Scroll past the banners. **Action** row: label *Action*, dropdown showing **Skip** (with chevron). Source block: **Name** field → *nsxTPvdc1*, **ID** field → full URN (read-only), **Type** dropdown → *Provider VDC*. Target block: **Name** field → *supervisor-vc1*, **ID** field → full URN (read-only), **Type** dropdown → *Supervisor*. Cursor hovers over the Action dropdown briefly, then moves to Source/Target fields. | See narration below. |
| 5E | 🖥 UI Demo | 3:28–3:40 | Scroll down. Additional property fields: **vCenterVcdBackingId** → full URN text, **vcfaNsxManagerId** → full URN text, **storageProfiles** → *Development* (dropdown). Cursor pauses on each field label for 1 second. | See narration below. |
| 5F | 🎙 Dialogue | 3:40–3:50 | Avatar cut — Robert asks about changing the action. | See dialogue below. |
| 5G | 🖥 UI Demo | 3:50–4:00 | Click **Info** tab in the modal. Left column label: **userInstructions**. Right panel: full instruction text — NOTE: instructions only needed if ACTION changes from SKIP to CREATE; describes Supervisor activation, wcpConfig structure, vSphere console import for rollback, DHCP requirements. Scroll slowly through the text. | See narration below. |
| 5H | 🖥 UI Demo | 4:00–4:08 | Switch back to **Customizations** tab. Click the **JSON view** toggle (top right of modal content area). View switches to the raw JSON editor — numbered lines, syntax-highlighted: stepClassName, id, authorType: SYSTEM, sourceEntityName, targetEntityName, action: SKIP, state: NOT_STARTED, userInstructions array, alerts array, notes array visible. Cursor scrolls slowly. | See narration below. |
| 5I | 🎙 Dialogue | 4:08–4:15 | Avatar cut — both characters close the feature. | See dialogue below. |

### Narration & Dialogue

**TSVETOMIR (VO):** Before opening the editor, the **Alerts & Notes side panel** gives you the full context for any step. For Step 5 — *SupervisorStepConfig* — the Warning explains exactly what the system decided: Supervisor configuration will be **skipped** because an existing Supervisor was detected. It assumes that Supervisor is already enabled and configured. If that assumption is wrong, the panel tells you what to change — switch the **Action** to **Create** and follow the instructions. Three numbered checks are listed so you know what to verify in vCenter before you commit. This is the triage layer — read it before you touch anything.

**ROBERT:** So you can make an informed decision from the side panel alone, without even opening the step editor.

**TSVETOMIR:** Exactly. And when you do open it, the editor is where the actual changes happen.

**TSVETOMIR (VO):** Clicking **Edit** opens the **Edit SupervisorStepConfig Step** modal on the **Customizations** tab. The same alerts from the side panel appear at the top as dismissible banners — Warning and Info — so the context follows you into the editor. Nothing is hidden once you're here.

**TSVETOMIR (VO):** The HTML form is structured in clear sections. The **Action** field is a dropdown — currently **Skip**. This is the primary control: change it to **Create** and the rest of the form adapts to what a Create operation needs. Below that, the **Source** block shows the mapped entity: name *nsxTPvdc1*, its full URN identifier, and type *Provider VDC* — selectable from a dropdown. The **Target** block mirrors this: *supervisor-vc1*, its URN, type *Supervisor*.

**TSVETOMIR (VO):** Scrolling down reveals the step-specific configuration fields. **vCenterVcdBackingId** — the URN of the vCenter backing the VCD deployment. **vcfaNsxManagerId** — the URN of the NSX Manager in the VCF Automation target. **storageProfiles** — currently set to *Development*, selectable from a dropdown. These are the properties that actually drive how the step executes. Every field is editable inline, and the form validates before you can save.

**ROBERT:** So if I need to change the storage profile or swap the target, it's just a dropdown — no JSON editing required?

**TSVETOMIR:** For most changes, yes. The form handles it. But for engineers who want direct access—

**TSVETOMIR (VO):** The **Info** tab holds the complete **userInstructions** text — the system-generated guidance for this step. Here it explains that these instructions are only relevant if you change the Action from Skip to Create. It walks through how Supervisor activation uses wcpConfig, how to extract that config for rollback via vSphere console import, and what DHCP requirements must be met for the management network. Read this tab when you're considering a non-default action.

**TSVETOMIR (VO):** And for engineers who prefer structured data, the **JSON view** exposes the full step configuration as raw, syntax-highlighted JSON. Every field visible in the form is here — stepClassName, id, authorType set to SYSTEM, source and target entity names and IDs, action, state, and the full arrays for userInstructions, alerts, and notes. Edit directly here if you need to, then save.

**ROBERT:** Two interfaces, same data — form for speed, JSON for precision.

**TSVETOMIR:** That's the design. Approve the plan once you're satisfied, and the migration engine picks up from there.

---

## Scene 6 — Cards List & Adding a New Source
**Timecode: 4:15 – 4:40**  
*Purpose: show entry point — source cards and multi-source support.*  
*Importance: ⭐⭐ — keep it brisk, one VO pass, one dialogue exchange.*

| # | Type | Time | Visual | Script / Direction |
|---|------|------|--------|--------------------|
| 6A | 🖥 UI Demo | 4:15–4:25 | Navigate back to the root **Migration** page. Two cards: **vc1** (minimal, no status, Actions button) and **vcd1** (Ready badge, "11 successful checks", readiness timestamp `05/06/2026, 07:28:42 PM`, **MIGRATE** button). Slow pan. Click **ADD MIGRATION SOURCE** dropdown: VMware Cloud Director Site, Telco Cloud, VM Apps Organization, vCenter. | See narration below. |
| 6B | 🖥 UI Demo | 4:25–4:33 | Click **VMware Cloud Director Site**. Modal opens: **Add VMware Cloud Director Site** — fields **Site name** (validation error: "Input is required"), **URL**, **Username**, **Password**. CANCEL / SAVE buttons. | See narration below. |
| 6C | 🎙 Dialogue | 4:33–4:40 | Quick avatar cut. | See dialogue below. |

### Narration & Dialogue

**TSVETOMIR (VO):** The **Migration** cards page is the entry point. Every connected source has a card — **vcd1** here is **Ready**, 11 successful precheck results, MIGRATE button right there. To add a new source, **Add Migration Source** now offers four types: **VMware Cloud Director Site**, **Telco Cloud**, **VM Apps Organization**, and **vCenter**. Select one — here, VMware Cloud Director Site — fill in the site name, URL, and credentials, save, and the new card joins the list.

**ROBERT:** Multi-source from the start — you connect everything once and manage it all from this one page.

**TSVETOMIR:** That's the idea. One tool for the full infrastructure migration portfolio.

---

## Scene 7 — Closing
**Timecode: 4:40 – 5:00**

| # | Type | Time | Visual | Script / Direction |
|---|------|------|--------|--------------------|
| 7A | 🎙 Dialogue | 4:40–4:52 | Both avatars. Peer wrap-up. | See dialogue below. |
| 7B | 🎬 Cinematic | 4:52–5:00 | Slow fade back to the Migration cards page — **vcd1** Ready badge. Fade to app logo. Ambient music returns. End card or CTA. | Closing VO below. |

### Dialogue

**ROBERT:** So to map it out — cards for source setup, evaluations for readiness, overview for the portfolio view, migration details for module tracking and history, and then the plan steps with the side panel and the full step editor for the precision work.

**TSVETOMIR:** And the editor is where most of the new value is. HTML form for the properties, alerts and instructions always visible, JSON view when you need it. Every decision the system made is surfaced and overridable.

**ROBERT:** One mental model across all of it.

**TSVETOMIR (VO):** Migrator — cloud infrastructure migration, redesigned for teams that move fast.

---

## Production Notes

### VideoAI Configuration

| Setting | Recommendation |
|---------|---------------|
| Aspect Ratio | 16:9 (1920×1080 for export) |
| Avatar Style | Talking head — chest up. No full body needed. |
| Background | Blurred neutral office. Avoid bright patterns. |
| Voice | Tsvetomir and Robert: similar pace (~135 wpm). Equal authority — neither slower nor more formal. |
| Transitions | Alternating cuts. Simple cut or 0.3s crossfade. No flashy wipes. |
| Music | Low ambient underscore (~30% volume). Fade out during UI demos. |
| Captions | Enable auto-captions in VideoAI for accessibility. |

### Screen Recording Notes by Scene

| Scene | Priority | Key moments to capture |
|-------|----------|------------------------|
| 2A | ⭐⭐ | Evaluation Details header + Evaluation Summary + Most Common Issues all visible |
| 2B | ⭐⭐ | View Evaluation modal — 10 rows, one selected row highlighted blue |
| 2C | ⭐⭐ | Start evaluation modal — Custom selected, Coke + Pepsi checked |
| 3A | ⭐⭐⭐ | Both Migrations and Evaluations panels side by side; scroll each |
| 3B | ⭐⭐⭐ | Filter dropdown — all 8 state options readable |
| 3C | ⭐⭐⭐ | View All modal — 23 migrations, page 1/2, state badges readable |
| 4A | ⭐⭐⭐⭐ | All three status cards visible; donut gauge and robot illustration readable |
| 4B | ⭐⭐⭐⭐ | Running spinner; donut updating; row 1 Completed, row 2 Waiting For Plan Review |
| 4C | ⭐⭐⭐ | Migration History dropdown open — previous runs listed |
| 4D | ⭐⭐⭐⭐ | Yellow banner readable; Step 5 row with 2⚠ and 4ℹ badges visible |
| 5A | ⭐⭐⭐⭐ | Alerts & Notes side panel fully open; Warning text and 3 numbered points readable |
| 5C | ⭐⭐⭐⭐⭐ | Edit modal open — both alert banners readable before scrolling |
| 5D | ⭐⭐⭐⭐⭐ | Action dropdown (Skip), Source/Target blocks — cursor pauses on each field |
| 5E | ⭐⭐⭐⭐⭐ | vCenterVcdBackingId, vcfaNsxManagerId, storageProfiles (Development) — all readable |
| 5G | ⭐⭐⭐⭐⭐ | Info tab — userInstructions text fully visible, scroll slowly |
| 5H | ⭐⭐⭐⭐⭐ | JSON view — stepClassName through notes array visible, syntax highlighting clear |
| 6A | ⭐⭐ | Both cards visible; ADD MIGRATION SOURCE dropdown with all 4 options |
| 6B | ⭐⭐ | Add VMware Cloud Director Site modal — "Input is required" on Site name |

### Cursor Pacing by Importance

- **Scenes 5C–5H (edit modal):** Slow — pause 2–3 seconds on each field label before moving on. This is the feature viewers need to understand in detail.
- **Scene 5A (side panel):** Medium-slow — scroll the panel content deliberately.
- **Scenes 4A–4B (status cards/gauge):** Medium — let the Running animation play out for at least 2 seconds.
- **Scenes 2–3 (evaluations, overview):** Medium — keep moving, one pass per panel.
- **Scene 6 (cards):** Brisk — single pass, no lingering.

### Editing & Assembly Order

1. Assemble all screen recordings first. Trim and colour-grade.
2. Generate VideoAI avatar clips using the dialogue from this script.
3. Layer Tsvetomir VO audio over UI demo segments (Scenes 2–6).
4. Insert avatar clips at dialogue timestamps.
5. Add music and mix audio levels.
6. Review lip-sync accuracy on avatar segments.
7. Export: H.264, 1920×1080, ~8 Mbps for web delivery.

---

*Migrator UI Feature Video Script · VideoAI Production · v1.3 · Importance-weighted · Verified against UI screenshots*