/* =====================================================================
   Annual Giving — shared header behaviour (used by every page)
   - "scrolled" class on <body> for the fixed header shadow
   - mobile navigation toggle
   - smooth scroll to a #hash on page load (respects scroll-margin-top)
   - nav link highlighting (scrollspy)
   ===================================================================== */
(function () {
  "use strict";

  var body = document.body;
  var header = document.querySelector("#header");

  /* Header shadow once the page is scrolled */
  function toggleScrolled() {
    if (!header || !header.classList.contains("fixed-top")) return;
    body.classList.toggle("scrolled", window.scrollY > 100);
  }
  document.addEventListener("scroll", toggleScrolled);
  window.addEventListener("load", toggleScrolled);

  /* Mobile nav */
  var navToggle = document.querySelector(".mobile-nav-toggle");
  function toggleMobileNav() {
    body.classList.toggle("mobile-nav-active");
  }
  if (navToggle) navToggle.addEventListener("click", toggleMobileNav);

  document.querySelectorAll("#navmenu a").forEach(function (link) {
    link.addEventListener("click", function () {
      if (body.classList.contains("mobile-nav-active")) toggleMobileNav();
    });
  });

  /* Land on the right section when the URL contains a hash */
  window.addEventListener("load", function () {
    if (!window.location.hash) return;
    var section = document.querySelector(window.location.hash);
    if (!section) return;
    setTimeout(function () {
      var offset = parseInt(getComputedStyle(section).scrollMarginTop, 10) || 0;
      window.scrollTo({ top: section.offsetTop - offset, behavior: "smooth" });
    }, 100);
  });

  /* Scrollspy */
  var navLinks = document.querySelectorAll(".navmenu a");
  function scrollspy() {
    navLinks.forEach(function (link) {
      if (!link.hash) return;
      var section = document.querySelector(link.hash);
      if (!section) return;
      var position = window.scrollY + 200;
      var inside = position >= section.offsetTop && position <= section.offsetTop + section.offsetHeight;
      if (inside) {
        document.querySelectorAll(".navmenu a.active").forEach(function (l) { l.classList.remove("active"); });
        link.classList.add("active");
      } else {
        link.classList.remove("active");
      }
    });
  }
  window.addEventListener("load", scrollspy);
  document.addEventListener("scroll", scrollspy);
})();
