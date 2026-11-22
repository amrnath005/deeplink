/**
 * DeepLink Pro — Zero-SDK Web-to-Native Bridge (2KB Edge Receiver)
 * Embed in any website or PWA: <script src="https://deeplink.pro/deeplink-bridge.js" data-app-scheme="my-app://"></script>
 */
(function () {
  "use strict";

  const scriptTag = document.currentScript || document.querySelector("script[data-app-scheme]");
  const defaultScheme = scriptTag ? scriptTag.getAttribute("data-app-scheme") : null;

  window.DeepLinkBridge = {
    /**
     * Resolve deferred deep link payload and auto-trigger native app launch
     */
    resolve: function (options) {
      options = options || {};
      const scheme = options.scheme || defaultScheme;
      const urlParams = new URLSearchParams(window.location.search);
      const targetParam = urlParams.get("dl_target") || urlParams.get("target");

      // Extract stored deferred telemetry payload
      let storedPayload = null;
      try {
        storedPayload = JSON.parse(localStorage.getItem("__dl_deferred_payload") || "null");
      } catch (e) {}

      const resolvedScheme = targetParam ? decodeURIComponent(targetParam) : scheme;

      if (resolvedScheme) {
        console.log("[DeepLink Bridge] OS Kernel Teleporting to:", resolvedScheme);
        
        // Attempt native OS scheme launch
        const now = Date.now();
        window.location.href = resolvedScheme;

        // Fallback execution if app is not installed
        setTimeout(function () {
          if (Date.now() - now < 1500) {
            if (options.fallbackUrl) {
              window.location.href = options.fallbackUrl;
            } else if (options.onFallback) {
              options.onFallback(resolvedScheme);
            }
          }
        }, 1200);
      }

      return {
        scheme: resolvedScheme,
        telemetryReady: true,
        sessionHash: storedPayload ? storedPayload.hash : "dl_anon_" + Math.random().toString(36).substring(2, 9)
      };
    }
  };

  // Auto-resolve on DOM content loaded
  document.addEventListener("DOMContentLoaded", function () {
    if (defaultScheme) {
      window.DeepLinkBridge.resolve();
    }
  });
})();
