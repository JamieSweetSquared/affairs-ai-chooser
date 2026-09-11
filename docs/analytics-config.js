/* Affairs free aggregate analytics config.
 * Cloudflare Web Analytics token — public beacon id (not a secret).
 * Empty = disabled. localStorage events remain regardless.
 */
window.AFFAIRS_ANALYTICS = {
  provider: "cloudflare-web-analytics",
  /* Set after CF Web Analytics site is created for jamiesweetsquared.github.io */
  cloudflareToken: "",
  enabled: false
};
