/**
 * Affairs free aggregate analytics loader.
 * Loads Cloudflare Web Analytics beacon when AFFAIRS_ANALYTICS.cloudflareToken is set.
 * Does not replace localStorage affairs_chooser_events (see measurement.html).
 */
(function () {
  "use strict";
  var cfg = window.AFFAIRS_ANALYTICS || {};
  if (!cfg.enabled || !cfg.cloudflareToken) return;
  if (cfg.provider !== "cloudflare-web-analytics") return;
  var s = document.createElement("script");
  s.defer = true;
  s.src = "https://static.cloudflareinsights.com/beacon.min.js";
  s.setAttribute(
    "data-cf-beacon",
    JSON.stringify({ token: cfg.cloudflareToken })
  );
  document.head.appendChild(s);
})();
