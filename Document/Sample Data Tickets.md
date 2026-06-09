# Sample Data Tickets
## Telemetry Payloads, Anomaly Signatures & System Alarms Directory

---

### 1. Overview
This reference document catalogs typical telemetry JSON payloads that represent structured anomalies, along with their corresponding threat profiles and ticket states. These samples are used for testing pipeline parsing robustness and modeling ML baseline thresholds.

---

### 2. Sample Payload 001 - API Latency Spike (Critical)
* **Status:** `Active`
* **Metric Source:** `api_latency`
* **Timestamp:** `2026-06-09T08:14:22Z`
* **Z-Score Event Value:** `5.21σ`

```json
{
  "ticket_id": "TKT-LATENCY-99812",
  "anomaly_score": 0.985,
  "metric_type": "api_latency",
  "current_value": 4850.2,
  "baseline_average": 220.5,
  "unit": "ms",
  "affected_nodes": ["apigw-east-01", "apigw-east-02"],
  "symptoms": [
    "HTTP 504 Gateway Timeout cascades",
    "Extreme connection backpressure on nginx proxy",
    "Downstream client retries doubling every 5 seconds"
  ]
}
```

---

### 3. Sample Payload 002 - DB Connections Saturation (High)
* **Status:** `Investigating`
* **Metric Source:** `db_connections`
* **Timestamp:** `2026-06-09T09:02:11Z`
* **Z-Score Event Value:** `4.12σ`

```json
{
  "ticket_id": "TKT-DBCONN-88124",
  "anomaly_score": 0.892,
  "metric_type": "db_connections",
  "current_value": 492,
  "baseline_average": 85,
  "unit": "connections",
  "affected_nodes": ["postgres-primary-repl01"],
  "symptoms": [
    "Connection pool exhaustion on web containers",
    "Drizzle query timeout exceeding 3000ms limit",
    "Locks on centralized schema migration table"
  ]
}
```

---

### 4. Sample Payload 003 - Authentication Failures Spike (Medium)
* **Status:** `Resolved`
* **Metric Source:** `auth_failures`
* **Timestamp:** `2026-06-09T10:01:00Z`
* **Z-Score Event Value:** `3.15σ`

```json
{
  "ticket_id": "TKT-AUTHFAIL-10029",
  "anomaly_score": 0.714,
  "metric_type": "auth_failures",
  "current_value": 142.0,
  "baseline_average": 15.0,
  "unit": "failures/min",
  "affected_nodes": ["auth-server-pool-us"],
  "symptoms": [
    "Brute force signature detected on endpoint /api/auth/login",
    "IP range blocklists activated automatically on Cloudflare",
    "High volume of session cookie rejection events"
  ]
}
```
