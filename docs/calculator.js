/**
 * Solo stack cost calculator — research-labeled illustrative ranges.
 * Bands paraphrased from public vendor positioning (Kit / Leadpages / Surfer / systeme.io),
 * checked ~11 Sep 2026. Not quotes, not guarantees. User must verify live pricing.
 */
(function () {
  "use strict";

  var SYSTEME_BASE =
    "https://systeme.io/?sa=sa0281332032905064db809aa4c70fcdf0992f044d";
  var SYSTEME_UTM =
    "utm_source=affairs&utm_medium=calculator&utm_campaign=stack-cost";

  /** Illustrative monthly bands (USD) — research estimates only */
  var BANDS = {
    email: {
      label: "Email / list tool",
      note: "Creator ESPs often publish a free plan with subscriber caps; paid tiers commonly step up with list size. Check current Kit (and peers) pricing.",
      low: 0,
      high: 50,
      diyNote: null,
    },
    landing: {
      label: "Landing / campaign pages",
      note: "Specialist builders (e.g. Leadpages Grow published from ~$99/mo historically) can sit near or above a tight solo band. DIY (static / host / ESP forms) can be $0 until CRO is the bottleneck.",
      low: 0,
      high: 100,
      diyNote: "DIY path often $0–15/mo hosting until you need a paid builder.",
    },
    funnel: {
      label: "Funnel / automations",
      note: "All-in-ones that bundle pages + email + checkout (e.g. systeme.io) publish free / low starter bands; separate page builder + ESP usually costs more than one login.",
      low: 0,
      high: 50,
      diyNote: null,
    },
    seo: {
      label: "SEO writing / AI-visibility editor",
      note: "Paid SEO editors (e.g. Surfer) typically sit in a mid paid band for solo writers who publish weekly+. Skip until search / AI-answer traffic is a real channel — see SEO solo FAQ.",
      low: 50,
      high: 120,
      diyNote: "Often skip on free / starter budgets.",
    },
    aio: {
      label: "All-in-one (funnel + email + pages)",
      note: "systeme.io publishes a permanently free plan (contact / funnel caps) and a low paid Startup band (cited ~$17/mo historically). Re-check systeme.io pricing before you pay.",
      low: 0,
      high: 30,
      diyNote: null,
    },
  };

  var BUDGET_CAPS = {
    free: { label: "Free / freemium", softCap: 0, hint: "Prefer published free plans or DIY; paid specialists often overshoot." },
    starter: { label: "~$20–50/mo", softCap: 50, hint: "One paid job usually fits; stacking two paid specialists often does not." },
    mid: { label: "~$50–100/mo", softCap: 100, hint: "Room for one specialist or a modest AIO paid tier — rarely all four cycle-1 tools." },
    stretch: { label: "~$100–200/mo", softCap: 200, hint: "Still prefer one primary job; do not stack every category by default." },
  };

  function $(id) {
    return document.getElementById(id);
  }

  function systemeHref() {
    return SYSTEME_BASE + "&" + SYSTEME_UTM;
  }

  function readForm(form) {
    var fd = new FormData(form);
    return {
      budget: fd.get("budget") || "starter",
      email: !!fd.get("need_email"),
      landing: !!fd.get("need_landing"),
      funnel: !!fd.get("need_funnel"),
      seo: !!fd.get("need_seo"),
      aio: fd.get("prefer_aio") === "yes",
    };
  }

  function anyCoreNeed(s) {
    return s.email || s.landing || s.funnel;
  }

  /**
   * Build illustrative line items + totals.
   * All-in-one path collapses email/landing/funnel into one AIO band when preferred
   * and at least one of those needs is on.
   */
  function estimate(s) {
    var lines = [];
    var useAio = s.aio && anyCoreNeed(s);

    if (useAio) {
      lines.push(Object.assign({ key: "aio" }, BANDS.aio, {
        why: "You prefer one login and marked email, landing, and/or funnel needs.",
      }));
    } else {
      if (s.email) {
        lines.push(Object.assign({ key: "email" }, BANDS.email, {
          why: "Email / list toggle on — specialist ESP or AIO email module.",
        }));
      }
      if (s.landing) {
        lines.push(Object.assign({ key: "landing" }, BANDS.landing, {
          why: "Landing pages toggle on — builder or DIY.",
        }));
      }
      if (s.funnel) {
        lines.push(Object.assign({ key: "funnel" }, BANDS.funnel, {
          why: "Funnel / automations toggle on — often overlaps landing + email.",
        }));
      }
    }

    if (s.seo) {
      lines.push(Object.assign({ key: "seo" }, BANDS.seo, {
        why: "SEO writing toggle on — usually a separate paid editor (not covered by funnel AIO).",
      }));
    }

    if (!lines.length) {
      return {
        lines: [],
        low: 0,
        high: 0,
        empty: true,
        useAio: false,
        showSysteme: false,
      };
    }

    // Conservative sum: treat overlapping funnel+landing+email as partially additive when NOT on AIO
    var low = 0;
    var high = 0;
    if (useAio) {
      low += BANDS.aio.low;
      high += BANDS.aio.high;
      if (s.seo) {
        low += BANDS.seo.low;
        high += BANDS.seo.high;
      }
    } else {
      // Avoid double-counting funnel with landing+email: if all three, use email + max(landing,funnel) + optional seo
      var hasE = s.email;
      var hasL = s.landing;
      var hasF = s.funnel;
      if (hasE) {
        low += BANDS.email.low;
        high += BANDS.email.high;
      }
      if (hasL && hasF) {
        // Overlap: take the wider of landing/funnel highs once, keep lows at 0 DIY path
        low += Math.min(BANDS.landing.low, BANDS.funnel.low);
        high += Math.max(BANDS.landing.high, BANDS.funnel.high);
      } else if (hasL) {
        low += BANDS.landing.low;
        high += BANDS.landing.high;
      } else if (hasF) {
        low += BANDS.funnel.low;
        high += BANDS.funnel.high;
      }
      if (s.seo) {
        low += BANDS.seo.low;
        high += BANDS.seo.high;
      }
    }

    var showSysteme = useAio && (s.email || s.funnel);

    return {
      lines: lines,
      low: low,
      high: high,
      empty: false,
      useAio: useAio,
      showSysteme: showSysteme,
    };
  }

  function formatRange(low, high) {
    if (low === 0 && high === 0) return "$0";
    if (low === high) return "~$" + low + "/mo";
    return "~$" + low + "–$" + high + "/mo";
  }

  function recommendCopy(s, est) {
    var budget = BUDGET_CAPS[s.budget] || BUDGET_CAPS.starter;
    var parts = [];

    parts.push(
      "<strong>Research-labeled fit frame</strong> — illustrative only, from public vendor positioning (not a hands-on review, quote, or savings claim)."
    );

    if (est.empty) {
      parts.push(
        "Toggle at least one need (email, landing, funnel, or SEO) to see a rough monthly band."
      );
      return parts.join(" ");
    }

    if (est.showSysteme) {
      parts.push(
        "An <strong>all-in-one</strong> (pages + email + checkout under one login) matches the needs you marked. systeme.io publishes free / low starter bands for that shape of job — verify live pricing."
      );
    } else if (est.useAio && s.landing && !s.email && !s.funnel) {
      parts.push(
        "You prefer all-in-one with landing-only needs. A funnel AIO can work, but a static page / DIY host may be enough — see the landing-page FAQ before paying."
      );
    } else if (s.seo && !anyCoreNeed(s)) {
      parts.push(
        "SEO writing alone points at a specialist editor slot (Surfer-shaped), not a funnel AIO. Run the chooser or read the SEO solo FAQ."
      );
    } else if (!s.aio && (s.email || s.landing || s.funnel)) {
      parts.push(
        "You preferred a <strong>separate stack</strong>. Expect one bill per category — or DIY pages until CRO is the bottleneck. The chooser ranks Kit / Leadpages / Surfer / systeme.io by need."
      );
    }

    if (s.seo && anyCoreNeed(s)) {
      parts.push(
        "SEO tooling is usually <em>additive</em> to email/funnel spend — cycle-1 AIO tools are not SEO scoring editors."
      );
    }

    parts.push(budget.hint);

    if (est.high > budget.softCap && budget.softCap === 0) {
      parts.push(
        "Your toggles imply a paid band above free/freemium — prefer published free plans, DIY pages, or drop SEO until you have a publishing cadence."
      );
    } else if (est.high > budget.softCap && budget.softCap > 0) {
      parts.push(
        "Illustrative high end (~$" +
          est.high +
          "/mo) can sit above your " +
          budget.label +
          " ceiling — drop a category, DIY pages, or prefer one AIO bill over stacking specialists."
      );
    }

    return parts.join(" ");
  }

  function render(s, est) {
    var out = $("calc-output");
    var rangeEl = $("calc-range");
    var linesEl = $("calc-lines");
    var recEl = $("calc-recommendation");
    var ctaEl = $("calc-cta");
    var disclaimer = $("calc-disclaimer");

    out.hidden = false;
    out.setAttribute("tabindex", "-1");

    if (est.empty) {
      rangeEl.textContent = "—";
      linesEl.innerHTML = "<li>No needs selected yet.</li>";
    } else {
      rangeEl.textContent = formatRange(est.low, est.high);
      linesEl.innerHTML = est.lines
        .map(function (line) {
          var diy = line.diyNote
            ? "<br /><span class=\"calc-diy\">" + line.diyNote + "</span>"
            : "";
          return (
            "<li><strong>" +
            line.label +
            "</strong>: " +
            formatRange(line.low, line.high) +
            " <span class=\"calc-why\">(" +
            line.why +
            ")</span>" +
            "<br /><span class=\"calc-note\">" +
            line.note +
            "</span>" +
            diy +
            "</li>"
          );
        })
        .join("");
    }

    recEl.innerHTML = recommendCopy(s, est);
    disclaimer.hidden = false;

    if (est.showSysteme) {
      ctaEl.innerHTML =
        '<a class="cta" href="' +
        systemeHref() +
        '" target="_blank" rel="noopener noreferrer sponsored" data-affiliate="systeme">View systeme.io (affiliate)</a>' +
        ' · <a href="./#selector">Or run the chooser</a>' +
        ' · <a href="faq-all-in-one-vs-stack.html">AIO vs stack FAQ</a>' +
        ' · <a href="stack-under-100.html">≤$100 buy order</a>';
    } else {
      var faq = "guides.html";
      if (s.seo && !anyCoreNeed(s)) faq = "faq-seo-solo.html";
      else if (s.email && !s.landing && !s.funnel) faq = "faq-email-creators.html";
      else if (s.landing && !s.email && !s.funnel) faq = "faq-landing-page-builder.html";
      else if (s.funnel) faq = "faq-systeme-funnel.html";
      else if (!s.aio) faq = "faq-all-in-one-vs-stack.html";

      ctaEl.innerHTML =
        '<a class="cta btn-secondary" href="./#selector">Run the AI Tool Chooser</a>' +
        ' · <a href="' +
        faq +
        '">Relevant guide</a>' +
        ' · <a href="stack-under-100.html">≤$100 buy order</a>' +
        ' · <a href="guides.html">All guides</a>';
    }

    try {
      out.focus({ preventScroll: false });
    } catch (e) {
      /* ignore */
    }
  }

  var STORAGE_KEY = "affairs_chooser_events";

  var SCENARIOS = {
    newsletter: {
      budget: "starter",
      email: true,
      landing: false,
      funnel: false,
      seo: false,
      aio: false,
    },
    lead: {
      budget: "starter",
      email: true,
      landing: true,
      funnel: false,
      seo: false,
      aio: false,
    },
    paid: {
      budget: "mid",
      email: true,
      landing: true,
      funnel: true,
      seo: false,
      aio: true,
    },
  };

  function logEvent(type, detail) {
    var entry = {
      type: type,
      detail: detail || {},
      ts: new Date().toISOString(),
    };
    try {
      console.log("[affairs calculator]", entry);
      var raw = localStorage.getItem(STORAGE_KEY);
      var events = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(events)) events = [];
      events.push(entry);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(events.slice(-100)));
    } catch (e) {
      /* ignore */
    }
  }

  function applyState(form, s) {
    var budget = form.querySelector('input[name="budget"][value="' + s.budget + '"]');
    if (budget) budget.checked = true;
    form.querySelector('input[name="need_email"]').checked = !!s.email;
    form.querySelector('input[name="need_landing"]').checked = !!s.landing;
    form.querySelector('input[name="need_funnel"]').checked = !!s.funnel;
    form.querySelector('input[name="need_seo"]').checked = !!s.seo;
    var aioVal = s.aio ? "yes" : "no";
    var aio = form.querySelector('input[name="prefer_aio"][value="' + aioVal + '"]');
    if (aio) aio.checked = true;
    syncSelected(form);
  }

  function syncSelected(form) {
    form.querySelectorAll("fieldset").forEach(function (fs) {
      fs.querySelectorAll("label.option").forEach(function (lab) {
        var input = lab.querySelector("input");
        if (!input) return;
        lab.classList.toggle("is-selected", !!input.checked);
      });
    });
  }

  function stateToParams(s) {
    var p = new URLSearchParams();
    p.set("budget", s.budget);
    p.set("email", s.email ? "1" : "0");
    p.set("landing", s.landing ? "1" : "0");
    p.set("funnel", s.funnel ? "1" : "0");
    p.set("seo", s.seo ? "1" : "0");
    p.set("aio", s.aio ? "yes" : "no");
    return p;
  }

  function paramsToState(params) {
    if (!params.has("budget") && !params.has("email") && !params.has("aio")) {
      return null;
    }
    var budget = params.get("budget") || "starter";
    if (!BUDGET_CAPS[budget]) budget = "starter";
    function flag(key) {
      var v = params.get(key);
      return v === "1" || v === "true" || v === "yes";
    }
    return {
      budget: budget,
      email: flag("email"),
      landing: flag("landing"),
      funnel: flag("funnel"),
      seo: flag("seo"),
      aio: params.get("aio") === "yes" || params.get("aio") === "1",
    };
  }

  function buildShareUrl(s) {
    var url = new URL(window.location.href);
    // Drop prior form params; keep path; set fresh state params only (no PII)
    ["budget", "email", "landing", "funnel", "seo", "aio", "utm_source", "utm_medium", "utm_campaign", "utm_content"].forEach(function (k) {
      url.searchParams.delete(k);
    });
    var p = stateToParams(s);
    p.forEach(function (v, k) {
      url.searchParams.set(k, v);
    });
    return url.toString();
  }

  function runEstimate(form) {
    var s = readForm(form);
    var est = estimate(s);
    render(s, est);
    return s;
  }

  function init() {
    var form = $("stack-cost-form");
    if (!form) return;

    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      var s = runEstimate(form);
      logEvent("calc_estimate", {
        budget: s.budget,
        email: s.email,
        landing: s.landing,
        funnel: s.funnel,
        seo: s.seo,
        aio: s.aio,
      });
    });

    form.addEventListener("reset", function () {
      window.setTimeout(function () {
        $("calc-output").hidden = true;
        $("calc-disclaimer").hidden = true;
        syncSelected(form);
        var st = $("calc-copy-status");
        if (st) st.textContent = "";
      }, 0);
    });

    form.addEventListener("change", function (ev) {
      var t = ev.target;
      if (!t || !t.name) return;
      syncSelected(form);
    });

    document.querySelectorAll(".calc-scenario-btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var key = btn.getAttribute("data-scenario");
        var scenario = SCENARIOS[key];
        if (!scenario) return;
        applyState(form, scenario);
        runEstimate(form);
        logEvent("calc_scenario", { scenario: key });
        try {
          $("calc-output").scrollIntoView({ behavior: "smooth", block: "start" });
        } catch (e) {
          /* ignore */
        }
      });
    });

    var copyBtn = $("calc-copy-link");
    var copyStatus = $("calc-copy-status");
    if (copyBtn) {
      copyBtn.addEventListener("click", function () {
        var s = readForm(form);
        var absolute = buildShareUrl(s);
        function done(ok) {
          if (copyStatus) {
            copyStatus.textContent = ok
              ? "Link copied (budget/needs/aio only — no personal data)."
              : "Could not copy — select and copy from the address bar after estimating.";
          }
          logEvent("calc_copy_link", {
            ok: !!ok,
            budget: s.budget,
            email: s.email,
            landing: s.landing,
            funnel: s.funnel,
            seo: s.seo,
            aio: s.aio,
          });
        }
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(absolute).then(
            function () {
              done(true);
            },
            function () {
              done(false);
            }
          );
        } else {
          try {
            var ta = document.createElement("textarea");
            ta.value = absolute;
            ta.setAttribute("readonly", "");
            ta.style.position = "fixed";
            ta.style.left = "-9999px";
            document.body.appendChild(ta);
            ta.select();
            var ok = document.execCommand("copy");
            document.body.removeChild(ta);
            done(ok);
          } catch (e) {
            done(false);
          }
        }
      });
    }

    // Prefill from URL query params (budget, needs, aio) — no personal data
    var fromUrl = paramsToState(new URLSearchParams(window.location.search));
    if (fromUrl) {
      applyState(form, fromUrl);
      runEstimate(form);
      logEvent("calc_prefill_url", {
        budget: fromUrl.budget,
        email: fromUrl.email,
        landing: fromUrl.landing,
        funnel: fromUrl.funnel,
        seo: fromUrl.seo,
        aio: fromUrl.aio,
      });
    } else {
      syncSelected(form);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
