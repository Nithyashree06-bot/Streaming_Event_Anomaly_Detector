# Verification Test Cases
## Regression Testing Matrix & Validation SOPs for Real-Time Detection

---

### 1. Introduction
This test matrix provides step-by-step verification protocols to guarantee the mathematical accuracy, role security enforcement, and reporting integrity of the **Anomaly.Stream** system.

---

### 2. Functional Test Cases

#### TC-001: Autonomic Sliding Z-Score Validation
* **Preconditions:** Dynamic stream is `LIVE`. Ingestion interval set to `1000ms`.
* **Action:**
  1. Open the System Dashboard tab.
  2. Locate the **Injections Panel** under **Interactive Telemetry Stress Injections**.
  3. Select metric `API Latency` and request a `SPIKE` with a multiplier of `15.0x`.
* **Expected Result:**
  * System immediately registers a metric event with score value exceeding standard boundary.
  * A sound-alarm or visual banner is thrown instantly.
  * A new anomaly ticket is created in the Anomalies Registry with status `Active` and Severity `Critical` or `High`.

#### TC-002: Role Privilege Boundary Integrity (Viewers Lockout)
* **Preconditions:** Authenticated under email `viewer@anomaly.io` (assigned role **Viewer**).
* **Action:**
  1. Navigate to the **Settings** view.
  2. Attempt to drag the "Anomaly Z-Score Threshold" slider or input a new value.
  3. Attempt to click the "Hard Purge Historical logs" button.
* **Expected Result:**
  * Control sliders are disabled visually (`disabled` attribute activated).
  * Attempting to write modifications results in security error box: *"Security Policy Error: Viewers do not have roles permission to modify system constants."*
  * Admin purge buttons are hidden or fully blocked.

#### TC-003: Gemini Diagnosis Report Synthesis
* **Preconditions:** At least 3 active anomalies registered. Gemini API key configured on server.
* **Action:**
  1. Navigate to **AI Analytics**.
  2. Click `COMPILE SYSTEM AI REPORT`.
* **Expected Result:**
  * "Consulting Neural Cores..." load state triggers.
  * Client sends system stats, recent anomalies, and stream contexts in the request payload.
  * Output area streams or renders a cleanly formatted markdown summary containing:
    - Overall Threat Summary
    - Multi-Thread Correlative Analysis
    - Remediation SOP Recommendation.
