/* Renders the publication list from window.PUBLICATIONS (data/publications.js).

   The visual language deliberately mirrors CV.tex: a shaped+coloured area
   marker per paper, student co-authors in orange, a star for corresponding
   author, and gold diamonds for awards. Anyone holding the CV should
   recognise the list immediately. */
(function () {
  "use strict";

  var DATA = window.PUBLICATIONS;
  var list = document.getElementById("pub-list");
  var countEl = document.getElementById("pub-count");
  if (!DATA || !list) return;

  var AREA_LABEL = {
    methodology: "Methodology & Theory",
    "human-ai": "Human-AI Interaction & Health",
    manufacturing: "Manufacturing & Materials"
  };

  // Three blocks, not one heading per year: the year-by-year split chopped the
  // list into fragments. The UW Madison block stays because it marks a real
  // break — work from before Michigan — rather than an arbitrary year boundary.
  var UW_CUTOFF = 2019;

  var HEADING = {
    review: "Under review &amp; preprints",
    published: "Published",
    uw: "2019 and Earlier (at UW Madison)"
  };

  var ORDER = { review: 0, published: 1, uw: 2 };

  var state = { area: "all" };

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function authorHTML(a) {
    var cls = [];
    if (a.is_student) cls.push("au-student");
    if (a.is_corresponding) cls.push("au-corr");
    var name = esc(a.name);
    // The star and the orange are both CSS-only, so on their own they say
    // nothing to a screen reader. Spell them out in text only it can reach.
    if (a.is_student) name += '<span class="visually-hidden"> (student I advised)</span>';
    if (a.is_corresponding) name += '<span class="visually-hidden"> (corresponding author)</span>';
    return cls.length
      ? '<span class="' + cls.join(" ") + '">' + name + "</span>"
      : name;
  }

  function pubHTML(p) {
    var marker = p.area && AREA_LABEL[p.area]
      ? '<span class="area area--' + (p.area === "human-ai" ? "hai" : p.area === "manufacturing" ? "mfg" : "meth") +
        '" role="img" aria-label="' + esc(AREA_LABEL[p.area]) + '"></span>'
      : "";

    var title = p.link
      ? '<a href="' + esc(p.link) + '">' + esc(p.title) + "</a>"
      : esc(p.title);

    var conf = p.type === "conference" ? '<span class="tag-conf">Conference</span>' : "";

    var authors = p.authors.map(authorHTML).join(", ");

    var venue = '<em>' + esc(p.venue) + "</em>" + (p.year ? " &middot; " + p.year : "");

    var awards = p.awards && p.awards.length
      ? '<ul class="pub__awards">' +
        p.awards.map(function (a) { return "<li>" + esc(a) + "</li>"; }).join("") +
        "</ul>"
      : "";

    // Every paper contributes a "Code" and a "Video" link, so a screen reader's
    // link list would otherwise be dozens of identically named entries. The
    // visible label stays short; the accessible name carries the paper.
    var links = [];
    function linkTo(href, label) {
      return '<a href="' + esc(href) + '" aria-label="' + label + " &ndash; " + esc(p.title) + '">' +
             label + "</a>";
    }
    if (p.link) links.push(linkTo(p.link, esc(p.link_label || "Link")));
    else if (p.link_pending) links.push('<span class="pub__pending">Link pending</span>');
    if (p.code) links.push(linkTo(p.code, "Code"));
    if (p.video) links.push(linkTo(p.video, "Video"));
    if (p.slides) links.push(linkTo(p.slides, "Slides"));
    var linkRow = links.length ? '<div class="pub__links">' + links.join("") + "</div>" : "";

    return (
      '<article class="pub">' +
      '<div class="pub__marker">' + marker + "</div>" +
      '<h3 class="pub__title">' + title + conf + "</h3>" +
      '<p class="pub__authors">' + authors + "</p>" +
      '<p class="pub__venue">' + venue + "</p>" +
      awards +
      linkRow +
      "</article>"
    );
  }

  function matches(p) {
    return state.area === "all" || p.area === state.area;
  }

  function render() {
    var shown = DATA.publications.filter(matches);

    var groups = [];
    var index = {};
    shown.forEach(function (p) {
      var key = p.status === "under_revision" ? "review"
              : p.year <= UW_CUTOFF ? "uw"
              : "published";
      if (!(key in index)) {
        index[key] = { key: key, items: [] };
        groups.push(index[key]);
      }
      index[key].items.push(p);
    });

    // Fixed block order, whatever order the data arrived in. Sort is stable, so
    // entries inside each block keep their position.
    groups.sort(function (a, b) { return ORDER[a.key] - ORDER[b.key]; });

    list.innerHTML = groups.map(function (g) {
      var heading = HEADING[g.key] || g.key;
      return (
        '<section class="pub-group">' +
        '<h2 class="pub-group__year">' + heading + "</h2>" +
        g.items.map(pubHTML).join("") +
        "</section>"
      );
    }).join("");

    if (countEl) {
      var total = DATA.publications.length;
      countEl.textContent = shown.length === total
        ? "Showing all " + total + " publications."
        : "Showing " + shown.length + " of " + total + " publications.";
    }
  }

  function wire(group, key) {
    var buttons = Array.prototype.slice.call(
      document.querySelectorAll('[data-filter-group="' + group + '"]')
    );
    buttons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        var val = btn.getAttribute("data-value");
        // Clicking the active chip clears it.
        state[key] = state[key] === val ? "all" : val;
        buttons.forEach(function (b) {
          b.setAttribute("aria-pressed", String(b.getAttribute("data-value") === state[key]));
        });
        render();
      });
    });
  }

  wire("area", "area");
  render();
})();
