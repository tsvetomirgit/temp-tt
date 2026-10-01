# Migration Tool: Feature Ideas and References

A combined summary of ideas for improving a UI-driven migration tool, starting from VCD → VCFA (VMware Cloud Director → VCF Automation) and extended to a general-purpose, multi-type migration tool.

**Sources studied:**
- Broadcom docs: VCD Edge Gateway Firewall Migration to VCF Automation (vDefend 9.1)
- VMTECHIE blog: *From Org VDC to Namespace: The Architect's Field Guide to VCD → VCFA Migration*
- Your migration-tool comparison document (Nutanix Move, Proxmox ESXi Import Wizard, Azure Migrate, AWS MGN, Xen Orchestra V2V)
- Additional research: HCX, Red Hat Migration Toolkit for Virtualization (Forklift), AWS DMS, Google Migrate to Virtual Machines

> **Caveats**
> - I read the documentation pages but did not open the screenshot images; screenshots are referenced by the doc step they appear under.
> - I found no public video of the VCD→VCFA Migration Tool itself, and its full migration documentation is gated (Broadcom asks you to request it by email).
> - I have not read Broadcom's Rollback and Troubleshooting pages for the firewall migration.
> - The blog is one architect's opinion; verify its claims against official Broadcom docs.

---

## Part 1: How the Official VCD → VCFA Migration Tool Works

Patterns from the Broadcom firewall-migration docs that are worth comparing with your tool:

- **Sync before migrate.** Users run *Actions → Sync* so the migrator is aligned with the current VCD state, then click Migrate.
- **Fixed ordering with a visible hierarchy.** Provider infrastructure first, then the Organization (Infra module and Regional module), then workloads. Each Edge Gateway is a parent module with three sequential child sub-modules: Security Configuration Update, Default Rule Update, User-Defined Rule Migration.
- **Drill-down status.** Org → module → Edge Gateway → individual firewall rule, with an explicit **Skip** status and an alert message explaining why.
- **Skip-by-design logic.** If the gateway firewall is disabled, all child sub-modules are skipped. Stateful/stateless is derived from the NSX Edge cluster property rather than asked from the user.
- **"All or nothing" rule.** One unsupported rule (for example IPv6 addresses, or a non-centralized Tier-1) rejects the entire gateway firewall migration.
- **Evaluation and remediation loop.** Run an evaluation, fix problems in VCD, regenerate the plan, and confirm every sub-module shows "Completed" rather than "Skipped" or "Rejected".
- **Sequential multi-select.** Several gateways can be selected and are migrated one after another.
- **Manual post-migration audit.** Users are told to compare the resulting policy attributes with the source by hand (an opportunity to automate).
- **Surrounding workflow pages.** User Persona and Access Management, Prerequisites, Auditing and Remediation, Migrate, Validate Post-Migration and Workload Transition, Rollback, Troubleshooting. This is a useful checklist of screens a complete tool needs.
- **Gated prerequisites.** Broadcom's VCD 10.6.2 announcement describes running the Environment Assessment Tool (EAT) first, then requesting the migration documentation, then connecting the VCF Automation Migration Service to VCD.

**Links**
- [Migrate VCD Edge Gateway Firewall](https://techdocs.broadcom.com/us/en/vmware-security-load-balancing/vdefend/vdefend-firewall/9-1/edge-gateway-firewall-migration/edge-firewall-migration-workflow.html)
- [Auditing and Remediation Workflow](https://techdocs.broadcom.com/us/en/vmware-security-load-balancing/vdefend/vdefend-firewall/9-1/edge-gateway-firewall-migration/auditing-and-remediation-workflow.html)
- [Validate Post-Migration and Workload Transition](https://techdocs.broadcom.com/us/en/vmware-security-load-balancing/vdefend/vdefend-firewall/9-1/edge-gateway-firewall-migration/post-migration-validation-and-workload-transition.html)
- [VCD Edge Gateway Firewall Migration overview](https://techdocs.broadcom.com/us/en/vmware-security-load-balancing/vdefend/vdefend-firewall/9-1/edge-gateway-firewall-migration.html)
- [VCD 10.6.2 announcement](https://blogs.vmware.com/cloudprovider/2026/09/announcing-vmware-cloud-director-10-6-2-enabling-your-migration-to-vmware-cloud-foundation-9-1.html)
- [Cosmin's lab notes on the VCD migration service (VCD_MIGRATOR) upgrade in VCF Operations](https://cosmin.us/), an upgrade walkthrough rather than the migration UI
- Screenshots embedded in the Broadcom Migrate page (not opened by me):
  - [Edge gateway status](https://techdocs.broadcom.com/content/broadcom/techdocs/us/en/vmware-security-load-balancing/vdefend/vdefend-firewall/9-1/_jcr_content/assetversioncopies/e1c9e902-b94b-45f0-8b17-7e0c7916c0dd.original.png)
  - [Rule-level status](https://techdocs.broadcom.com/content/broadcom/techdocs/us/en/vmware-security-load-balancing/vdefend/vdefend-firewall/9-1/_jcr_content/assetversioncopies/3ea045e4-4ed0-49bb-8424-6461607e2079.original.png)
  - [Skip alert](https://techdocs.broadcom.com/content/broadcom/techdocs/us/en/vmware-security-load-balancing/vdefend/vdefend-firewall/9-1/_jcr_content/assetversioncopies/71d18641-34e8-4cb3-a638-26bfda64a337.original.png)

---

## Part 2: Ideas from the Architect's Field Guide (Planning Layer)

The blog works at the planning layer, which is where a UI can add value beyond the official tool:

1. **Construct-mapping view.** Show "this VCD object becomes that VCFA object" (Org VDC → Region quota + namespace, Edge Gateway → Transit Gateway, IP Spaces → External IP Blocks, Catalog → Content Library) with a "what actually changes" note per row.
2. **"Won't map 1:1" warnings.** For example vApps (fencing, start order, leases) have no equivalent; flag them per object.
3. **Tenant classification wizard.** Recommend a path per tenant: in-place, side-by-side, VLAN-extended, or retire, based on network type, API/extension usage and Kubernetes/AI interest.
4. **Org-type decision step.** All-Apps vs. VM-Apps is hard to change later, so make it an explicit, evidence-based choice.
5. **Readiness and inventory dashboard.** VCD version vs. required baseline; counts of orgs, VDCs, edges, catalogs, extensions; orphaned templates and dead orgs; DFW rules needing rationalization.
6. **Network disposition planner.** Per network: extend VLAN or re-IP into a VPC subnet. VLAN extensions carry an owner and an expiry date so they stay a transition state.
7. **IP continuity check.** Verify every IP Space has a mirrored External IP Block before a tenant enters a wave.
8. **API caller inventory.** Detect legacy XML API callers (these must be rewritten and are a common surprise outage).
9. **Wave planning.** Pilot (one tenant per network pattern), standard waves, complex rebuilds, decommission, each with exit criteria and a write-freeze marker for migrated orgs.
10. **Parallel metering check.** Compare VCD metering with VCF Operations during pilots.
11. **Tenant communication output.** Generate a per-tenant "what changed for you" summary.

**Link:** [From Org VDC to Namespace: Field Guide](https://theaistack.blog/2026/07/31/from-org-vdc-to-namespace-the-architects-field-guide-to-vcd-%e2%86%92-vcfa-migration/)

---

## Part 3: VCD → VCFA Feature Proposals (Detailed)

### 3.1 Evaluation (dry run) with a remediation loop
- **What:** Read-only check before migration showing, per object, what migrates, skips or is rejected, and why.
- **Look:** Datagrid Org → Edge Gateway → Rule; status badge (Ready / Ready with conditions / Blocked), reason column, "Re-evaluate" button; blockers on top ("3 blockers in 2 gateways"). Clarity `clr-datagrid` with expandable rows and `clr-alert` banners.
- **References:** Broadcom Auditing and Remediation Workflow; [Azure Migrate review assessment](https://learn.microsoft.com/en-us/azure/migrate/review-assessment?view=migrate) (Ready / Ready with conditions / Not ready / Unknown, with remediation guidance).

### 3.2 Lifecycle states with a "Next step" column
- **What:** Each object is in one explicit state and the UI says what to do next (for example Not evaluated → Ready → In progress → Completed / Skipped / Failed).
- **Look:** One table with a per-row "Next step" button, bulk actions, and a Clarity timeline or stepper in the detail view. Extend the parent-child model with an alert message per child.
- **References:** [AWS MGN migration dashboard](https://docs.aws.amazon.com/mgn/latest/ug/migration-dashboard.html), [Starting a cutover](https://docs.aws.amazon.com/mgn/latest/ug/starting-cutover.html), Broadcom Migrate page.

### 3.3 "Resulting config" preview and mapping table
- **What:** Show what the target will look like before running. Proxmox has a "Resulting Config" tab listing the key-value pairs it will create.
- **Look:** Two columns (VCD object left, VCFA result right), differences highlighted, a "What actually changes" note under each row, table/diff toggle.
- **References:** [Proxmox migration wiki](https://pve.proxmox.com/wiki/Migrate_to_Proxmox_VE), [StorageReview walkthrough](https://www.storagereview.com/review/how-it-works-proxmox-import-wizard-vmware-migration-tool), the field guide.

### 3.4 Saved plans, scheduling and batch limits
- **What:** Create a named plan, save without running, review, then start. Nutanix Move shows plan states (Not Started, In Progress, Ready to Cutover, Completed) and recommends batch limits.
- **Look:** `clr-wizard`: Select scope → Review mapping → Evaluation result → Schedule → Confirm, with "Save plan" next to "Start".
- **References:** [Nutanix Move](https://www.nutanix.com/products/move) (includes a browser-based Test Drive demo), [Move workflow](https://next.nutanix.com/move-application-migration-19/move-migration-workflow-40414), [Cutover docs](https://portal.nutanix.com/page/documents/details?targetId=Nutanix-Move-v5_5%3Atop-cutover-hyperv-esxi-t.html), [OVHcloud walkthrough](https://help.ovhcloud.com/csm/en-nutanix-move-migration-tool?id=kb_article_view&sysparm_article=KB0045085).

### 3.5 Test / simulate and revert
- **What:** AWS and Nutanix let users test before cutover and revert a test. In-place VCD→VCFA may not support a real test launch, so start with a "simulate" mode that produces the full plan and expected result without changing anything.
- **Reference:** [AWS manage test and cutover instances](https://docs.aws.amazon.com/es_es/mgn/latest/ug/server-test-cutover-main.html) (Spanish-locale URL, content matches the English docs).

### 3.6 Post-migration validation report
- **What:** Automate the manual source-vs-target comparison the Broadcom docs recommend (stateful/stateless, rules present, alert messages).
- **Look:** Summary card ("42 checks, 40 passed, 2 need review"), expandable list, CSV/PDF export.
- **References:** Broadcom Validate Post-Migration page; [Google migration progress details](https://docs.cloud.google.com/migrate/virtual-machines/docs/5.0/migrate/migration-progress-details) (adaptation reports).

### 3.7 Readiness and tenant-classification dashboard
- **What:** VCD version vs. baseline, inventory, recommended path per tenant, optionally importing EAT output.
- **References:** VCD 10.6.2 announcement; the field guide's decision framework.

---

## Part 4: Ideas from Other Migration Tools in Your Comparison Document

| Feature | Seen in | How it could apply |
| :--- | :--- | :--- |
| Pre-migration assessment with sizing and cost | Azure Migrate | A "what will this tenant look like in the target" report before any action |
| Non-disruptive test or drill migrations | AWS MGN | Dry-run or validate-only mode |
| Warm/incremental sync, then cutover | Nutanix Move, Xen Orchestra | Separate "prepare/sync" from "cutover" with a clear point of no return |
| Automated guest/OS preparation at cutover | Nutanix Move | Automatic pre-checks and remediation |
| Source-to-target network remapping | Proxmox wizard | Mapping table with auto-suggestions |
| No intermediate landing zone | Proxmox wizard | Be explicit about what the tool touches and stores |

---

## Part 5: Ideas for a General-Purpose, Multi-Type Migration Tool

### 5.1 A generic model that every migration type plugs into
Several tools share one skeleton: source and target connections, reusable mappings, a plan, an executable run. Forklift describes migration as credentials → mapping → choreographed plan → execution. Broadcom uses parent modules with ordered sub-modules; Nutanix uses environments plus plans.
- **Idea:** define each migration type declaratively (steps, sub-steps, validation rules, mapping types, status vocabulary) so one set of screens (plan wizard, status tree, report) renders any type. With Module Federation, each type could ship as its own remote that registers its definition with the host.

### 5.2 Pluggable validation rules with severity levels
- Forklift's validation service produces "concerns" per VM, each with a category (such as Information), a label and an assessment text. Custom rules are deployed as configuration so they survive restarts and upgrades. A plan that fails validation is "Not ready" and cannot run.
- **Idea:** a rules registry per migration type with severities (info, warning, blocker), filters ("blockers only"), and a rule editor/import for admins. This generalizes the official tool's all-or-nothing rejection into configurable severity.

### 5.3 Reusable mappings
- Forklift plans reference named network and storage maps; Proxmox and Nutanix ask for target storage and network up front.
- **Idea:** a "Mappings" library (network, storage, naming, identity) that plans reference; reusable, versioned, auto-suggested (match by name), exportable.

### 5.4 Waves and groups
- HCX: create a wave and Mobility Groups, export/import workload data as CSV, then "commit" the wave, which validates the groups and locks membership. Members can be selected by name, network or resource, and the target capacity is validated against the planned wave.
- **Idea:** a wave builder with filter-based membership, capacity check, CSV import/export, a commit step that locks membership, and dependency hints ("these items share a network").

### 5.5 Lifecycle states, actions and API parity
- Nutanix exposes plan actions (cutover, test, retest, undotest, retry, discard, abort) via API; a community Ansible playbook fills the scheduling gap. HCX has PowerCLI cmdlets for mobility groups.
- **Idea:** one consistent state machine and action set across types, scheduled cutovers with a maintenance-window picker, and a UI that is just a client of the public API.

### 5.6 Hooks and pre-flight inspection
- MTV supports pre- and post-migration hooks on a plan; MTV 2.10 added a pre-flight inspection so a warm migration fails before the VM is shut down.
- **Idea:** user-defined hooks (script, webhook, approval step) at plan, wave or item level, plus a pre-flight stage that runs cheap checks right before the point of no return.

### 5.7 Post-migration validation and auto-repair (AWS DMS model)
- Per-table validation states (pending, mismatched, suspended) with counts; a failures table showing what mismatched; a validation-only mode; "data resync" that automatically fixes inconsistencies found by validation, pausing replication while it runs.
- **Idea:** a validation report with pass / fail / "can't compare" counts, drill-down into mismatches, a "re-validate" button, a validation-only mode, and an optional "fix and re-check" action where the type supports it.

### 5.8 Operations and trust
- **Rollback and abort:** show what is reversible at each step.
- **Audit trail:** who started, approved or changed what, and when.
- **Support bundle:** one-click export of logs and state for a plan (like MTV's must-gather).
- **Notifications:** email or webhook on state changes.
- **Roles:** separate who can plan, approve and execute (Broadcom has a User Persona page).
- **Export:** CSV or PDF of plans and reports.

### Reference links for the general ideas

| Topic | Link |
| :--- | :--- |
| Forklift (plan, mapping, validation model) | [github.com/kubev2v/forklift](https://github.com/kubev2v/forklift) |
| MTV validation rules and hooks | [Red Hat advanced options](https://docs.redhat.com/en/documentation/migration_toolkit_for_virtualization/2.6/html/installing_and_using_the_migration_toolkit_for_virtualization/advanced-migration-options_mtv) |
| MTV pre-flight inspection | [MTV 2.10 release notes](https://docs.redhat.com/en/documentation/migration_toolkit_for_virtualization/2.10/html/release_notes/rn-2-10_release-notes) |
| HCX waves and mobility groups | [Broadcom docs](https://techdocs.broadcom.com/us/en/vmware-cis/vcf/vcf-9-0-and-later/9-0/workload-mobility/vmware-hcx-user-guide-vcf-9-0/migrating-virtual-machines-with-vmware-hcx/migrating-mobility-groups-from-migration-waves/migrating-mobility-group-workloads-in-migration-waves.html), [vStellar walkthrough](https://vstellar.com/2020/09/hcx-mobility-groups/) |
| HCX group automation | [PowerCLI New-HCXMobilityGroup](https://developer.broadcom.com/powercli/latest/vmware.vimautomation.hcx/commands/new-hcxmobilitygroup) |
| Data validation and resync | [AWS DMS validation](https://docs.aws.amazon.com/dms/latest/userguide/CHAP_Validating.html), [data resync](https://docs.aws.amazon.com/dms/latest/userguide/CHAP_Validating.DataResync.html) |
| Plan actions and scheduling | [Nutanix Move API](https://www.nutanix.dev/api_reference/apis/move.html), [Ansible cutover scheduling](https://www.nutanix.dev/2021/06/01/nutanix-move-automation-using-ansible-with-migration-plans/) |
| Lifecycle states | [AWS MGN dashboard](https://docs.aws.amazon.com/mgn/latest/ug/migration-dashboard.html) |
| Readiness and assessment | [Azure Migrate review](https://learn.microsoft.com/en-us/azure/migrate/review-assessment?view=migrate) |
| Migration progress and reports | [Google Migrate to VMs](https://docs.cloud.google.com/migrate/virtual-machines/docs/5.0/migrate/migration-progress-details) |

---

## Part 6: Suggested Priorities

**For the VCD → VCFA tool specifically**
1. Per-object, per-rule status drill-down with clear Skip / Failed / Migrated reasons.
2. Dry-run (evaluate) mode with a readable report and remediation loop.
3. Source-to-target mapping screen with "won't map 1:1" warnings.
4. Automated post-migration diff, replacing the manual audit.
5. Rollback and resume visibility.
6. Wave and tenant-classification planner (larger, but the clearest differentiator).

**For the general multi-type tool**
1. Declarative migration-type model (everything else sits on it).
2. Validation rules with severities, then lifecycle states and actions.
3. Post-migration validation report.
4. Mappings library and wave building once the first three are stable.

---

## Possible Next Steps

- Read Broadcom's Rollback and Troubleshooting pages and add them here.
- Turn the priorities into a backlog with rough effort per item.
- Sketch the shared migration-type schema (for example as TypeScript interfaces) for the Angular host and Module Federation remotes.
- Build a Clarity-style mockup for one of the screens (status drill-down, evaluation report, or mapping view).