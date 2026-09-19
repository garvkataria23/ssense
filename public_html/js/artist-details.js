/* ============================================================
   S.Sense Salon & Spa — Artist profile renderer
   ------------------------------------------------------------
   artist-details.html?artist=<slug> se profile load karta hai.
   Data: js/artists-data.js
   ============================================================ */

(function () {
  "use strict";

  var ARTISTS = window.SSENSE_ARTISTS || [];
  var params = new URLSearchParams(window.location.search);
  var slug = (params.get("artist") || "").trim().toLowerCase();

  function findArtist(value) {
    for (var i = 0; i < ARTISTS.length; i++) {
      if (ARTISTS[i].slug === value) return ARTISTS[i];
    }
    return null;
  }

  function el(id) {
    return document.getElementById(id);
  }

  function firstName(name) {
    return name.split(" ")[0];
  }

  var artist = findArtist(slug);

  /* ---- Profile not found => show empty state ---- */
  if (!artist) {
    var profile = el("artist-profile");
    var empty = el("artist-empty");
    if (profile) profile.style.display = "none";
    if (empty) empty.style.display = "block";
    return;
  }

  /* ---- Page title & meta ---- */
  var pageTitle = artist.name + " - " + artist.role + " | S.Sense Salon & Spa";
  document.title = pageTitle;

  var setMeta = function (selector, attr) {
    var node = document.querySelector(selector);
    if (node) node.setAttribute(attr, pageTitle);
  };
  setMeta('meta[property="og:title"]', "content");

  var ogDesc = document.querySelector('meta[property="og:description"]');
  if (ogDesc) {
    ogDesc.setAttribute(
      "content",
      "Meet " + artist.name + " - " + artist.role + " at S.Sense Salon & Spa, Thakur Village, Kandivali East, Mumbai."
    );
  }
  var ogImg = document.querySelector('meta[property="og:image"]');
  if (ogImg) ogImg.setAttribute("content", "https://ssensesalon.com/" + artist.photo);

  /* ---- Hero ---- */
  var heroTitle = el("artist-page-title");
  if (heroTitle) heroTitle.textContent = "Meet " + artist.name;
  var heroSub = el("artist-hero-sub");
  if (heroSub) heroSub.textContent = artist.role + " at S.Sense Salon & Spa - " + artist.category + ", Thakur Village, Kandivali East.";

  /* ---- Photo ---- */
  var photo = el("artist-photo");
  if (photo) {
    photo.src = artist.photo;
    photo.alt = artist.alt;
  }

  /* ---- Name & role ---- */
  var nameNode = el("artist-name");
  if (nameNode) nameNode.textContent = artist.name;
  var roleNode = el("artist-role");
  if (roleNode) roleNode.textContent = artist.role + "  \u2022  " + artist.category;

  /* ---- Meta chips: category + experience facts ---- */
  var metaBox = el("artist-meta");
  if (metaBox) {
    metaBox.innerHTML = "";
    var chips = [artist.category].concat(artist.experience || []);
    chips.forEach(function (text) {
      var chip = document.createElement("span");
      chip.className = "ssense-artist-chip";
      chip.textContent = text;
      metaBox.appendChild(chip);
    });
  }

  /* ---- About ---- */
  var aboutBox = el("artist-about");
  if (aboutBox) {
    aboutBox.innerHTML = "";
    (artist.about || []).forEach(function (paragraph) {
      var p = document.createElement("p");
      p.textContent = paragraph;
      aboutBox.appendChild(p);
    });
  }

  /* ---- Services list ---- */
  var servicesBox = el("artist-services");
  var servicesWrap = el("artist-services-wrap");
  if (servicesWrap && Array.isArray(artist.services)) {
    servicesBox.innerHTML = "";
    artist.services.forEach(function (service) {
      var li = document.createElement("li");
      li.textContent = service;
      servicesBox.appendChild(li);
    });
  } else if (servicesWrap) {
    servicesWrap.style.display = "none";
  }

  /* ---- Prices (only if provided) ---- */
  var pricesWrap = el("artist-prices-wrap");
  if (pricesWrap) {
    var pricesList = el("artist-prices");
    if (pricesList && Array.isArray(artist.prices) && artist.prices.length) {
      pricesList.innerHTML = "";
      artist.prices.forEach(function (row) {
        var li = document.createElement("li");
        var left = document.createElement("span");
        var right = document.createElement("span");
        left.textContent = row[0];
        right.textContent = row[1];
        li.appendChild(left);
        li.appendChild(right);
        pricesList.appendChild(li);
      });
    } else {
      pricesWrap.style.display = "none";
    }
  }

  /* ---- Gallery title ---- */
  var galleryTitle = el("artist-gallery-title");
  if (galleryTitle) galleryTitle.textContent = "View " + firstName(artist.name) + "'s Work";
})();