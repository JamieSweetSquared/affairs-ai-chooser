(function () {
  "use strict";

  var STORAGE_KEY = "affairs_chooser_events";

  /** Stub ready for a later analytics beacon (e.g. POST to /collect). */
  function sendAnalyticsBeacon(payload) {
    // Placeholder: replace with navigator.sendBeacon or fetch when endpoint exists.
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

  var CATALOG = {
    writing: [
      {
        slug: "writing-assistant-a",
        name: "Tool A — Writing Assistant",
        category: "Writing / content",
        pros: ["Draft generation", "Tone presets", "Export options"],
        cons: ["Generic output without editing", "Seat pricing unclear"],
      },
      {
        slug: "writing-assistant-b",
        name: "Tool B — Long-form Editor",
        category: "Writing / content",
        pros: ["Outline → draft flow", "Collaboration comments"],
        cons: ["Steeper learning curve", "Limited free tier"],
      },
      {
        slug: "writing-assistant-c",
        name: "Tool C — Brief & Blog Kit",
        category: "Writing / content",
        pros: ["Brief templates", "SEO title ideas"],
        cons: ["Thin fact-checking", "English-first"],
      },
    ],
    seo: [
      {
        slug: "seo-research-a",
        name: "Tool A — Keyword Explorer",
        category: "SEO / research",
        pros: ["Keyword clusters", "SERP snapshots"],
        cons: ["Data freshness varies", "Export limits"],
      },
      {
        slug: "seo-research-b",
        name: "Tool B — Content Gap Finder",
        category: "SEO / research",
        pros: ["Competitor gap lists", "Topic maps"],
        cons: ["Noisy suggestions", "Requires training data"],
      },
      {
        slug: "seo-research-c",
        name: "Tool C — On-page Checker",
        category: "SEO / research",
        pros: ["Page audits", "Internal link hints"],
        cons: ["Not a ranking guarantee", "UI busy on mobile"],
      },
    ],
    support: [
      {
        slug: "support-chat-a",
        name: "Tool A — Helpdesk Bot",
        category: "Support / chat",
        pros: ["Ticket deflection", "Knowledge sync"],
        cons: ["Needs good docs first", "Escalation tuning"],
      },
      {
        slug: "support-chat-b",
        name: "Tool B — Inbox Copilot",
        category: "Support / chat",
        pros: ["Reply drafts", "Tone match"],
        cons: ["Human review still required", "PII caution"],
      },
      {
        slug: "support-chat-c",
        name: "Tool C — FAQ Builder",
        category: "Support / chat",
        pros: ["Auto FAQ from tickets", "Multichannel stub"],
        cons: ["Shallow answers if corpus thin", "Setup time"],
      },
    ],
    scheduling: [
      {
        slug: "scheduling-ops-a",
        name: "Tool A — Calendar Agent",
        category: "Scheduling / ops",
        pros: ["Meeting links", "Timezone helpers"],
        cons: ["Calendar permission scope", "Limited CRM sync"],
      },
      {
        slug: "scheduling-ops-b",
        name: "Tool B — Ops Checklist AI",
        category: "Scheduling / ops",
        pros: ["Recurring runbooks", "Reminder nudges"],
        cons: ["Not a full PM suite", "Mobile UX basic"],
      },
      {
        slug: "scheduling-ops-c",
        name: "Tool C — Capacity Planner",
        category: "Scheduling / ops",
        pros: ["Load estimates", "What-if scenarios"],
        cons: ["Assumes clean inputs", "Export-only reports"],
      },
    ],
  };

  function pickTools(need) {
    return CATALOG[need] || CATALOG.writing;
  }

  function ctaHref(slug) {
    return (
      "/go/placeholder?utm_source=affairs&utm_medium=chooser&utm_campaign=" +
      encodeURIComponent(slug)
    );
  }

  function renderCards(tools, answers) {
    var container = document.getElementById("cards");
    container.innerHTML = "";
    tools.forEach(function (tool, i) {
      var card = document.createElement("article");
      card.className = "card";
      card.setAttribute("data-tool-slug", tool.slug);

      var badge = document.createElement("span");
      badge.className = "placeholder-badge";
      badge.textContent = "Placeholder";

      var h3 = document.createElement("h3");
      h3.textContent = tool.name;

      var match = document.createElement("p");
      match.className = "match";
      match.textContent =
        "Matched for " +
        answers.need +
        " · " +
        answers.budget +
        " · " +
        answers.team;

      var prosLabel = document.createElement("p");
      prosLabel.className = "label";
      prosLabel.textContent = "Pros — Research placeholder — not a hands-on review";

      var pros = document.createElement("ul");
      tool.pros.forEach(function (p) {
        var li = document.createElement("li");
        li.textContent = p;
        pros.appendChild(li);
      });

      var consLabel = document.createElement("p");
      consLabel.className = "label";
      consLabel.textContent = "Cons — Research placeholder — not a hands-on review";

      var cons = document.createElement("ul");
      tool.cons.forEach(function (c) {
        var li = document.createElement("li");
        li.textContent = c;
        cons.appendChild(li);
      });

      var cta = document.createElement("a");
      cta.className = "cta";
      cta.href = ctaHref(tool.slug);
      cta.textContent = "View tool (placeholder)";
      cta.setAttribute("data-affiliate", tool.slug);
      cta.setAttribute("data-rank", String(i + 1));
      cta.addEventListener("click", function (ev) {
        // Keep # fallback soft-nav if path 404s on Pages; still log.
        logEvent("affiliate_click", {
          slug: tool.slug,
          rank: i + 1,
          href: cta.href,
          answers: answers,
        });
        // For MVP on GitHub Pages, /go/* does not exist — use # after log if desired.
        // Prefer showing campaign URL in href for inspection; prevent broken nav.
        if (!ev.metaKey && !ev.ctrlKey) {
          ev.preventDefault();
        }
      });

      card.appendChild(badge);
      card.appendChild(h3);
      card.appendChild(match);
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

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var fd = new FormData(form);
    var answers = {
      budget: fd.get("budget"),
      need: fd.get("need"),
      team: fd.get("team"),
    };
    if (!answers.budget || !answers.need || !answers.team) return;

    var tools = pickTools(answers.need);
    renderCards(tools, answers);
    results.hidden = false;
    logEvent("recommend", { answers: answers, tools: tools.map(function (t) { return t.slug; }) });
    results.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  resetBtn.addEventListener("click", function () {
    form.reset();
    results.hidden = true;
    document.getElementById("cards").innerHTML = "";
    logEvent("reset", {});
  });

  logEvent("page_view", { path: location.pathname });
})();
