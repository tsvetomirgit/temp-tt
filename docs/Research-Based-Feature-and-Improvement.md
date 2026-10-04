# Migrator: Research-Based Feature and Improvement Ideas

A complete write-up for the Migrator UI (VCD → VCFA and other migration types): analysis of the current tool, research on similar products, feature ideas with UI sketches and links, a prioritized roadmap and a link index.

---

## Table of Contents

1. [Scope, sources and caveats](#1-scope-sources-and-caveats)
2. [Analysis of the current Migrator](#2-analysis-of-the-current-migrator)
3. [Research summary: what other tools do](#3-research-summary-what-other-tools-do)
4. [Feature and improvement ideas](#4-feature-and-improvement-ideas)
   - A. Evaluation and readiness
   - B. Plan review and step editing
   - C. Execution and control
   - D. Hooks, pre-flight and automation
   - E. Validation, drift and reporting
   - F. Waves, grouping and portfolio planning
   - G. Sources and onboarding
   - H. Governance, security and operations
   - I. Platform and multi-type architecture
   - J. UI polish and Clarity implementation notes
5. [Prioritized roadmap](#5-prioritized-roadmap)
6. [Appendix: design sketches](#6-appendix-design-sketches)
7. [Link index](#7-link-index)
8. [Possible next steps](#8-possible-next-steps)

---

## 1. Scope, sources and caveats

**Input about Migrator**
- `Migrator_Video_Script.md` (video production script, v1.3) and 18 UI screenshots dated 2026-05-14.
- Stack from earlier conversation: Angular, Clarity Design System, Module Federation with Webpack.

**Research**
- Round 1: Broadcom's VCD → VCFA Edge Gateway Firewall migration docs, the architect's field guide on VCD → VCFA, Nutanix Move, Proxmox import wizard, Azure Migrate, AWS MGN, Xen Orchestra, VMware HCX, Red Hat Migration Toolkit for Virtualization (Forklift), AWS DMS, Google Migrate to Virtual Machines.
- Round 2: Atlassian Jira Cloud Migration Assistant, Azure Migrate wave planning and dependency analysis, Konveyor/Tackle (application assessment), AWS MGN post-launch actions, AWS Cloud Migration Factory, Liquibase (database change management), Veeam Recovery Orchestrator, HCP Terraform (runs, policies, notifications).

**Caveats**
- Statements about Migrator come only from the screenshots and the script; correct anything I misread.
- I read documentation pages and search excerpts. I did not open vendor screenshots or videos, so links point to documentation pages, not to specific images.
- I found no public video of the VCD → VCFA Migration Tool itself, and its full migration documentation is gated by Broadcom.
- Some Veeam links point to archived versions of the docs because those pages carried the clearest wording.
- Effort and impact ratings in this file (S / M / L, H / M / L) are my rough estimates, not measured values.

---

## 2. Analysis of the current Migrator

### 2.1 What already exists

| Area | What the screenshots and script show |
| :--- | :--- |
| Source cards | Migration page with cards per source (vc1, vcd1). vcd1 shows a Ready badge, "11 successful checks", a readiness timestamp, MIGRATE and ACTIONS. Regenerate/Copy migration keys. |
| Source types | Add Migration Source: VMware Cloud Director Site, Telco Cloud, VM Apps Organization, vCenter. |
| Add source | Modal with Site name, URL, Username, Password, inline validation. |
| Overview | Two live panels (Migrations, Evaluations) with state badges, percentages, last updated, state filter (8 states), View All modal (paginated, 23 migrations). |
| Evaluations | Evaluate (scope All or Custom domain picker), View Evaluation (history dropdown plus modal with 10 runs), Evaluation Details (state, scope, Start / Stop / Rerun), Evaluation Summary per domain (warning / info / success counts, steps), Most Common Issues, filtered Issues table linking to Migration, Plan and Evaluation. |
| Provider infra migration | Status, Progress (donut) and Messages cards; module table with Evaluation, Evaluation Metrics, Plan, Plan Metrics and Migration State; Start / Rerun / Roll Back All / Start Evaluation; Migration History; View Migration Workflow; Show Details toggle. |
| Plan review | Waiting For Plan Review state, Review Status and Validation Status, Approve / Reject / Save and Validate, steps table (Map / Skip, alerts, notes, instructions, source, target, state), yellow banner for crucial user instructions. |
| Step editing | Alerts and Notes side panel; Edit Step modal with Customizations form, Info tab (userInstructions) and JSON view. |

### 2.2 Strengths relative to similar tools

- A real dry-run (evaluation) with scope control, which many migration tools lack.
- Human-in-the-loop plan review before execution, including approve and reject.
- The form and JSON views serve both fast and expert users.
- Alerts are visible in the table, in the side panel and in the editor.
- The step JSON already contains hooks for richer features (see 2.4).
- Several source types already appear in "Add Migration Source".

### 2.3 Issues visible in the screenshots

| # | Observation | Suggested fix |
| :--- | :--- | :--- |
| 1 | Pagination text "1 - 10 of 0 Most Common Issues" while 3 rows are shown. | Fix the total count. |
| 2 | Severity colours look reversed: "Alert" is amber and "Warning" has a red outline. | Check against the severity model; align with Clarity status colours. |
| 3 | Every row in the View Evaluation modal shows Pending with 0 / 0 / 0 metrics. | Verify whether this is test data; if not, show final state and metrics per run. |
| 4 | Overview items are named "Migration 8d8897da-…" (GUIDs) and evaluation names are truncated. | Add readable names, scope, owner; show a tooltip on truncated text. |
| 5 | The vc1 card is empty (no status). | Add an empty or "not yet checked" state with a "Run readiness check" button. |
| 6 | Donut shows only Completed / Remaining. | Add duration, ETA and a Failed / Skipped segment. |
| 7 | Evaluation metrics icons (warning, info, third icon) are small and unlabelled. | Add labels or a legend. |

### 2.4 Gaps and hints found in the data model

- **Hints in the step JSON** (screenshot 10): `authorType: "SYSTEM"`, `fieldUserInstructions: {}`, `suggestedUserInputs: {}`, `subplanRef: null`, `notes: []`, `alerts: [...]`. These suggest features already planned or possible: user-vs-system authorship, per-field hints, suggested values, sub-plans and comments.
- **No post-migration stage** in the script: nothing about validation, reports, or sign-off after the run.
- **No scheduling, notifications, hooks or audit trail** mentioned.
- **No comparison between evaluations** and no way to accept or waive an issue.
- **Portfolio level:** no wave or grouping concept beyond per-organization migration tabs.

---

## 3. Research summary: what other tools do

### 3.1 Round 1: infrastructure and VM migration tools

| Tool | Notable features | Links |
| :--- | :--- | :--- |
| VCD → VCFA Migration Tool (Broadcom) | Sync before migrate; fixed ordering; Org → module → gateway → rule status drill-down; Skip with reason; evaluation and remediation loop; all-or-nothing per gateway; manual post-migration audit; pages for rollback and troubleshooting. | [Migrate](https://techdocs.broadcom.com/us/en/vmware-security-load-balancing/vdefend/vdefend-firewall/9-1/edge-gateway-firewall-migration/edge-firewall-migration-workflow.html), [Auditing and Remediation](https://techdocs.broadcom.com/us/en/vmware-security-load-balancing/vdefend/vdefend-firewall/9-1/edge-gateway-firewall-migration/auditing-and-remediation-workflow.html), [Post-migration validation](https://techdocs.broadcom.com/us/en/vmware-security-load-balancing/vdefend/vdefend-firewall/9-1/edge-gateway-firewall-migration/post-migration-validation-and-workload-transition.html) |
| Architect's field guide (VCD → VCFA) | Construct mapping, tenant classification, wave planning, IP continuity, API caller inventory, communication per tenant. | [Field guide](https://theaistack.blog/2026/07/31/from-org-vdc-to-namespace-the-architects-field-guide-to-vcd-%e2%86%92-vcfa-migration/) |
| VCD 10.6.2 announcement | Environment Assessment Tool, migration service connection. | [Broadcom blog](https://blogs.vmware.com/cloudprovider/2026/09/announcing-vmware-cloud-director-10-6-2-enabling-your-migration-to-vmware-cloud-foundation-9-1.html) |
| Nutanix Move | Plans with states, warm migration, test and cutover actions, API with actions (cutover, test, retest, undotest, retry, discard, abort). | [Product](https://www.nutanix.com/products/move), [Workflow](https://next.nutanix.com/move-application-migration-19/move-migration-workflow-40414), [API](https://www.nutanix.dev/api_reference/apis/move.html), [Ansible scheduling](https://www.nutanix.dev/2021/06/01/nutanix-move-automation-using-ansible-with-migration-plans/) |
| Proxmox import wizard | "Resulting Config" preview, network and storage mapping. | [Wiki](https://pve.proxmox.com/wiki/Migrate_to_Proxmox_VE), [StorageReview](https://www.storagereview.com/review/how-it-works-proxmox-import-wizard-vmware-migration-tool) |
| Azure Migrate | Readiness states with remediation, assessments. | [Review assessment](https://learn.microsoft.com/en-us/azure/migrate/review-assessment?view=migrate) |
| AWS MGN | Lifecycle states with "Next step" and alerts, test and cutover instances. | [Dashboard](https://docs.aws.amazon.com/mgn/latest/ug/migration-dashboard.html), [Cutover](https://docs.aws.amazon.com/mgn/latest/ug/starting-cutover.html), [Test and cutover](https://docs.aws.amazon.com/es_es/mgn/latest/ug/server-test-cutover-main.html) |
| VMware HCX | Waves and Mobility Groups, CSV import/export, commit that locks membership, capacity validation. | [Broadcom docs](https://techdocs.broadcom.com/us/en/vmware-cis/vcf/vcf-9-0-and-later/9-0/workload-mobility/vmware-hcx-user-guide-vcf-9-0/migrating-virtual-machines-with-vmware-hcx/migrating-mobility-groups-from-migration-waves/migrating-mobility-group-workloads-in-migration-waves.html), [vStellar](https://vstellar.com/2020/09/hcx-mobility-groups/), [PowerCLI](https://developer.broadcom.com/powercli/latest/vmware.vimautomation.hcx/commands/new-hcxmobilitygroup) |
| Red Hat MTV / Forklift | Provider + mapping + plan model, validation "concerns" with severity, custom rules, hooks, pre-flight inspection. | [GitHub](https://github.com/kubev2v/forklift), [Advanced options](https://docs.redhat.com/en/documentation/migration_toolkit_for_virtualization/2.6/html/installing_and_using_the_migration_toolkit_for_virtualization/advanced-migration-options_mtv), [2.10 notes](https://docs.redhat.com/en/documentation/migration_toolkit_for_virtualization/2.10/html/release_notes/rn-2-10_release-notes) |
| AWS DMS | Data validation states and counts, validation-only task, data resync. | [Validation](https://docs.aws.amazon.com/dms/latest/userguide/CHAP_Validating.html), [Resync](https://docs.aws.amazon.com/dms/latest/userguide/CHAP_Validating.DataResync.html) |
| Google Migrate to VMs | Adaptation reports during replication, test-clone and cutover. | [Progress details](https://docs.cloud.google.com/migrate/virtual-machines/docs/5.0/migrate/migration-progress-details) |

### 3.2 Round 2: additional tools and what they add

| Tool | Domain | Notable features | Links |
| :--- | :--- | :--- | :--- |
| Jira Cloud Migration Assistant | SaaS / app migration | Migrations dashboard with progress; pre-migration checks that show warnings and errors; successful check results cached to speed up re-runs (kept 30 days); advice to run checks days before migration day; downloadable pre- and post-migration reports and error logs; per-app statuses (for example timed out) and retry of an app migration; "app vendor checks"; manual pre-migration checklist for things the tool cannot check. | [Dashboard](https://support.atlassian.com/migration/docs/manage-and-view-the-details-of-jira-migration-plans/), [Run pre-migration checks](https://support.atlassian.com/migration/docs/run-pre-migration-checks-review-and-run-a-jira-migration/), [Checklist](https://support.atlassian.com/migration/docs/jira-pre-migration-checklist/), [App vendor checks](https://support.atlassian.com/migration/docs/app-vendor-checks/) |
| Azure Migrate (waves and dependencies) | Infrastructure planning | Wave planning (public preview): group and sequence applications by tags, dependency analysis and workload data; application-centric tracking; start migration from inside the wave. Dependency analysis shows what talks to what; business case estimates cost and savings. Cloud Adoption Framework guidance: group dependent systems in the same wave, group together when dependency criticality is uncertain, document each group's constraints, run current waves while planning future ones. | [Wave planning](https://techcommunity.microsoft.com/blog/azuremigrationblog/-/4467959), [CAF wave planning](https://learn.microsoft.com/en-us/azure/cloud-adoption-framework/migrate/migration-wave-planning), [Azure Migrate overview](https://learn.microsoft.com/en-us/azure/migrate/migrate-v1) |
| Konveyor / Tackle / MTA | Application modernization | Questionnaire-based assessment; custom questionnaires authored and versioned in YAML; multiple questionnaires per application; archetypes (assess a group of similar apps once); copy or bulk-copy assessments between applications; dynamic reports generated on demand for one or more applications; users asked to review an application without a mandatory assessment because the built-in one was too opinionated. | [Konveyor 0.3.0](https://www.cncf.io/blog/2024/01/31/konveyor-0-3-0-release-announcement/), [Enhanced assessment](https://issues.redhat.com/browse/MTA-1179), [Review without assessment](https://issues.redhat.com/browse/MTA-115), [Dynamic reports](https://issues.redhat.com/browse/MTA-1177), [Tackle assessment epic](https://issues.redhat.com/browse/TACKLE-9) |
| AWS MGN post-launch actions | Automation after cutover | Post-launch template (defaults) with per-server overrides and an on/off toggle; predefined actions plus custom actions that run any SSM document; a default, latest or specific version of an action; dynamic parameters such as the launched instance ID; encrypted parameters; applications grouped into waves. AWS Transform (Aug 2026) lets users define actions at account level and apply them across target accounts, with post-launch actions included in the bulk-edit inventory file. | [Post-launch settings](https://docs.aws.amazon.com/mgn/latest/ug/source-post-launch-settings.html), [Templates](https://docs.aws.amazon.com/mgn/latest/ug/mgn-initialization-templates.html), [Patching with waves](https://aws.amazon.com/blogs/mt/migrating-and-automating-patching-at-scale-with-aws-application-migration-service/), [AWS Transform announcement](https://aws.amazon.com/about-aws/whats-new/2026/08/aws-transform-for-migrations-automates-post-launch-actions) |
| AWS Cloud Migration Factory | Large-scale orchestration | Predefined phases (pre-migration, implementation, post-migration); predefined tasks (verify prerequisites, push agent, verify replication, boot-test, schedule cutover window); waves run in parallel; v3 adds an overview dashboard with counts of waves, applications, servers and databases, a Jobs page listing every action started from the console, remote execution of scripts from the console, and import/export of migration metadata. | [Workflow](https://docs.aws.amazon.com/prescriptive-guidance/latest/migration-factory-cloudendure/workflow.html), [Version 3](https://aws.amazon.com/blogs/mt/accelerate-your-migration-with-version-3-of-aws-cloud-migration-factory) |
| Liquibase | Database change management | Policy checks with configurable severity that return an exit code to stop automated jobs; a check that every change has a rollback; drift reports with configurable allowed drift; rollback reports and update reports; targeted rollback of a single change; flows that orchestrate workflows; structured logging. | [Drift reports](https://docs.liquibase.com/drift-reports), [Release 4.27](https://liquibase.com/blog/release-liquibase-pro-4-27-0), [Rollback Required check](https://docs.liquibase.com/secure/user-guide-5-2/policy-check-library/rollbackrequired), [User guide](https://docs.liquibase.com/pro/user-guide) |
| Veeam Recovery Orchestrator | Disaster-recovery orchestration | Readiness check that is low-impact, runs automatically each day for enabled plans, and is recommended after creating or editing a plan and after infrastructure changes; plan definition and readiness reports generated at different lifecycle stages; isolated test environment; dashboard for RPO and RTO achievement; roles such as administrator, plan author and plan operator. | [Overview](https://helpcenter.veeam.com/docs/vro/userguide/overview.html?ver=13), [Readiness check (archived docs)](https://helpcenter.veeam.com/archive/vdro/60/userguide/running_readiness_check.html), [Testing and reports](https://community.veeam.com/onboarding-for-veeam-data-platform-163/onboarding-for-veeam-recovery-orchestrator-step-7-testing-orchestration-plans-configuring-reports-10045) |
| HCP Terraform | Infrastructure as code | Run workflow with a "Needs Attention" event when a plan waits for approval or a policy override; notifications through webhooks and Slack; run tasks that add custom logic at stages of a run; policy sets; health assessments with drift detection and continuous validation. | [Notifications](https://developer.hashicorp.com/terraform/docs/cloud/workspaces/notifications), [Organization settings (run tasks, policy sets, health)](https://developer.hashicorp.com/terraform/enterprise/users-teams-organizations/organizations/settings) |

---

## 4. Feature and improvement ideas

Rating key: **Impact** H / M / L, **Effort** S / M / L (rough estimates).

### A. Evaluation and readiness

#### A1. Compare two evaluations (trend and diff)
- **Problem:** Users fix issues in the source and re-evaluate but cannot see what changed.
- **Idea:** Choose two runs and see New, Resolved and Unchanged issues, with counts per domain.
- **UI:** A "Compare" button in View Evaluation; two selectors; a datagrid grouped into three sections; a small trend chart of blockers over time.
- **Inspired by:** Broadcom remediation loop; Liquibase drift reports and update reports; Azure Migrate readiness reports.
- **Links:** [Auditing and Remediation](https://techdocs.broadcom.com/us/en/vmware-security-load-balancing/vdefend/vdefend-firewall/9-1/edge-gateway-firewall-migration/auditing-and-remediation-workflow.html), [Liquibase drift reports](https://docs.liquibase.com/drift-reports)
- **Impact / Effort:** H / M

#### A2. Targeted re-check of one issue
- **Idea:** A "Re-check" button per issue that re-runs only the affected scope (you already have scoped evaluations) and updates the issue to Resolved or Still open.
- **Impact / Effort:** H / S–M

#### A3. Cached check results with expiry and stale warning
- **Idea:** Keep successful check results for a defined time so re-runs are fast, show the age ("checked 3 days ago"), and flag results as stale when the source has changed. Recommend running checks days before the migration date.
- **UI:** Age badge on the source card ("Readiness checks updated at …" already exists), a Refresh button, an amber "Stale" state.
- **Inspired by:** Jira Cloud Migration Assistant (cached results kept 30 days); Veeam (check after infrastructure changes); Broadcom "Sync".
- **Links:** [Jira pre-migration checks](https://support.atlassian.com/migration/docs/run-pre-migration-checks-review-and-run-a-jira-migration/), [Veeam readiness check](https://helpcenter.veeam.com/archive/vdro/60/userguide/running_readiness_check.html)
- **Impact / Effort:** M–H / M

#### A4. Scheduled automatic readiness checks
- **Idea:** Run a lightweight readiness check on a schedule for every approved plan and notify when it turns from Ready to Not ready.
- **Inspired by:** Veeam Recovery Orchestrator (daily automatic checks); HCP Terraform health assessments.
- **Links:** [Veeam](https://helpcenter.veeam.com/archive/vdro/60/userguide/running_readiness_check.html), [Terraform org settings](https://developer.hashicorp.com/terraform/enterprise/users-teams-organizations/organizations/settings)
- **Impact / Effort:** M / M

#### A5. Severity model, waivers and policy checks
- **Idea:** Configurable severities (info, warning, blocker); a "waive with justification" action recording who, why and until when; policies that can be set to block or only warn (like exit codes in Liquibase); override allowed only for specific roles (like a policy override in Terraform).
- **UI:** Issue row actions "Waive / Accept risk"; a "Policies" admin page; a "Waived" filter chip.
- **Inspired by:** Red Hat MTV validation concerns; Liquibase policy checks; Terraform policy sets and overrides.
- **Links:** [MTV validation](https://docs.redhat.com/en/documentation/migration_toolkit_for_virtualization/2.6/html/installing_and_using_the_migration_toolkit_for_virtualization/advanced-migration-options_mtv), [Liquibase user guide](https://docs.liquibase.com/pro/user-guide), [Terraform org settings](https://developer.hashicorp.com/terraform/enterprise/users-teams-organizations/organizations/settings)
- **Impact / Effort:** H / M

#### A6. "Irreversible step" detection
- **Idea:** During evaluation mark steps with no rollback path (for example Supervisor activation), and require an extra confirmation or backup hook before them.
- **Inspired by:** Liquibase "Rollback Required" check.
- **Link:** [Rollback Required](https://docs.liquibase.com/secure/user-guide-5-2/policy-check-library/rollbackrequired)
- **Impact / Effort:** M–H / S–M

#### A7. Readiness gate
- **Idea:** Disable MIGRATE (or show a confirm dialog with reasons) while unwaived blockers exist; show "3 blockers, 12 warnings" on the source card.
- **Impact / Effort:** H / S

#### A8. Checklist for what the tool cannot check
- **Idea:** A manual checklist (for example backups taken, change ticket approved, tenants notified) that must be ticked before migration. Jira's assistant ships a checklist because it "won't check for everything".
- **Link:** [Jira checklist](https://support.atlassian.com/migration/docs/jira-pre-migration-checklist/)
- **Impact / Effort:** M / S

#### A9. Pre-migration report download
- **Idea:** Export what will be migrated, issues, waivers and mappings as PDF or CSV before starting; keep it attached to the run.
- **Link:** [Jira dashboard and reports](https://support.atlassian.com/migration/docs/manage-and-view-the-details-of-jira-migration-plans/)
- **Impact / Effort:** M / S–M

### B. Plan review and step editing

#### B1. Diff against the system-generated plan
- **Idea:** Use `authorType` to show a "Modified by user" badge per step and a before/after view; add "Reset to default".
- **UI:** Badge in the steps table; "Changes" tab in the edit modal; plan-level "Show only modified steps" filter.
- **Inspired by:** Terraform plan review; Proxmox "Resulting Config".
- **Impact / Effort:** H / M

#### B2. Field-level hints and suggested values
- **Idea:** Render `fieldUserInstructions` as inline help and `suggestedUserInputs` as one-click value chips under each field. Move long text from the Info tab to where it applies.
- **UI:** Clarity signpost or helper text per field; "Use suggested" link.
- **Impact / Effort:** H / S–M

#### B3. Comments, approvals and review history
- **Idea:** Threaded comments on steps (using `notes`), reviewer different from author, approval recorded with name and time, optional two-person approval.
- **Inspired by:** Terraform "Needs Attention" approval flow; Veeam roles (plan author vs operator).
- **Links:** [Terraform notifications](https://developer.hashicorp.com/terraform/docs/cloud/workspaces/notifications), [Veeam testing and reports](https://community.veeam.com/onboarding-for-veeam-data-platform-163/onboarding-for-veeam-recovery-orchestrator-step-7-testing-orchestration-plans-configuring-reports-10045)
- **Impact / Effort:** H / M

#### B4. Bulk actions and quick approve
- **Idea:** Multi-select steps to change an action or mark as reviewed; "Approve all steps without alerts"; keyboard navigation between steps in the editor (next / previous).
- **Impact / Effort:** M / S–M

#### B5. Plan export, import and templates
- **Idea:** Export a reviewed plan as JSON or YAML; import into a similar tenant; versioned plan templates.
- **Inspired by:** HCX CSV import/export; Cloud Migration Factory import/export of metadata; AWS Transform bulk inventory file.
- **Links:** [HCX](https://techdocs.broadcom.com/us/en/vmware-cis/vcf/vcf-9-0-and-later/9-0/workload-mobility/vmware-hcx-user-guide-vcf-9-0/migrating-virtual-machines-with-vmware-hcx/migrating-mobility-groups-from-migration-waves/migrating-mobility-group-workloads-in-migration-waves.html), [CMF v3](https://aws.amazon.com/blogs/mt/accelerate-your-migration-with-version-3-of-aws-cloud-migration-factory), [AWS Transform](https://aws.amazon.com/about-aws/whats-new/2026/08/aws-transform-for-migrations-automates-post-launch-actions)
- **Impact / Effort:** M–H / M

#### B6. Editor safety
- **Idea:** Dirty-state indicator and "discard changes?" prompt; validate JSON and form together (an error in JSON highlights the form field); show a validation summary after "Save and Validate"; a "Resulting config" preview before approving.
- **Impact / Effort:** M / S–M

#### B7. Reuse decisions (copy to similar items)
- **Idea:** "Apply this decision to similar steps/tenants" and bulk copy, as Tackle allows copying assessments between applications.
- **Link:** [Tackle assessment epic](https://issues.redhat.com/browse/TACKLE-9)
- **Impact / Effort:** M / M

#### B8. Flexible review (do not force a rigid path)
- **Idea:** Konveyor users asked for a way to review without completing the built-in assessment. Allow an expert to skip an optional step with a recorded reason instead of blocking them.
- **Link:** [MTA-115](https://issues.redhat.com/browse/MTA-115)
- **Impact / Effort:** M / S

### C. Execution and control

#### C1. Live workflow graph
- **Idea:** Turn "View Migration Workflow" into a live DAG with node colours for state, click to open the module, and show which modules wait on which.
- **Impact / Effort:** M–H / M

#### C2. Timeline and run history detail
- **Idea:** Per run, a timeline of events (started, plan review waiting, approved, step failed, retried) with timestamps and users. A Clarity timeline component fits.
- **Inspired by:** Cloud Migration Factory Jobs page listing every action started.
- **Link:** [CMF v3](https://aws.amazon.com/blogs/mt/accelerate-your-migration-with-version-3-of-aws-cloud-migration-factory)
- **Impact / Effort:** M–H / M

#### C3. Duration, ETA and richer progress
- **Idea:** Per module duration and estimated remaining time based on past runs; donut with Completed, Running, Waiting, Failed and Skipped segments; elapsed time on the page header.
- **Impact / Effort:** M / M

#### C4. Per-item control: pause, retry, skip, targeted rollback
- **Idea:** Row menu actions on a module or step. Replace "Roll Back All" as the only option with rollback of one module or step, with a preview of what will be undone and a rollback report.
- **Inspired by:** Liquibase targeted rollbacks and rollback reports; Jira per-app retry; Nutanix plan actions (retry, undotest, abort).
- **Links:** [Liquibase release 4.27](https://liquibase.com/blog/release-liquibase-pro-4-27-0), [Jira dashboard](https://support.atlassian.com/migration/docs/manage-and-view-the-details-of-jira-migration-plans/), [Nutanix Move API](https://www.nutanix.dev/api_reference/apis/move.html)
- **Impact / Effort:** H / M–L (depends on backend support)

#### C5. Lifecycle "Next step" column
- **Idea:** Each module row shows the single recommended next action as a button.
- **Link:** [AWS MGN dashboard](https://docs.aws.amazon.com/mgn/latest/ug/migration-dashboard.html)
- **Impact / Effort:** M / S

#### C6. Scheduling and maintenance windows
- **Idea:** Choose a start time or window; block starting outside the window; show upcoming scheduled runs on the Overview.
- **Link:** [Ansible cutover scheduling for Nutanix Move](https://www.nutanix.dev/2021/06/01/nutanix-move-automation-using-ansible-with-migration-plans/)
- **Impact / Effort:** M / M

#### C7. Notifications
- **Idea:** Email, webhook, Slack or Teams for events: Waiting For Plan Review (the blocking state), Failed, Completed, Stale readiness. Allow per-event subscriptions.
- **Inspired by:** HCP Terraform notifications (including "Needs Attention").
- **Link:** [Terraform notifications](https://developer.hashicorp.com/terraform/docs/cloud/workspaces/notifications)
- **Impact / Effort:** H / M

#### C8. Concurrency and batch limits
- **Idea:** Setting for how many modules or tenants run in parallel; warning when selection exceeds a recommended batch size.
- **Impact / Effort:** M / M

### D. Hooks, pre-flight and automation

#### D1. What hooks are useful for

**Before a migration or step (pre-hooks)**
- Change-management gates: create or check a ticket (Jira, ServiceNow) and block until approved.
- Backups and snapshots: export the source configuration (for example `wcpConfig` before the Supervisor step).
- Quiesce or pause workloads, put monitoring in maintenance mode, silence alerts.
- Freeze other changes on the source.
- Customer-specific environment checks (DHCP reachable, firewall rule present, licence valid).

**After a migration or step (post-hooks)**
- Smoke tests against the target (API, connectivity, namespace responds).
- Notifications (Slack, Teams, email) and tickets.
- Update external systems (CMDB, DNS, billing or metering tags, monitoring).
- Re-enable what was paused.
- Trigger post-migration validation or an external test suite.

**On failure**
- Collect logs, open an incident, run cleanup, then retry or roll back.

#### D2. Pre-flight stage
Cheap checks run immediately before the point of no return, because an evaluation can be days old:
- Is the evaluation still current for this source?
- Are credentials and connections still valid; is the target reachable?
- Enough capacity on the target? Conflicting tasks running (backups, upgrades)?
- Has the plan changed since approval (require re-approval if so)?
- Is the migration window open?

Output: a go / no-go summary with a reason per failed check and a "Run pre-flight again" button. Red Hat MTV added a pre-flight inspection for this reason.

**Link:** [MTV 2.10 release notes](https://docs.redhat.com/en/documentation/migration_toolkit_for_virtualization/2.10/html/release_notes/rn-2-10_release-notes)

#### D3. Examples for VCD → VCFA

| Where | Hook | Benefit |
| :--- | :--- | :--- |
| Before Supervisor Migration Module | Export the existing Supervisor config | Easier rollback of a risky step |
| Before Provider Gateways | Notify network team, snapshot gateway config | Everyone knows when it changes |
| After Edge or IP Spaces modules | Run a connectivity test from a test VM | Catches broken networking early |
| After the whole run | Post summary to chat, update CMDB | Removes manual follow-up |
| Pre-flight | Verify the evaluation is newer than the last source change | Prevents migrating with a stale plan |

#### D4. How it could look in the UI
- A **Hooks** section in the plan or step editor: trigger (before / after / on failure), type (webhook, script, approval), scope (plan, module, step).
- Hook results in the run timeline: Passed, Failed, Skipped, with output.
- Per hook: timeout, "block on failure" or "continue with warning", retries.
- **Hook templates and defaults:** define a template once (for example "Notify Slack") and apply it to all plans, with per-item overrides and an on/off toggle, as the AWS MGN post-launch template does. Allow versioned actions (default, latest or specific version) and dynamic parameters (for example the ID of the migrated object).
- Hooks included in plan export and the audit log.

**Links:** [AWS MGN post-launch settings](https://docs.aws.amazon.com/mgn/latest/ug/source-post-launch-settings.html), [MGN templates](https://docs.aws.amazon.com/mgn/latest/ug/mgn-initialization-templates.html), [Terraform run tasks (org settings)](https://developer.hashicorp.com/terraform/enterprise/users-teams-organizations/organizations/settings), [MTV hooks](https://docs.redhat.com/en/documentation/migration_toolkit_for_virtualization/2.6/html/installing_and_using_the_migration_toolkit_for_virtualization/advanced-migration-options_mtv)

#### D5. Decisions to make early
- **Security:** who can create hooks; secrets stored outside the plan JSON and encrypted (MGN encrypts action parameters; CMF keeps credentials in a secrets store according to a third-party summary); restricted network targets; log every execution.
- **Failure policy:** clear default (block or continue) per hook and a visible override.
- **Idempotency:** retries may run a hook twice.
- **Start with outgoing webhooks.** They cover most use cases (notifications, tickets, backups through an external system) and are far easier to secure than arbitrary scripts.

**Impact / Effort:** H / M (webhooks) to L (scripts, templates, versioning)

### E. Validation, drift and reporting

#### E1. Post-migration Validation tab
- **Idea:** A tab (next to Provider Infrastructure Migration and Organization Migration) with source-vs-target checks, pass / fail / "can't compare" counts, drill-down into mismatches, a "re-validate" button and a validation-only mode.
- **UI:** Summary card ("42 checks, 40 passed, 2 need review"), expandable list, export.
- **Inspired by:** AWS DMS validation (pending, mismatched, suspended counts and a failures table); Google adaptation reports; Broadcom post-migration validation.
- **Links:** [DMS validation](https://docs.aws.amazon.com/dms/latest/userguide/CHAP_Validating.html), [Google progress details](https://docs.cloud.google.com/migrate/virtual-machines/docs/5.0/migrate/migration-progress-details), [Broadcom post-migration validation](https://techdocs.broadcom.com/us/en/vmware-security-load-balancing/vdefend/vdefend-firewall/9-1/edge-gateway-firewall-migration/post-migration-validation-and-workload-transition.html)
- **Impact / Effort:** H / M–L

#### E2. Fix and re-check
- **Idea:** Where a mismatch has a safe automatic fix, offer "Fix and re-check" (DMS data resync is the model).
- **Link:** [DMS resync](https://docs.aws.amazon.com/dms/latest/userguide/CHAP_Validating.DataResync.html)
- **Impact / Effort:** M / L

#### E3. Drift detection between evaluation, approval and execution
- **Idea:** Detect that the source changed after an evaluation or plan approval; mark the plan "Source changed" and require re-evaluation or re-approval. Allow a configurable tolerance for harmless drift.
- **Inspired by:** Liquibase drift reports with severity thresholds; HCP Terraform drift detection and notifications.
- **Links:** [Liquibase drift](https://docs.liquibase.com/drift-reports), [Terraform notifications](https://developer.hashicorp.com/terraform/docs/cloud/workspaces/notifications)
- **Impact / Effort:** H / M

#### E4. Per-run report (audit-ready)
- **Idea:** PDF or CSV per run: scope, evaluation results, waivers, user changes (diff), approvals, execution timeline, hook results, validation results, failures. Offer pre- and post-migration versions.
- **Inspired by:** Jira pre- and post-migration reports; Veeam reports generated at plan lifecycle stages; Liquibase operation reports.
- **Links:** [Jira dashboard](https://support.atlassian.com/migration/docs/manage-and-view-the-details-of-jira-migration-plans/), [Veeam testing and reports](https://community.veeam.com/onboarding-for-veeam-data-platform-163/onboarding-for-veeam-recovery-orchestrator-step-7-testing-orchestration-plans-configuring-reports-10045), [Liquibase 4.27](https://liquibase.com/blog/release-liquibase-pro-4-27-0)
- **Impact / Effort:** H / M

#### E5. Downloadable logs and support bundle
- **Idea:** Download error logs per run, module or step; one-click support bundle with plan state, logs and versions.
- **Link:** [Jira dashboard](https://support.atlassian.com/migration/docs/manage-and-view-the-details-of-jira-migration-plans/)
- **Impact / Effort:** M / S–M

#### E6. Targets vs actuals
- **Idea:** Record planned vs actual duration (and downtime where applicable) per tenant and wave, shown on a dashboard. Veeam shows RPO/RTO achievement; the migration equivalent is time and downtime against target.
- **Link:** [Veeam overview](https://helpcenter.veeam.com/docs/vro/userguide/overview.html?ver=13)
- **Impact / Effort:** M / M

### F. Waves, grouping and portfolio planning

#### F1. Wave planner
- **Idea:** Group organizations (or any migration unit) into waves; sequence them; set a target date; commit a wave to lock membership; run current waves while planning later ones; show wave progress.
- **UI:** Kanban or table of waves with drag-and-drop; capacity and dependency warnings; wave detail with its evaluations and plans.
- **Inspired by:** HCX waves and Mobility Groups; Azure Migrate wave planning; AWS MGN applications grouped into waves.
- **Links:** [HCX](https://techdocs.broadcom.com/us/en/vmware-cis/vcf/vcf-9-0-and-later/9-0/workload-mobility/vmware-hcx-user-guide-vcf-9-0/migrating-virtual-machines-with-vmware-hcx/migrating-mobility-groups-from-migration-waves/migrating-mobility-group-workloads-in-migration-waves.html), [Azure Migrate wave planning](https://techcommunity.microsoft.com/blog/azuremigrationblog/-/4467959), [CAF wave planning](https://learn.microsoft.com/en-us/azure/cloud-adoption-framework/migrate/migration-wave-planning), [MGN waves](https://aws.amazon.com/blogs/mt/migrating-and-automating-patching-at-scale-with-aws-application-migration-service/)
- **Impact / Effort:** H / L

#### F2. Dependency view and grouping hints
- **Idea:** Show dependencies between tenants, networks and shared resources; suggest which items must move together. CAF guidance: if dependency criticality is uncertain, group together; document constraints for each group.
- **Links:** [CAF wave planning](https://learn.microsoft.com/en-us/azure/cloud-adoption-framework/migrate/migration-wave-planning), [Azure Migrate overview](https://learn.microsoft.com/en-us/azure/migrate/migrate-v1)
- **Impact / Effort:** M–H / L

#### F3. Tenant classification and assessment questionnaires
- **Idea:** A wizard that recommends a path per tenant (in-place, side-by-side, VLAN-extended, retire) from inventory data plus a short questionnaire. Make the questionnaire editable (YAML), versioned and reusable, and allow an "archetype" so similar tenants are assessed once.
- **Inspired by:** Konveyor assessment, archetypes and YAML questionnaires; the field guide's decision framework.
- **Links:** [Konveyor 0.3.0](https://www.cncf.io/blog/2024/01/31/konveyor-0-3-0-release-announcement/), [Enhanced assessment](https://issues.redhat.com/browse/MTA-1179), [Field guide](https://theaistack.blog/2026/07/31/from-org-vdc-to-namespace-the-architects-field-guide-to-vcd-%e2%86%92-vcfa-migration/)
- **Impact / Effort:** M–H / L

#### F4. Portfolio dashboard
- **Idea:** Overview with counts (sources, waves, tenants, modules), blockers across the portfolio, "needs attention" strip (failed, waiting for review, stale), search and saved filters; on-demand cross-portfolio reports like Konveyor's dynamic reports.
- **Inspired by:** Cloud Migration Factory overview dashboard and Jobs page; Konveyor dynamic reports.
- **Links:** [CMF v3](https://aws.amazon.com/blogs/mt/accelerate-your-migration-with-version-3-of-aws-cloud-migration-factory), [MTA-1177](https://issues.redhat.com/browse/MTA-1177)
- **Impact / Effort:** H / M

#### F5. Readable names, labels and owners
- **Idea:** Name, description, tags and owner for every migration and evaluation (replace GUID names); group and filter by tag. Azure Migrate waves use tags for grouping.
- **Impact / Effort:** M–H / S

#### F6. Estimates and business case (optional)
- **Idea:** Effort and duration estimates per tenant or wave, optionally cost and savings, exportable as a spreadsheet. Azure Migrate's business case estimates costs and savings.
- **Link:** [Azure Migrate overview](https://learn.microsoft.com/en-us/azure/migrate/migrate-v1)
- **Impact / Effort:** L–M / L

### G. Sources and onboarding

- **G1. Test connection** in the Add Source modal, with certificate or thumbprint review and clear error messages. (H / S)
- **G2. Source health** on the card: connection state, last sync, version, and a readiness checks drawer listing all 11 checks with status and a "View details" link. (M–H / S–M)
- **G3. Empty and unchecked states** for cards that have no status (for example vc1). (M / S)
- **G4. Credential management:** rotate credentials, show last-used, never display secrets again after saving; use a secrets store. (M / M)
- **G5. Source-type onboarding checklist** that shows the prerequisites for each source type before the first evaluation, with automatic verification where possible. (M / M)
- **G6. Import and export of source metadata and mappings** for repeatable setup across environments. (L–M / M)

### H. Governance, security and operations

- **H1. Roles and permissions:** at least planner (creates plans), approver, operator (runs), viewer; separate who can edit steps from who can approve. Veeam uses administrator, plan author and plan operator. (H / M)
- **H2. Audit log tab:** who evaluated, edited, approved, started, rolled back, waived, changed hooks, with timestamps and diffs. (H / M)
- **H3. API and CLI parity:** everything the UI does should be available through a documented API (Nutanix Move's API with plan actions is a model), plus CLI exit codes for pipelines (Liquibase policy checks do this). (H / M–L)
- **H4. Multi-environment views:** compare the same plan across dev / test / prod environments. (L / L)
- **H5. Structured logging** with run and step IDs for troubleshooting and integration with log tools. (M / M)
- **H6. Accessibility and i18n:** Clarity provides common strings for screen readers; keep status colours paired with text or icons. (M / S–M)

**Links:** [Nutanix Move API](https://www.nutanix.dev/api_reference/apis/move.html), [Liquibase user guide](https://docs.liquibase.com/pro/user-guide), [Veeam testing and reports](https://community.veeam.com/onboarding-for-veeam-data-platform-163/onboarding-for-veeam-recovery-orchestrator-step-7-testing-orchestration-plans-configuring-reports-10045)

### I. Platform and multi-type architecture

#### I1. Declarative migration-type definitions
- **Idea:** Each migration type (VCD, Telco Cloud, VM Apps Organization, vCenter, future types) declares its modules and sub-steps, step schemas (for form generation), validation rules and severities, status vocabulary, mappings, hooks and reports. One engine renders cards, evaluation tables, plan editor, timeline and reports.
- **With Module Federation:** each type can ship as a remote that registers its definition with the host.
- **Inspired by:** Forklift's provider, mapping and plan model; Broadcom's parent module / sub-module structure; Nutanix environments and plans.
- **Links:** [Forklift](https://github.com/kubev2v/forklift), [Broadcom Migrate page](https://techdocs.broadcom.com/us/en/vmware-security-load-balancing/vdefend/vdefend-firewall/9-1/edge-gateway-firewall-migration/edge-firewall-migration-workflow.html)
- **Impact / Effort:** H / L

#### I2. Reusable mappings library
- **Idea:** Named, versioned mappings (network, storage, naming, identity) that plans reference; auto-suggest by name; "Resulting config" preview.
- **Links:** [Forklift](https://github.com/kubev2v/forklift), [Proxmox wiki](https://pve.proxmox.com/wiki/Migrate_to_Proxmox_VE)
- **Impact / Effort:** M–H / M

#### I3. Workflow as data (flows)
- **Idea:** Express the sequence of stages (evaluate, review, pre-flight, migrate, validate, report) as a configurable flow so different customers can add or remove stages; Liquibase flows orchestrate change workflows in a file.
- **Link:** [Liquibase Pro](https://docs.liquibase.com/pro/user-guide)
- **Impact / Effort:** M / L

#### I4. Test and simulate modes
- **Idea:** Simulate (produce plan and expected result, change nothing) for every type; a real test (isolated environment) only where the backend supports it, as Veeam does with isolated labs and AWS MGN with test instances.
- **Links:** [AWS MGN test and cutover](https://docs.aws.amazon.com/es_es/mgn/latest/ug/server-test-cutover-main.html), [Veeam testing](https://community.veeam.com/onboarding-for-veeam-data-platform-163/onboarding-for-veeam-recovery-orchestrator-step-7-testing-orchestration-plans-configuring-reports-10045)
- **Impact / Effort:** M / M–L

#### I5. Extensibility points
- **Idea:** Custom validation rules (configuration, not code), custom report templates, custom hook types, custom status mapping. Forklift custom rules and Liquibase custom policy checks are models.
- **Impact / Effort:** M / L

### J. UI polish and Clarity implementation notes

**Quick fixes (from section 2.3):** pagination count, severity colours, history states, readable names and tooltips on truncated text, empty state for unchecked sources, legend for metric icons.

**Clarity components that match the ideas** (check the version you use; the ng-clarity v18 release notes describe changes to stepper, wizard and timeline):
- **`clr-timeline-step`** for the run timeline (C2) and hook results.
- **Stepper / wizard** for plan creation, the wave builder and pre-flight (the v18 notes mention a horizontal step-nav layout for the wizard).
- **Datagrid** features: expandable rows (rule drill-down), detail pane (step details beside the table, an alternative to the side panel), manage columns, multi-selection (bulk actions), custom filters (severity, domain, owner).
- **Signpost / tooltip** for field-level hints (B2) and truncated names.
- **Badge and label** components for state, "Modified by user", "Waived", "Stale".
- **Alerts** for banners that persist across pages (for example "Source changed since evaluation").

**Links:** [ng-clarity on GitHub (release notes)](https://github.com/vmware-clarity/ng-clarity), [Clarity design system](https://core.clarity.design/)

---

## 5. Prioritized roadmap

| Phase | Goal | Items | Why now |
| :--- | :--- | :--- | :--- |
| 0. Quick wins | Trust and polish | Fix pagination count, severity colours, history states; readable names and tooltips; empty state for vc1; Test connection (G1); readiness gate (A7); next-step column (C5) | Cheap, visible, builds credibility |
| 1. Evaluation and review | Make decisions easier | Compare evaluations (A1), targeted re-check (A2), waivers and severity (A5), irreversible-step flag (A6), cached results and stale warning (A3), plan diff (B1), field hints (B2), comments and approvals (B3) | Uses data you already have; builds on your strongest features |
| 2. Execution and operations | Control and visibility | Notifications (C7), timeline (C2), duration and ETA (C3), per-item pause / retry / rollback (C4), roles and audit log (H1, H2), live workflow graph (C1) | Operators need to know what happened and act on it |
| 3. Validation and reporting | Close the lifecycle | Validation tab (E1), per-run report (E4), drift detection (E3), logs and support bundle (E5), plan export and import (B5) | Nothing exists after the migration finishes today |
| 4. Hooks and automation | Fit customer environments | Webhook hooks and pre-flight (D1 to D5), scheduling (C6), API and CLI parity (H3) | Extensibility without building every feature |
| 5. Portfolio and platform | Scale and multi-type | Wave planner (F1), dependency hints (F2), portfolio dashboard (F4), tenant classification (F3), declarative migration types (I1), mappings library (I2), extensibility points (I5) | Largest effort; biggest differentiator |

**Suggested first three items to start this week:** compare evaluations (A1), plan diff with field hints (B1 and B2), and the readiness gate (A7).

---

## 6. Appendix: design sketches

These are my proposals for discussion, not taken from any product.

### 6.1 Hook definition

```ts
type HookTrigger = 'BEFORE_PLAN' | 'AFTER_PLAN' | 'BEFORE_MODULE' | 'AFTER_MODULE'
                 | 'BEFORE_STEP' | 'AFTER_STEP' | 'ON_FAILURE' | 'PRE_FLIGHT';

interface HookDefinition {
  id: string;
  name: string;
  trigger: HookTrigger;
  scope: { planId?: string; moduleName?: string; stepId?: string };
  type: 'WEBHOOK' | 'APPROVAL' | 'SCRIPT';       // start with WEBHOOK
  target: { url?: string; method?: 'POST' | 'PUT'; secretRef?: string };
  parameters?: Record<string, string>;           // may use placeholders like {{step.targetEntityId}}
  failurePolicy: 'BLOCK' | 'WARN_AND_CONTINUE';
  timeoutSeconds: number;
  retries: number;
  enabled: boolean;
  templateId?: string;                           // inherits from a template, overridable per item
  version?: string;                              // 'default' | 'latest' | specific
}

interface HookResult {
  hookId: string;
  runId: string;
  state: 'PASSED' | 'FAILED' | 'SKIPPED' | 'TIMED_OUT';
  startedAt: string;
  finishedAt: string;
  output?: string;
}
```

### 6.2 Check result with severity and waiver

```ts
type Severity = 'INFO' | 'WARNING' | 'BLOCKER';

interface CheckResult {
  id: string;
  ruleId: string;
  severity: Severity;
  domain: string;
  message: string;
  remediationUrl?: string;
  firstSeenEvaluationId: string;
  lastSeenEvaluationId: string;
  status: 'OPEN' | 'RESOLVED' | 'WAIVED';
  waiver?: { by: string; reason: string; expiresAt?: string };
}
```

### 6.3 Migration type definition (for the schema-driven UI)

```ts
interface MigrationTypeDefinition {
  typeId: string;                       // 'vcd-to-vcfa', 'vcenter', ...
  displayName: string;
  sourceFormFields: FieldSchema[];      // Add Migration Source form
  readinessChecks: RuleRef[];
  modules: ModuleDefinition[];          // ordered, with dependencies
  stepSchemas: Record<string, StepSchema>;  // drives the edit form and JSON validation
  statusVocabulary: Record<string, { label: string; kind: 'info' | 'success' | 'warning' | 'danger' }>;
  validationChecks: RuleRef[];          // post-migration
  reportTemplates: string[];
  supportedHooks: HookTrigger[];
}
```

### 6.4 Screen sketch: evaluation compare

```
Compare evaluations     [ May 12 (Coke, Pepsi) v ]  vs  [ May 14 (Provider Infra) v ]
------------------------------------------------------------------------------------
 New (4)   Resolved (11)   Unchanged (23)                         Trend: blockers 15 -> 4
------------------------------------------------------------------------------------
 Severity | Issue                           | Domain   | Status     | Action
 BLOCKER  | Network overlap                 | Coke     | Unchanged  | Re-check | Waive
 WARNING  | Edge gateway NSX-v only         | Pepsi    | New        | Re-check | Waive
 INFO     | vApp template invalid storage   | Provider | Resolved   | -
```

---

## 7. Link index

### Your target product area (VCD → VCFA)
- [Broadcom: Migrate VCD Edge Gateway Firewall](https://techdocs.broadcom.com/us/en/vmware-security-load-balancing/vdefend/vdefend-firewall/9-1/edge-gateway-firewall-migration/edge-firewall-migration-workflow.html)
- [Broadcom: Auditing and Remediation Workflow](https://techdocs.broadcom.com/us/en/vmware-security-load-balancing/vdefend/vdefend-firewall/9-1/edge-gateway-firewall-migration/auditing-and-remediation-workflow.html)
- [Broadcom: Validate Post-Migration and Workload Transition](https://techdocs.broadcom.com/us/en/vmware-security-load-balancing/vdefend/vdefend-firewall/9-1/edge-gateway-firewall-migration/post-migration-validation-and-workload-transition.html)
- [Broadcom: VCD 10.6.2 announcement](https://blogs.vmware.com/cloudprovider/2026/09/announcing-vmware-cloud-director-10-6-2-enabling-your-migration-to-vmware-cloud-foundation-9-1.html)
- [Field guide: From Org VDC to Namespace](https://theaistack.blog/2026/07/31/from-org-vdc-to-namespace-the-architects-field-guide-to-vcd-%e2%86%92-vcfa-migration/)
- [Cosmin's lab notes (VCD migration service upgrade)](https://cosmin.us/)

### Infrastructure and VM migration tools
- Nutanix Move: [product](https://www.nutanix.com/products/move), [workflow](https://next.nutanix.com/move-application-migration-19/move-migration-workflow-40414), [cutover](https://portal.nutanix.com/page/documents/details?targetId=Nutanix-Move-v5_5%3Atop-cutover-hyperv-esxi-t.html), [API](https://www.nutanix.dev/api_reference/apis/move.html), [Ansible](https://www.nutanix.dev/2021/06/01/nutanix-move-automation-using-ansible-with-migration-plans/), [OVHcloud walkthrough](https://help.ovhcloud.com/csm/en-nutanix-move-migration-tool?id=kb_article_view&sysparm_article=KB0045085)
- Proxmox: [migration wiki](https://pve.proxmox.com/wiki/Migrate_to_Proxmox_VE), [StorageReview](https://www.storagereview.com/review/how-it-works-proxmox-import-wizard-vmware-migration-tool)
- Azure Migrate: [review assessment](https://learn.microsoft.com/en-us/azure/migrate/review-assessment?view=migrate), [overview](https://learn.microsoft.com/en-us/azure/migrate/migrate-v1), [wave planning](https://techcommunity.microsoft.com/blog/azuremigrationblog/-/4467959), [CAF wave planning](https://learn.microsoft.com/en-us/azure/cloud-adoption-framework/migrate/migration-wave-planning)
- AWS MGN: [dashboard](https://docs.aws.amazon.com/mgn/latest/ug/migration-dashboard.html), [cutover](https://docs.aws.amazon.com/mgn/latest/ug/starting-cutover.html), [test and cutover](https://docs.aws.amazon.com/es_es/mgn/latest/ug/server-test-cutover-main.html), [post-launch settings](https://docs.aws.amazon.com/mgn/latest/ug/source-post-launch-settings.html), [templates](https://docs.aws.amazon.com/mgn/latest/ug/mgn-initialization-templates.html), [patching with waves](https://aws.amazon.com/blogs/mt/migrating-and-automating-patching-at-scale-with-aws-application-migration-service/), [AWS Transform post-launch](https://aws.amazon.com/about-aws/whats-new/2026/08/aws-transform-for-migrations-automates-post-launch-actions)
- AWS Cloud Migration Factory: [workflow](https://docs.aws.amazon.com/prescriptive-guidance/latest/migration-factory-cloudendure/workflow.html), [version 3](https://aws.amazon.com/blogs/mt/accelerate-your-migration-with-version-3-of-aws-cloud-migration-factory)
- VMware HCX: [Broadcom docs](https://techdocs.broadcom.com/us/en/vmware-cis/vcf/vcf-9-0-and-later/9-0/workload-mobility/vmware-hcx-user-guide-vcf-9-0/migrating-virtual-machines-with-vmware-hcx/migrating-mobility-groups-from-migration-waves/migrating-mobility-group-workloads-in-migration-waves.html), [vStellar walkthrough](https://vstellar.com/2020/09/hcx-mobility-groups/), [PowerCLI](https://developer.broadcom.com/powercli/latest/vmware.vimautomation.hcx/commands/new-hcxmobilitygroup)
- Red Hat MTV / Forklift: [GitHub](https://github.com/kubev2v/forklift), [advanced options](https://docs.redhat.com/en/documentation/migration_toolkit_for_virtualization/2.6/html/installing_and_using_the_migration_toolkit_for_virtualization/advanced-migration-options_mtv), [2.10 release notes](https://docs.redhat.com/en/documentation/migration_toolkit_for_virtualization/2.10/html/release_notes/rn-2-10_release-notes)
- Google Migrate to Virtual Machines: [progress details](https://docs.cloud.google.com/migrate/virtual-machines/docs/5.0/migrate/migration-progress-details)

### Application, data and platform migration tools
- Jira Cloud Migration Assistant: [dashboard](https://support.atlassian.com/migration/docs/manage-and-view-the-details-of-jira-migration-plans/), [pre-migration checks](https://support.atlassian.com/migration/docs/run-pre-migration-checks-review-and-run-a-jira-migration/), [checklist](https://support.atlassian.com/migration/docs/jira-pre-migration-checklist/), [app vendor checks](https://support.atlassian.com/migration/docs/app-vendor-checks/)
- Konveyor / Tackle / MTA: [Konveyor 0.3.0](https://www.cncf.io/blog/2024/01/31/konveyor-0-3-0-release-announcement/), [enhanced assessment](https://issues.redhat.com/browse/MTA-1179), [review without assessment](https://issues.redhat.com/browse/MTA-115), [dynamic reports](https://issues.redhat.com/browse/MTA-1177), [Tackle assessment epic](https://issues.redhat.com/browse/TACKLE-9)
- AWS DMS: [validation](https://docs.aws.amazon.com/dms/latest/userguide/CHAP_Validating.html), [data resync](https://docs.aws.amazon.com/dms/latest/userguide/CHAP_Validating.DataResync.html)
- Liquibase: [drift reports](https://docs.liquibase.com/drift-reports), [release 4.27](https://liquibase.com/blog/release-liquibase-pro-4-27-0), [Rollback Required check](https://docs.liquibase.com/secure/user-guide-5-2/policy-check-library/rollbackrequired), [user guide](https://docs.liquibase.com/pro/user-guide)

### Orchestration, governance and DR tools
- Veeam Recovery Orchestrator: [overview](https://helpcenter.veeam.com/docs/vro/userguide/overview.html?ver=13), [readiness check (archived)](https://helpcenter.veeam.com/archive/vdro/60/userguide/running_readiness_check.html), [testing and reports](https://community.veeam.com/onboarding-for-veeam-data-platform-163/onboarding-for-veeam-recovery-orchestrator-step-7-testing-orchestration-plans-configuring-reports-10045)
- HCP Terraform: [notifications](https://developer.hashicorp.com/terraform/docs/cloud/workspaces/notifications), [organization settings](https://developer.hashicorp.com/terraform/enterprise/users-teams-organizations/organizations/settings)

### UI framework
- [ng-clarity (GitHub)](https://github.com/vmware-clarity/ng-clarity)
- [Clarity design system](https://core.clarity.design/)

---

## 8. Possible next steps

1. Turn section 5 into a backlog with story-level breakdown and acceptance criteria for Phase 0 and Phase 1.
2. Build a Clarity-style mockup for one screen (evaluation compare, plan diff, or the Validation tab).
3. Refine the TypeScript sketches in section 6 against your real step and plan JSON.
4. Read Broadcom's Rollback and Troubleshooting pages for the firewall migration and add them here.
5. Update the video script when the first new features ship (evaluation compare and plan diff would fit Scenes 2 and 5).