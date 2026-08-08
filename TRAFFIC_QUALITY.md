# 🛡️ DeepLink Pro — Traffic Quality Subsystem Documentation

> **Document Version:** 2.0  
> **Subsystem:** Traffic Quality Risk Scoring Engine  
> **Design Philosophy:** Data Minimization • Privacy-Aware Signals • Configurable Actions • Zero Identity Claims

---

## 1. AUDITED SIGNALS CLASSIFICATION

DeepLink Pro strictly enforces **data minimization**. Instead of blindly capturing intrusive hardware fingerprints (e.g. font enumeration, battery status, or web audio oscillators), DeepLink Pro evaluates only 7 audited signals:

| Signal Name | Source | Classification | Base Weight | Technical Justification |
| :--- | :--- | :--- | :---: | :--- |
| **`automation_signature`** | Browser | `reliable` | +0.45 | Detects `navigator.webdriver`, `window.domAutomation`, `__puppeteer_evaluation_script__`, `_phantom`. High reliability. |
| **`headless_browser`** | Browser | `reliable` | +0.35 | `HeadlessChrome` string or zero viewport dimensions (`0x0`) in non-mobile background context. |
| **`known_crawler`** | Server | `reliable` | +0.30 | Unverified web crawler user-agent strings. Subject to allowlist safeguards for Googlebot/Bingbot. |
| **`abnormal_request_rate`** | Server | `reliable` | +0.35 | Same IP hitting endpoint > 100 times in 1 minute sliding window. |
| **`proxy_or_vpn`** | Server | `conditional` | +0.25 | `Via`, `X-Forwarded-For` anomalies, `X-Proxy-ID`, `X-Tor-Exit-Node`. Conditional due to mobile carrier proxy overlaps. |
| **`header_inconsistency`** | Server | `weak` | +0.15 | Missing standard `Accept-Language` or `Accept` headers in non-API HTTP requests. Weak signal on native mobile apps. |
| **`screen_geometry_anomaly`** | Browser | `conditional` | +0.15 | `outerWidth === 0` or `screen.width < viewport.width`. Flags virtual display environments. |

### Excluded Signals (Privacy & Browser Policy Minimization):
* ❌ **Battery Status API:** Excluded (deprecated in Safari/Firefox; privacy-sensitive tracking vector).
* ❌ **Font Enumeration Lists:** Excluded (intrusive canvas font fingerprinting).
* ❌ **WebAudio Frequency Oscillator Hashes:** Excluded (fragile across OS updates & audio driver changes).
* ❌ **Bluetooth & USB Device Enumerations:** Excluded (requires browser permissions; privacy risk).

---

## 2. SCORING MODEL & CLASSIFICATIONS

The risk score is calculated as a normalized weighted sum bounded between `0.00` (Verified Human) and `1.00` (High Suspicious Risk):

$$\text{RiskScore} = \min\left(1.00, \sum_{\text{reason}} \text{Weight}(\text{reason})\right)$$

### Risk Categories:
* **`low_risk` (`0.00` to `0.39`):** Normal human browser behavior.
* **`suspicious` (`0.40` to `0.69`):** Traffic exhibiting network or proxy anomalies.
* **`high_risk` (`0.70` to `1.00`):** Automation signatures, headless drivers, or extreme request burst rates.

---

## 3. CONFIGURABLE ACTIONS & AUTOMATION SAFEGUARDS

DeepLink Pro **never automatically blocks traffic** purely because a score exceeds `0.65`. Actions are strictly configurable by the campaign owner:

* **`log_only` (Default):** Log score and reasons for analytics transparency.
* **`suppress_attribution_pixel`:** Pause ad conversion pixel triggers on high risk clicks to protect ad network optimization algorithms.
* **`block_redirect`:** Explicitly block HTTP redirect on verified malicious script traffic.

---

## 4. FALSE POSITIVE SAFEGUARDS

1. **Verified Search Engine Allowlist:** Verified search engine crawlers (e.g. `Googlebot`, `Bingbot`) are identified and assigned a `low_risk` score (`0.05`) with reason `verified_search_crawler`.
2. **Mobile Carrier Proxy Allowance:** Mobile carrier networks routing through gateway proxies are evaluated with reduced weight (+0.25) rather than instant blocking.

---

## 5. BROWSER LIMITATIONS & PRIVACY STATEMENT

* **No Identity Proofs:** Browser fingerprinting does **NOT** prove human identity or user authenticity. It evaluates device environment attributes to estimate traffic risk probability.
* **Safari ITP Compatibility:** Does not attempt to bypass Apple Intelligent Tracking Prevention or iOS Private Relay.
* **Short-Lived Retention:** Raw telemetry signal buffers are automatically purged after 14 days.
