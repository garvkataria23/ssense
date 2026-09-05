/* =============================================================================
   S.Sense Salon & Spa - "Related Articles" renderer for blog detail pages.

   Pulls the real articles from window.SSENSE_BLOG (see blog-data.js), excludes
   the current article, prefers ones from the same / closely related category,
   and renders up to 3 cards. Each article is excluded once; no fake posts,
   dates or categories are ever injected.

   The markup uses the site's established card structure (blog-post +
   stretched-link) so the whole card is clickable and styled consistently.
   ============================================================================= */
(function () {
  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  if (!window.SSENSE_BLOG || !Array.isArray(window.SSENSE_BLOG) || window.SSENSE_BLOG.length === 0) {
    return;
  }

  var section = document.getElementById("related-posts");
  if (!section) {
    return;
  }

  var grid = section.querySelector(".ssense-related-grid");
  if (!grid) {
    return;
  }

  var currentSlug = section.getAttribute("data-current-slug") || "";
  var currentCategory = section.getAttribute("data-current-category") || "";

  var related = window.SSENSE_BLOG
    .filter(function (p) {
      return p.slug !== currentSlug;
    })
    .map(function (p) {
      var score = p.category === currentCategory ? 2 : 0;
      return { post: p, score: score };
    })
    .sort(function (a, b) {
      return b.score - a.score;
    })
    .slice(0, 3)
    .map(function (r) {
      return r.post;
    });

  if (related.length === 0) {
    section.style.display = "none";
    return;
  }

  var frag = document.createDocumentFragment();
  related.forEach(function (p) {
    var card = document.createElement("article");
    card.className = "blog-post ssense-blog-card ssense-related-card";

    var img =
      '<div class="blog-post-img"><div class="hover-overlay">' +
      '<img class="img-fluid" src="../' + escapeHtml(p.image) + '" width="800" height="800" alt="' + escapeHtml(p.alt) + '" loading="lazy">' +
      "</div></div>" +
      '<div class="blog-post-txt">' +
      '<p class="post-tag">' + escapeHtml(p.category) + " | " + escapeHtml(p.date) + "</p>" +
      '<h3 class="h5-md post-link"><a class="stretched-link" href="' + escapeHtml(p.slug) + '">' + escapeHtml(p.title) + "</a></h3>" +
      "</div>";

    card.innerHTML = img;
    frag.appendChild(card);
  });

  grid.appendChild(frag);
})();
