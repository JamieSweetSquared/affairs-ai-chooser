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

  function init() {
    var form = $("stack-cost-form");
    if (!form) return;

    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      var s = readForm(form);
      var est = estimate(s);
      render(s, est);
    });

    form.addEventListener("reset", function () {
      window.setTimeout(function () {
        $("calc-output").hidden = true;
        $("calc-disclaimer").hidden = true;
      }, 0);
    });

    // Selected-state polish for radios/checkboxes
    form.addEventListener("change", function (ev) {
      var t = ev.target;
      if (!t || !t.name) return;
      if (t.type === "radio") {
        var fs = t.closest("fieldset");
        if (fs) {
          fs.querySelectorAll("label.option").forEach(function (lab) {
            lab.classList.toggle("is-selected", lab.contains(t) && t.checked);
          });
        }
      }
      if (t.type === "checkbox") {
        var lab = t.closest("label.option");
        if (lab) lab.classList.toggle("is-selected", t.checked);
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
