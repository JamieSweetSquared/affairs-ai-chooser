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
  var TOOLS = [
    {
      slug: "kit",
      name: "Kit",
      category: "Email for creators",
      fit: "Often a fit when you need creator-focused email + landing basics.",
      pros: [
        "Creator-oriented email list tools",
        "Forms and simple landing pages in one stack",
        "Common pick for newsletter + digital product flows",
      ],
      cons: [
        "May be more than you need for pure transactional mail",
        "Pricing scales with subscriber count (check current plans)",
        "Not a full marketing suite replacement",
      ],
    },
    {
      slug: "leadpages",
      name: "Leadpages",
      category: "Landing pages",
      fit: "Often a fit when the primary need is fast landing pages and lead capture.",
      pros: [
        "Templates aimed at conversion pages",
        "Form / lead capture workflows",
        "Useful when you want pages without a full site rebuild",
      ],
      cons: [
        "Overlaps with page builders you may already pay for",
        "Ongoing subscription vs one-off page needs",
        "Confirm current integrations before committing",
      ],
    },
    {
      slug: "surfer",
      name: "Surfer",
      category: "SEO / AI writing visibility",
      fit: "Often a fit when SEO content scoring and on-page guidance matter.",
      pros: [
        "On-page SEO content editor / scoring style workflows",
        "Keyword and SERP-oriented writing guidance",
        "Common in content teams optimizing published posts",
      ],
      cons: [
        "Scores are guidance, not ranking guarantees",
        "Best value if you publish content regularly",
        "May duplicate features in other SEO suites",
      ],
    },
  ];

  function orderForNeed(need) {
    // Re-rank the same three named slots by primary need (still placeholders).
    if (need === "seo" || need === "writing") {
      return [TOOLS[2], TOOLS[0], TOOLS[1]]; // Surfer, Kit, Leadpages
    }
    if (need === "support") {
      return [TOOLS[0], TOOLS[1], TOOLS[2]]; // Kit, Leadpages, Surfer
    }
    if (need === "scheduling") {
      return [TOOLS[1], TOOLS[0], TOOLS[2]]; // Leadpages, Kit, Surfer
    }
    return TOOLS.slice();
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
      badge.textContent = "Research placeholder";

      var h3 = document.createElement("h3");
      h3.textContent = tool.name;

      var cat = document.createElement("p");
      cat.className = "match";
      cat.textContent =
        tool.category +
        " · ranked for " +
        answers.need +
        " · " +
        answers.budget +
        " · " +
        answers.team;

      var fit = document.createElement("p");
      fit.textContent = tool.fit;

      var prosLabel = document.createElement("p");
      prosLabel.className = "label";
      prosLabel.textContent =
        "Pros — Research placeholder — not a hands-on review";

      var pros = document.createElement("ul");
      tool.pros.forEach(function (p) {
        var li = document.createElement("li");
        li.textContent = p;
        pros.appendChild(li);
      });

      var consLabel = document.createElement("p");
      consLabel.className = "label";
      consLabel.textContent =
        "Cons — Research placeholder — not a hands-on review";

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

    var tools = orderForNeed(answers.need);
    renderCards(tools, answers);
    results.hidden = false;
    logEvent("recommend", {
      answers: answers,
      tools: tools.map(function (t) {
        return t.slug;
      }),
    });
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
