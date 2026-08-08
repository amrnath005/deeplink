# 🔒 DeepLink Pro — Technical Privacy & Telemetry Review

> **Audit Scope:** Telemetry Signal Collection • Privacy Safeguards • Data Retention  
> **Compliance Stance:** Data Minimization First • Zero Fingerprinting Identity Claims

---

## 1. AUDITED TELEMETRY SIGNAL INVENTORY

DeepLink Pro strictly enforces **data minimization**. Instead of capturing intrusive hardware tracking vectors, the risk scoring model in [`src/lib/traffic_quality.ts`](file:///c:/Users/salte/deeplink-platform/frontend/src/lib/traffic_quality.ts) evaluates only 7 audited signals:

| Signal Name | Source | Stored? | Retention | Risk Scoring Use | Privacy Sensitivity |
| :--- | :--- | :---: | :---: | :---: | :--- |
| `automation_signature` | Browser | Yes | 14 Days | Weight: +0.45 | Low (Standard JS property check) |
| `headless_browser` | Browser | Yes | 14 Days | Weight: +0.35 | Low (Viewport / UA string) |
| `known_crawler` | Server | Yes | 14 Days | Weight: +0.30 | Low (Public search bot UA) |
| `abnormal_request_rate` | Server | Yes | 14 Days | Weight: +0.35 | Low (IP rate count) |
| `proxy_or_vpn` | Server | Yes | 14 Days | Weight: +0.25 | Medium (Via / Proxy headers) |
| `header_inconsistency` | Server | Yes | 14 Days | Weight: +0.15 | Low (Accept headers) |
| `screen_geometry_anomaly` | Browser | Yes | 14 Days | Weight: +0.15 | Low (Screen vs Viewport dims) |

### Excluded Intrusive Signals:
* ❌ **Battery Status API:** Excluded (deprecated in Safari/Firefox; invasive tracking vector).
* ❌ **Font Enumeration Lists:** Excluded (canvas font enumeration tracking).
* ❌ **WebAudio Oscillator Hashes:** Excluded (fragile across OS/audio driver updates).
* ❌ **Bluetooth / USB Devices:** Excluded (requires browser permissions).

---

## 2. DATA RETENTION & PURGE MECHANISM

* **14-Day Purge Task:** Raw browser telemetry records (`raw_telemetry` table) are automatically purged after 14 days via `purgeExpiredTelemetry()` in [`src/lib/repository/store_v2.ts`](file:///c:/Users/salte/deeplink-platform/frontend/src/lib/repository/store_v2.ts).
* **Operational Rollups:** Aggregated daily campaign metrics retain zero PII or raw IP addresses.

---

## 3. SEPARATION OF TECHNICAL PRIVACY VS LEGAL COMPLIANCE

### Technical Privacy Reality:
* Fingerprinting does **NOT** prove human identity or user authenticity.
* DeepLink Pro uses environment heuristics strictly for bot risk probability estimation.

### Legal / Compliance Review Notice:
* *GDPR / CCPA / ePrivacy Directive:* Formal compliance certifications (DPA, cookie consent requirements, user data deletion requests under GDPR Article 17) require legal counsel review prior to EU/US commercial operation.
