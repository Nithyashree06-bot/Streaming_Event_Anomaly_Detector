# AI Notes Ticket Triage System
## Operational Specifications, System Architecture & SLA Runbook

---

### 1. Document Control
* **Document ID:** SOP-AITTS-2026-V1
* **Classification:** Restricted - Operation Core
* **Owner:** Chief AI Systems Administrator
* **Last Modified:** Tuesday, June 9, 2026

---

### 2. System Overview
The **AI Notes Ticket Triage System** is a real-time, zero-trust telemetry ingestion and anomaly classification middleware pipeline. It monitors continuous streams of server performance metrics, computes mathematical deviation metrics on a sliding window frame, and utilizes Gemini Neural Copilots to triage and compile context-rich remediation protocols ("Tickets").

This system prevents service disruption by classifying minor drifts before they become site outages.

---

### 3. Core Architecture & Pipeline Ingestion
```
[ Telemetry Stream ] -> [ Ingestion Controller ] -> [ Rolling Z-Score Engine ]
                                                          | (If Z-Score > Threshold)
                                                          v
[ Real-Time UI Dashboard ] <- [ Security Audit Logs ] <- [ Anomaly Ticket Dispatch ]
         |                                                        |
         v                                                        v
[ operator@anomaly.io ] <------------ [ Manual Triage ] <--- [ Gemini AI Analysis Room ]
```

* **Ingestion Layer:** Standardized TCP/HTTP channels pushing real-time microsecond server-state markers.
* **Heuristic Triaging:** Calculates dynamic Moving Average (μ) and Moving Standard Deviation (σ). Flagged automatically when the current event value violates standard deviation boundaries.
* **LLM Engine:** Multi-turn Gemini 3.5 Flash server proxy. Triggered for dynamic root-cause compilation, correlation analysis across disparate streams, and mitigation SOP generation.

---

### 4. Privilege Matrix & Enforcement
Role-based authentication restricts endpoint changes and diagnostic overrides:

| Role | Dashboard Visibility | Stream Control & Injections | Security Configurations | Admin Purges |
| :--- | :--- | :--- | :--- | :--- |
| **Viewer** | Enabled (Read-only) | Locked | Locked | Locked |
| **Operator** | Enabled (Full access) | Enabled (Dynamic state modification) | Locked | Locked |
| **Admin** | Enabled (Full access) | Enabled (Full access) | Enabled (Override settings) | Enabled (Full purge permissions) |

---

### 5. Standard Operating Procedures (SOP)
In the event of a **Critical Severity Anomaly**:
1. **Lock Outflow:** Transition stream settings to dynamic pause state if cascading database errors are present.
2. **Consult Gemini:** Execute `COMPILE SYSTEM AI REPORT` inside the **AI Analytics** hub.
3. **Quarantine Tenant:** Revoke suspicious operator credentials in the **Identity Access** panel.
4. **Post Audit:** Purge historical metrics caches *only* after securing logs offsite.
