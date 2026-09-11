(function () {
  "use strict";

  var STORAGE_KEY = "affairs_chooser_events";

  /** Stub ready for a later analytics beacon (e.g. POST to /collect). */
  function sendAnalyticsBeacon(payload) {
    if (typeof console !== "undefined" && console.debug) {
      console.debug("[affairs analytics stub]", payload);
    }
  }

  function getEvents() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  function logEvent(type, detail) {
    var entry = {
      type: type,
      detail: detail || {},
      ts: new Date().toISOString(),
    };
    console.log("[affairs chooser]", entry);
    var events = getEvents();
    events.push(entry);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(events.slice(-100)));
    } catch (e) {
      /* ignore quota */
    }
    sendAnalyticsBeacon(entry);
  }

  // Named cycle-1 slots. Pros/cons are research-labeled fit copy — not hands-on reviews.
  // Positioning paraphrased from vendor sites (kit.com, leadpages.com, surferseo.com, systeme.io), 2026-09-11.
  var TOOLS = [
    {
      slug: "kit",
      name: "Kit",
      category: "Email for creators",
      typicalBuyer: "Creators, newsletter writers, and solo businesses who want email as the hub.",
      source: "kit.com",
      faqHref: "faq-email-creators.html",
      faqLabel: "Creator email decision guide",
      fit: "Kit positions itself as an email-first operating system for creators: newsletters, broadcasts, automations, landing pages/forms, and selling digital products from the list. Often a fit when the job is owning an audience in email — not a generic B2B ESP or a CRO lab.",
      pros: [
        "Published as creator email + newsletter tooling (tags, segments, automations)",
        "Official feature set includes landing pages, forms, and list-growth / recommendation flows",
        "Commerce (digital products, subscriptions, sponsorships) is part of their positioning",
        "Publishes a free plan (subscriber-count limits — check current kit.com pricing)",
        "Aimed at non-technical creator businesses rather than enterprise marketing clouds",
      ],
      cons: [
        "Not positioned as transactional / product-email for generic ecommerce stacks",
        "Pricing typically scales with list size (confirm current plans; we have not audited billing)",
        "Landing pages here are creator-list tools, not a dedicated A/B testing / heatmap platform",
        "Not an SEO content editor, helpdesk, or scheduler",
      ],
    },
    {
      slug: "leadpages",
      name: "Leadpages",
      category: "Landing pages",
      typicalBuyer: "Marketers, small businesses, and agencies who need campaign pages with lead capture.",
      source: "leadpages.com",
      faqHref: "faq-landing-page-builder.html",
      faqLabel: "Landing page builder vs DIY",
      fit: "Leadpages positions itself as an AI landing-page builder with hosting, forms, A/B testing, and (on higher plans) Smart Traffic / heatmaps. Often a fit when paid or email traffic needs a single-purpose conversion page — not an ESP or an SEO writer.",
      pros: [
        "Published job: build, host, and optimize standalone campaign / lead-gen pages",
        "Lead capture plus integrations to common email and CRM tools (per their site)",
        "A/B testing called out as built-in from paid plans; heatmaps / Smart Traffic on higher tiers",
        "Useful when you want pages without rebuilding a full marketing site",
        "Site lists a 7-day trial and paid plans starting at $99/mo (Grow) — check live pricing",
      ],
      cons: [
        "Paid product on their public pricing (not a free landing-page tool)",
        "Overlaps with website builders or ESP landing pages you may already pay for",
        "Not an email platform, SEO content editor, or support-chat product",
        "Confirm current plan features (testing, heatmaps, traffic rules) before committing",
      ],
    },
    {
      slug: "surfer",
      name: "Surfer",
      category: "SEO / AI content visibility",
      typicalBuyer: "Marketers, agencies, and content teams optimizing pages for search and AI answers.",
      source: "surferseo.com",
      faqHref: "faq-seo-solo.html",
      faqLabel: "SEO tool for solo writers (when to skip)",
      fit: "Surfer positions itself as an AI visibility platform with a Content Editor: SERP-based writing guidelines, a Content Score, and (in 2026 marketing) AI-search citation visibility. Often a fit when you publish content and want on-page SEO / AI-answer guidance — scores are not ranking guarantees.",
      pros: [
        "Published core workflow: write/optimize content against live SERP (and AI-search) research",
        "Content Score / editor guidelines are the product, not a general website builder",
        "Aimed at marketers, agencies, SEOs, and in-house content teams who ship regularly",
        "Also markets AI-answer visibility (how models describe a brand) alongside classic on-page SEO",
        "Useful as a writing companion when SEO content — not email or landing-page CRO — is the job",
      ],
      cons: [
        "Scores and guidelines are research-style suggestions, not ranking or citation guarantees",
        "Not an email tool, landing-page CRO suite, helpdesk, or scheduler",
        "Best value if you produce or refresh content on a cadence (their own case studies assume that)",
        "May overlap with other SEO suites (keywords, rank tracking, broader site crawls)",
      ],
    },
    {
      slug: "systeme",
      name: "systeme.io",
      category: "Funnel / email / all-in-one",
      typicalBuyer: "Solopreneurs, coaches, creators, and small online businesses who want funnels, email, and selling in one dashboard.",
      source: "systeme.io",
      faqHref: "faq-systeme-funnel.html",
      faqLabel: "Funnel + email all-in-one (when it fits)",
      // Live affiliate href (joined 2026-09-11). Pending approval ≠ cash. CTA builder appends UTMs.
      affiliateHref: "https://systeme.io/?sa=sa0281332032905064db809aa4c70fcdf0992f044d",
      fit: "systeme.io positions itself as an all-in-one platform for online businesses: sales funnels, email marketing (unlimited sends on published plans), landing/sales pages, courses, payments, and an affiliate program in one account. Often a fit when the job is a simple funnel-plus-email stack on a budget — not a specialist ESP, a dedicated CRO lab, or an SEO content editor.",
      pros: [
        "Published job: replace a split stack (funnels + email + courses + checkout) with one dashboard",
        "Official feature set includes funnel builder, email broadcasts/sequences, tagging, and landing/sales pages",
        "Publishes a permanently free plan (contact / funnel limits — check current systeme.io pricing)",
        "Paid plans are marketed from a low monthly band (Startup cited around $17/mo on their pricing page)",
        "Aimed at entrepreneurs and small online businesses rather than enterprise marketing clouds",
      ],
      cons: [
        "All-in-one breadth is the pitch — not a specialist creator ESP, landing-page CRO suite, or SEO writer",
        "Free-plan funnel / course / contact caps apply (confirm live limits before you commit)",
        "Not an SEO content editor, helpdesk, or dedicated scheduling/ops product",
        "Design flexibility and third-party integrations may be narrower than a best-of-breed stack (vendor comparison, not a lab test)",
      ],
    },
  ];

  // Documented on methodology.html. Need is the main weight; budget/team only where vendors publish a signal.
  // systeme.io points are from published positioning (systeme.io / pricing, 2026-09-11) — not lab scores:
  //   writing 2: email + funnel/landing pages exist; not a writing editor (Surfer) or creator-ESP-first (Kit)
  //   seo 0: not an SEO / content-score product
  //   support 0: not a helpdesk/chat product the buyer would run
  //   scheduling 1: booking calendar is published; still not a dedicated ops/scheduler
  //   budget.free 2 / starter 2: permanently free plan + Startup cited ~$17/mo
  //   budget.team 1 / enterprise 0: paid plans can sit in $50–200; entrepreneur, not enterprise, positioning
  //   team.solo 2 / small 2 / mid 1 / large 0: solopreneurs and small online businesses
  var WEIGHTS = {
    need: {
      writing: { kit: 3, leadpages: 1, surfer: 3, systeme: 2 },
      seo: { kit: 1, leadpages: 1, surfer: 4, systeme: 0 },
      support: { kit: 1, leadpages: 1, surfer: 0, systeme: 0 },
      scheduling: { kit: 1, leadpages: 1, surfer: 0, systeme: 1 },
    },
    budget: {
      free: { kit: 2, leadpages: 0, surfer: 0, systeme: 2 },
      starter: { kit: 2, leadpages: 0, surfer: 0, systeme: 2 },
      team: { kit: 1, leadpages: 2, surfer: 1, systeme: 1 },
      enterprise: { kit: 0, leadpages: 1, surfer: 2, systeme: 0 },
    },
    team: {
      solo: { kit: 2, leadpages: 1, surfer: 1, systeme: 2 },
      small: { kit: 2, leadpages: 2, surfer: 1, systeme: 2 },
      mid: { kit: 1, leadpages: 2, surfer: 2, systeme: 1 },
      large: { kit: 1, leadpages: 2, surfer: 2, systeme: 0 },
    },
  };

  var FAQ_BY_NEED = {
    writing: [
      { href: "faq-email-creators.html", label: "Creator email / newsletter guide" },
      { href: "faq-systeme-funnel.html", label: "Funnel + email all-in-one" },
      { href: "stack-under-100.html", label: "Stack on ≤$50–100/mo" },
    ],
    seo: [
      { href: "faq-seo-solo.html", label: "SEO / AI-visibility for solo writers" },
      { href: "stack-under-100.html", label: "Stack on ≤$50–100/mo" },
      { href: "compare-kit-leadpages-surfer.html", label: "Thin compare" },
    ],
    support: [
      { href: "stack-under-100.html", label: "What to buy first (and when to skip)" },
      { href: "compare-kit-leadpages-surfer.html", label: "What these tools are (and are not)" },
      { href: "methodology.html", label: "Why support/chat mismatches" },
    ],
    scheduling: [
      { href: "stack-under-100.html", label: "What to buy first (and when to skip)" },
      { href: "compare-kit-leadpages-surfer.html", label: "What these tools are (and are not)" },
      { href: "methodology.html", label: "Why scheduling/ops mismatches" },
    ],
  };

  function scoreTool(slug, answers) {
    var n = (WEIGHTS.need[answers.need] || {})[slug] || 0;
    var b = (WEIGHTS.budget[answers.budget] || {})[slug] || 0;
    var t = (WEIGHTS.team[answers.team] || {})[slug] || 0;
    return { total: n + b + t, need: n, budget: b, team: t };
  }

  function orderTools(answers) {
    return TOOLS.map(function (tool) {
      return { tool: tool, score: scoreTool(tool.slug, answers) };
    }).sort(function (a, b) {
      if (b.score.total !== a.score.total) return b.score.total - a.score.total;
      return TOOLS.indexOf(a.tool) - TOOLS.indexOf(b.tool);
    });
  }

  function mismatchCopy(need, budget) {
    if (need === "support") {
      return "Mismatch: none of Kit, Leadpages, Surfer, or systeme.io is a support-chat or helpdesk product. Showing the cycle-1 slots anyway, ordered by nearest published-fit — not a recommendation to buy them for support.";
    }
    if (need === "scheduling") {
      return "Mismatch: none of Kit, Leadpages, Surfer, or systeme.io is a dedicated scheduling / ops product (systeme.io publishes a booking calendar — nearest published-fit, not a Calendly replacement claim). Showing the cycle-1 slots anyway, ordered by nearest published-fit — not a recommendation to buy them for scheduling.";
    }
    if (
      (budget === "free" || budget === "starter") &&
      need !== "writing"
    ) {
      return "Budget note: on free / starter bands, Leadpages’ published Grow plan (~$99/mo) and paid SEO editors often sit above the band. Prefer Kit’s or systeme.io’s published free plans or DIY pages unless SEO/content tooling is clearly the job — see the stack guide.";
    }
    return "";
  }

  function appendChooserUtms(href, slug) {
    // Merge UTMs onto an existing query (e.g. ?sa=… already present → use & for utm).
    var hasQuery = href.indexOf("?") !== -1;
    var params =
      "utm_source=affairs&utm_medium=chooser&utm_campaign=" +
      encodeURIComponent(slug);
    if (!hasQuery) return href + "?" + params;
    var joiner = href.charAt(href.length - 1) === "?" || href.charAt(href.length - 1) === "&" ? "" : "&";
    return href + joiner + params;
  }

  function ctaHref(tool) {
    if (tool.affiliateHref) {
      return appendChooserUtms(tool.affiliateHref, tool.slug);
    }
    return (
      "/go/placeholder?utm_source=affairs&utm_medium=chooser&utm_campaign=" +
      encodeURIComponent(tool.slug)
    );
  }

  function isPlaceholderHref(href) {
    if (!href) return true;
    return href.indexOf("/go/") === 0 || href.indexOf("/go/placeholder") !== -1;
  }

  function renderFaqLinks(answers) {
    var el = document.getElementById("faq-links");
    if (!el) return;
    var links = FAQ_BY_NEED[answers.need] || [
      { href: "stack-under-100.html", label: "Stack on ≤$50–100/mo" },
      { href: "compare-kit-leadpages-surfer.html", label: "Thin compare" },
    ];
    el.hidden = false;
    el.innerHTML =
      "<strong>Related guides:</strong> " +
      links
        .map(function (l) {
          return '<a href="' + l.href + '">' + l.label + "</a>";
        })
        .join(" · ") +
      ' · <a href="methodology.html">Methodology</a>';
  }

  function renderCards(ranked, answers) {
    var container = document.getElementById("cards");
    container.innerHTML = "";
    ranked.forEach(function (row, i) {
      var tool = row.tool;
      var score = row.score;
      var card = document.createElement("article");
      card.className = "card";
      card.setAttribute("data-tool-slug", tool.slug);

      var badge = document.createElement("span");
      badge.className = "placeholder-badge";
      badge.textContent = "Research placeholder — not a hands-on review";

      var h3 = document.createElement("h3");
      h3.textContent = tool.name;

      var cat = document.createElement("p");
      cat.className = "match";
      cat.textContent =
        "#" +
        (i + 1) +
        " · " +
        tool.category +
        " · score " +
        score.total +
        " (need " +
        score.need +
        " + budget " +
        score.budget +
        " + team " +
        score.team +
        ") · " +
        answers.need +
        " · " +
        answers.budget +
        " · " +
        answers.team;

      var fit = document.createElement("p");
      fit.className = "fit";
      fit.textContent = tool.fit;

      var buyer = document.createElement("p");
      buyer.className = "buyer";
      buyer.textContent = "Typical buyer (published): " + tool.typicalBuyer;

      var source = document.createElement("p");
      source.className = "buyer";
      source.textContent = "Positioning source: " + tool.source + " — research, not a review.";

      var prosLabel = document.createElement("p");
      prosLabel.className = "label";
      prosLabel.textContent =
        "Fit notes — Research placeholder — not a hands-on review";

      var pros = document.createElement("ul");
      tool.pros.forEach(function (p) {
        var li = document.createElement("li");
        li.textContent = p;
        pros.appendChild(li);
      });

      var consLabel = document.createElement("p");
      consLabel.className = "label";
      consLabel.textContent =
        "Caveats — Research placeholder — not a hands-on review";

      var cons = document.createElement("ul");
      tool.cons.forEach(function (c) {
        var li = document.createElement("li");
        li.textContent = c;
        cons.appendChild(li);
      });

      var related = document.createElement("p");
      related.className = "related-faq";
      related.innerHTML =
        'Related: <a href="' +
        tool.faqHref +
        '">' +
        tool.faqLabel +
        '</a> · <a href="stack-under-100.html">Stack ≤$50–100/mo</a>';

      var cta = document.createElement("a");
      cta.className = "cta";
      var href = ctaHref(tool);
      cta.href = href;
      if (tool.affiliateHref) {
        cta.textContent = "View " + tool.name;
        cta.setAttribute("rel", "noopener noreferrer sponsored");
        cta.setAttribute("target", "_blank");
      } else {
        cta.textContent = "View " + tool.name + " (placeholder CTA)";
      }
      cta.setAttribute("data-affiliate", tool.slug);
      cta.setAttribute("data-rank", String(i + 1));
      cta.addEventListener("click", function (ev) {
        logEvent("affiliate_click", {
          slug: tool.slug,
          rank: i + 1,
          href: cta.getAttribute("href"),
          score: score,
          answers: answers,
        });
        // /go/* not hosted on Pages yet — keep href for UTM inspection, prevent 404 nav.
        // Live affiliateHref destinations (systeme.io) should navigate.
        if (isPlaceholderHref(cta.getAttribute("href")) && !ev.metaKey && !ev.ctrlKey) {
          ev.preventDefault();
        }
      });

      card.appendChild(badge);
      card.appendChild(h3);
      card.appendChild(cat);
      card.appendChild(fit);
      card.appendChild(buyer);
      card.appendChild(source);
      card.appendChild(prosLabel);
      card.appendChild(pros);
      card.appendChild(consLabel);
      card.appendChild(cons);
      card.appendChild(related);
      card.appendChild(cta);
      container.appendChild(card);
    });
  }

  var form = document.getElementById("chooser-form");
  var results = document.getElementById("results");
  var resetBtn = document.getElementById("reset-btn");
  var mismatchEl = document.getElementById("mismatch-note");
  var progressFill = document.getElementById("progress-fill");
  var progressLabel = document.getElementById("progress-label");
  var formHint = document.getElementById("form-hint");
  var submitBtn = document.getElementById("submit-btn");
  var FIELDS = ["budget", "need", "team"];

  function readAnswers() {
    var fd = new FormData(form);
    return {
      budget: fd.get("budget") || "",
      need: fd.get("need") || "",
      team: fd.get("team") || "",
    };
  }

  function updateProgress() {
    var answers = readAnswers();
    var filled = FIELDS.filter(function (f) {
      return !!answers[f];
    }).length;

    if (progressFill) progressFill.style.width = (filled / 3) * 100 + "%";
    if (progressLabel) {
      progressLabel.textContent = "Progress: " + filled + " of 3 answered";
    }

    FIELDS.forEach(function (name) {
      var fs = form.querySelector('fieldset[data-step="' + name + '"]');
      var hint = form.querySelector('[data-hint-for="' + name + '"]');
      if (fs) {
        if (answers[name]) fs.classList.add("is-complete");
        else fs.classList.remove("is-complete");
      }
      if (hint) hint.textContent = answers[name] ? "✓" : "";
    });

    form.querySelectorAll("label.option").forEach(function (label) {
      var input = label.querySelector('input[type="radio"]');
      if (input && input.checked) label.classList.add("is-selected");
      else label.classList.remove("is-selected");
    });

    if (formHint) {
      if (filled === 0) {
        formHint.hidden = false;
        formHint.textContent =
          "Pick a budget, primary need, and team size. Support/chat and scheduling will show a mismatch — those jobs are not in the cycle-1 slots.";
      } else if (filled < 3) {
        formHint.hidden = false;
        var missing = FIELDS.filter(function (f) {
          return !answers[f];
        }).map(function (f) {
          return f === "budget" ? "budget band" : f === "need" ? "primary need" : "team size";
        });
        formHint.textContent =
          "Still needed: " + missing.join(" · ") + ". Then tap Show recommendations.";
      } else {
        formHint.hidden = true;
        formHint.textContent = "";
      }
    }

    if (submitBtn) {
      submitBtn.disabled = filled < 3;
      submitBtn.setAttribute("aria-disabled", filled < 3 ? "true" : "false");
    }
  }

  form.addEventListener("change", function (e) {
    updateProgress();
    var t = e.target;
    if (t && t.name && FIELDS.indexOf(t.name) !== -1) {
      var answers = readAnswers();
      var filled = FIELDS.filter(function (f) {
        return !!answers[f];
      }).length;
      logEvent("progress", { field: t.name, value: t.value, filled: filled });
    }
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var answers = readAnswers();
    if (!answers.budget || !answers.need || !answers.team) {
      if (formHint) {
        formHint.hidden = false;
        formHint.textContent =
          "Select all three answers (budget, need, team) before showing recommendations.";
      }
      var firstEmpty = form.querySelector(
        'input[name="budget"]:not(:checked), input[name="need"]:not(:checked), input[name="team"]:not(:checked)'
      );
      // focus the first unanswered fieldset's first radio
      FIELDS.some(function (name) {
        if (!answers[name]) {
          var radio = form.querySelector('input[name="' + name + '"]');
          if (radio) radio.focus();
          return true;
        }
        return false;
      });
      return;
    }

    var ranked = orderTools(answers);
    renderCards(ranked, answers);
    renderFaqLinks(answers);

    var note = mismatchCopy(answers.need, answers.budget);
    if (note) {
      mismatchEl.hidden = false;
      mismatchEl.innerHTML = "<strong>Heads-up.</strong> " + note;
    } else {
      mismatchEl.hidden = true;
      mismatchEl.textContent = "";
    }

    results.hidden = false;
    logEvent("recommend", {
      answers: answers,
      tools: ranked.map(function (r) {
        return { slug: r.tool.slug, score: r.score.total };
      }),
    });
    results.scrollIntoView({ behavior: "smooth", block: "start" });
    var heading = document.getElementById("results-heading");
    if (heading) heading.focus({ preventScroll: true });
  });

  resetBtn.addEventListener("click", function () {
    form.reset();
    results.hidden = true;
    mismatchEl.hidden = true;
    mismatchEl.textContent = "";
    document.getElementById("cards").innerHTML = "";
    var faqLinks = document.getElementById("faq-links");
    if (faqLinks) {
      faqLinks.hidden = true;
      faqLinks.innerHTML = "";
    }
    updateProgress();
    logEvent("reset", {});
    var firstRadio = form.querySelector('input[type="radio"]');
    if (firstRadio) firstRadio.focus();
  });

  // Make results heading focusable for a11y after submit
  var resultsHeading = document.getElementById("results-heading");
  if (resultsHeading && !resultsHeading.hasAttribute("tabindex")) {
    resultsHeading.setAttribute("tabindex", "-1");
  }

  updateProgress();
  logEvent("page_view", { path: location.pathname });
})();
