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
  // Positioning paraphrased from vendor sites (kit.com, leadpages.com, surferseo.com), 2026-09-11.
  var TOOLS = [
    {
      slug: "kit",
      name: "Kit",
      category: "Email for creators",
      typicalBuyer: "Creators, newsletter writers, and solo businesses who want email as the hub.",
      source: "kit.com",
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
  ];

  // Documented on methodology.html. Need is the main weight; budget/team only where vendors publish a signal.
  var WEIGHTS = {
    need: {
      writing: { kit: 3, leadpages: 1, surfer: 3 },
      seo: { kit: 1, leadpages: 1, surfer: 4 },
      support: { kit: 1, leadpages: 1, surfer: 0 },
      scheduling: { kit: 1, leadpages: 1, surfer: 0 },
    },
    budget: {
      free: { kit: 2, leadpages: 0, surfer: 0 },
      starter: { kit: 2, leadpages: 0, surfer: 0 },
      team: { kit: 1, leadpages: 2, surfer: 1 },
      enterprise: { kit: 0, leadpages: 1, surfer: 2 },
    },
    team: {
      solo: { kit: 2, leadpages: 1, surfer: 1 },
      small: { kit: 2, leadpages: 2, surfer: 1 },
      mid: { kit: 1, leadpages: 2, surfer: 2 },
      large: { kit: 1, leadpages: 2, surfer: 2 },
    },
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

  function mismatchCopy(need) {
    if (need === "support") {
      return "None of Kit, Leadpages, or Surfer is a support-chat or helpdesk product. Showing the cycle-1 slots anyway, ordered by nearest published-fit.";
    }
    if (need === "scheduling") {
      return "None of Kit, Leadpages, or Surfer is a scheduling / ops product. Showing the cycle-1 slots anyway, ordered by nearest published-fit.";
    }
    return "";
  }

  function ctaHref(slug) {
    return (
      "/go/placeholder?utm_source=affairs&utm_medium=chooser&utm_campaign=" +
      encodeURIComponent(slug)
    );
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

      var cta = document.createElement("a");
      cta.className = "cta";
      cta.href = ctaHref(tool.slug);
      cta.textContent = "View " + tool.name + " (placeholder CTA)";
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
        if (!ev.metaKey && !ev.ctrlKey) {
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
      card.appendChild(cta);
      container.appendChild(card);
    });
  }

  var form = document.getElementById("chooser-form");
  var results = document.getElementById("results");
  var resetBtn = document.getElementById("reset-btn");
  var mismatchEl = document.getElementById("mismatch-note");

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var fd = new FormData(form);
    var answers = {
      budget: fd.get("budget"),
      need: fd.get("need"),
      team: fd.get("team"),
    };
    if (!answers.budget || !answers.need || !answers.team) return;

    var ranked = orderTools(answers);
    renderCards(ranked, answers);

    var note = mismatchCopy(answers.need);
    if (note) {
      mismatchEl.hidden = false;
      mismatchEl.textContent = note;
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
  });

  resetBtn.addEventListener("click", function () {
    form.reset();
    results.hidden = true;
    mismatchEl.hidden = true;
    mismatchEl.textContent = "";
    document.getElementById("cards").innerHTML = "";
    logEvent("reset", {});
  });

  logEvent("page_view", { path: location.pathname });
})();
