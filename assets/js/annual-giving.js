/* =====================================================================
   Annual Giving — page scripts (index.html)
   Requires: bootstrap.bundle, aos, gsap + ScrollTrigger, swiper, purecounter
   Sections
     1. Animations (AOS, hero parallax, hero text intro)
     2. Impact pillars (flip cards)
     3. Progress meter (count-up, INR + USD)
     4. Campaign film (plays inside the poster box)
     5. Ways to Contribute accordion
     6. Alumni voices carousel autoplay
     7. Stories slider (Swiper)
     8. Donation form (country, gift type, amounts, step 2, validation)
     9. Payment-instructions modal (donors outside India)
   ===================================================================== */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var hasGsap = !!(window.gsap && window.ScrollTrigger);
  if (hasGsap) gsap.registerPlugin(ScrollTrigger);

  /* Helpers */
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function onReady(fn) { if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", fn); else fn(); }

  /* ------------------------------------------------------------------ */
  /* 1. Animations                                                       */
  /* ------------------------------------------------------------------ */
  onReady(function () {
    if (window.AOS) AOS.init({ duration: 600, easing: "ease-out-cubic", offset: 40, once: true, mirror: false });
    if (window.PureCounter) new PureCounter();
  });

  /* Hero + impact-band parallax (desktop only) */
  if (hasGsap && !reduceMotion && window.matchMedia("(min-width: 992px)").matches) {
    var heroMedia = $(".ag-hero__media");
    if (heroMedia) {
      gsap.to(heroMedia, { yPercent: 18, ease: "none", scrollTrigger: { trigger: "#donation-form", start: "top top", end: "bottom top", scrub: true } });
    }
    var support = $(".ag-support");
    if (support) {
      gsap.fromTo(support, { "--agpy": "-60px" }, { "--agpy": "60px", ease: "none", scrollTrigger: { trigger: support, start: "top bottom", end: "bottom top", scrub: true } });
    }
  }

  /* Hero text: letter-by-letter reveal + tagline highlight */
  (function heroIntro() {
    var annual = $(".ag-hero__annual");
    var giving = $(".ag-hero__impact");
    var tag = $(".ag-hero__tagtext");
    if (!annual || !giving || !tag || !hasGsap || reduceMotion) return; /* static text stays as-is */

    function splitLetters(el) {
      var txt = el.textContent;
      el.textContent = "";
      el.setAttribute("aria-label", txt);
      var frag = document.createDocumentFragment();
      txt.split("").forEach(function (ch) {
        var w = document.createElement("span"); w.className = "ag-ch";
        var i = document.createElement("span"); i.className = "ag-ch__i"; i.textContent = ch === " " ? " " : ch;
        w.appendChild(i); frag.appendChild(w);
      });
      el.appendChild(frag);
      return el.querySelectorAll(".ag-ch__i");
    }
    function splitWords(el) {
      var out = [];
      Array.prototype.slice.call(el.childNodes).forEach(function (node) {
        if (node.nodeType === 3) {
          var frag = document.createDocumentFragment();
          node.textContent.split(/(\s+)/).forEach(function (part) {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(" ")); return; }
            var w = document.createElement("span"); w.className = "ag-w"; w.textContent = part;
            frag.appendChild(w); out.push(w);
          });
          el.replaceChild(frag, node);
        } else if (node.nodeType === 1) {
          out.push(node);
        }
      });
      return out;
    }

    document.documentElement.classList.add("ag-hero-anim");
    var aL = splitLetters(annual);
    var gL = splitLetters(giving);
    var words = splitWords(tag).concat(splitWords($(".ag-hero__tag2")));
    var hl = $(".ag-hero__hl");
    var rule = $(".ag-hero__rule");

    var tl = gsap.timeline({ defaults: { ease: "power4.out" }, delay: 0.15 });
    tl.fromTo(aL, { yPercent: 110, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.7, stagger: 0.045 })
      .fromTo(gL, { yPercent: 115, rotateX: -40, opacity: 0 }, { yPercent: 0, rotateX: 0, opacity: 1, duration: 1, stagger: 0.06, ease: "expo.out" }, "-=.35")
      .fromTo(rule, { scaleX: 0 }, { scaleX: 1, duration: 0.6, ease: "power2.inOut" }, "-=.5")
      .fromTo(words, { y: 18, opacity: 0, filter: "blur(6px)" }, { y: 0, opacity: 1, filter: "blur(0px)", duration: 0.6, stagger: 0.09, ease: "power3.out" }, "-=.3")
      .fromTo(hl, { "--hlw": "0%" }, { "--hlw": "100%", duration: 0.7, ease: "power2.inOut" }, "-=.15")
      .fromTo(".ag-hero__form", { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9, ease: "power3.out" }, "-=1.4");

    /* gentle idle shimmer across GIVING every few seconds */
    gsap.to(gL, { color: "rgba(252,226,197,1)", duration: 0.35, stagger: { each: 0.05, repeat: 1, yoyo: true, repeatDelay: 4 }, repeat: -1, repeatDelay: 4, delay: 3, ease: "sine.inOut" });
  })();

  /* ------------------------------------------------------------------ */
  /* 2. Impact pillars: flip on hover (desktop) / tap (touch) + keyboard */
  /* ------------------------------------------------------------------ */
  (function pillars() {
    var canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    $$(".ag-pillar").forEach(function (card) {
      function setFlip(on) {
        card.classList.toggle("is-flipped", on);
        card.setAttribute("aria-pressed", on ? "true" : "false");
      }
      if (!canHover) card.addEventListener("click", function () { setFlip(!card.classList.contains("is-flipped")); });
      card.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setFlip(!card.classList.contains("is-flipped")); }
        if (e.key === "Escape") setFlip(false);
      });
    });
  })();

  /* ------------------------------------------------------------------ */
  /* 3. Progress meter                                                   */
  /*    Edit the numbers in the HTML:                                    */
  /*      #uniquegoal-raised  data-raised="<amount in ₹>"                */
  /*      #ag-contrib-number  data-count="<number of contributors>"      */
  /*      #uniquegoal-goal    data-goal="<goal in ₹>"                    */
  /* ------------------------------------------------------------------ */
  onReady(function progressMeter() {
    var USD_RATE = 95; /* 1 USD = ₹95 */
    var raisedEl = $("#uniquegoal-raised");
    var goalEl = $("#uniquegoal-goal");
    var contribEl = $("#ag-contrib-number");
    if (!raisedEl || !goalEl) return;

    function num(v) { return Number(String(v || "0").replace(/[^0-9.]/g, "")) || 0; }
    var raised = num(raisedEl.dataset.raised);
    var goal = num(goalEl.dataset.goal) || 1;
    var contrib = num(contribEl && contribEl.dataset.count);

    function inrShort(n) {
      if (n >= 1e7) return (n / 1e7).toFixed(2) + " Cr";
      if (n >= 1e5) return (n / 1e5).toFixed(2) + " L";
      return Math.round(n).toLocaleString("en-IN");
    }
    function usdShort(n) {
      if (n >= 1e6) return "$" + (n / 1e6).toFixed(2) + "M";
      if (n >= 1e3) return "$" + Math.round(n / 1e3).toLocaleString("en-US") + "K";
      return "$" + Math.round(n);
    }
    function toUsd(v) { return v / USD_RATE; }

    goalEl.textContent = inrShort(goal);
    $("#ag-goal-usd").textContent = usdShort(toUsd(goal));

    var pct = Math.min(raised / goal * 100, 100);
    var bar = $("#uniquegoal-bar");
    var fill = $("#uniquegoal-fill");
    var marker = $("#uniquegoal-marker");
    var pctEl = $("#uniquegoal-percent");
    var usdEl = $("#ag-raised-usd");
    var minVisible = 3; /* keep a sliver visible at 0% */

    function paint(k) { /* k = 0..1 progress of the animation */
      var p = pct * k;
      raisedEl.textContent = inrShort(raised * k);
      usdEl.textContent = usdShort(toUsd(raised * k));
      pctEl.textContent = Math.round(p);
      if (contribEl) contribEl.textContent = Math.round(contrib * k).toLocaleString("en-IN");
      var w = Math.max(p, minVisible);
      fill.style.width = w + "%";
      marker.style.left = w + "%";
    }
    paint(0);
    bar.setAttribute("aria-valuenow", Math.round(pct));

    function run() {
      if (window.gsap && !reduceMotion) {
        var o = { k: 0 };
        gsap.to(o, { k: 1, duration: 2.2, ease: "power3.out", onUpdate: function () { paint(o.k); } });
        gsap.fromTo(".ag-bar__shine", { xPercent: -120 }, { xPercent: 220, duration: 1.6, ease: "power2.inOut", delay: 1.2, repeat: 1, repeatDelay: 2 });
      } else {
        paint(1);
      }
    }
    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) { if (e.isIntersecting) { run(); io.disconnect(); } });
      }, { threshold: 0.35 });
      io.observe($("#ag-progress"));
    } else {
      run();
    }
  });

  /* ------------------------------------------------------------------ */
  /* 4. Campaign film — plays inside the poster box                      */
  /* ------------------------------------------------------------------ */
  (function film() {
    var openBtn = $("#agFilmOpen");
    if (!openBtn) return;
    var VIDEO_ID = "vtjF4dYxnJs";

    openBtn.addEventListener("click", function () {
      var box = openBtn.parentNode;
      var wrap = document.createElement("div");
      wrap.className = "ag-film__embed";
      var iframe = document.createElement("iframe");
      iframe.src = "https://www.youtube-nocookie.com/embed/" + VIDEO_ID + "?autoplay=1&rel=0&modestbranding=1&playsinline=1&start=8";
      iframe.title = "Greater Than Us – The IIT Kanpur Campaign Film";
      iframe.setAttribute("allow", "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen");
      iframe.setAttribute("allowfullscreen", "");
      iframe.setAttribute("referrerpolicy", "strict-origin-when-cross-origin");
      iframe.setAttribute("frameborder", "0");
      wrap.appendChild(iframe);

      var fallback = document.createElement("p");
      fallback.className = "ag-film__fallback";
      fallback.innerHTML = 'Video not playing? <a href="https://www.youtube.com/watch?v=' + VIDEO_ID + '" target="_blank" rel="noopener">Watch it on YouTube</a>';

      box.replaceChild(wrap, openBtn);
      box.appendChild(fallback);
    });
  })();

  /* ------------------------------------------------------------------ */
  /* 5. Ways to Contribute accordion                                     */
  /* ------------------------------------------------------------------ */
  (function accordion() {
    $$(".ag-way__toggle").forEach(function (btn) {
      var body = document.getElementById(btn.getAttribute("aria-controls"));
      var way = btn.closest(".ag-way");
      if (!body) return;
      /* whole row is clickable; the button is the accessible control */
      way.querySelector(".ag-way__head").addEventListener("click", function (e) {
        if (!e.target.closest(".ag-way__toggle")) btn.click();
      });
      btn.addEventListener("click", function () {
        var open = btn.getAttribute("aria-expanded") === "true";
        btn.setAttribute("aria-expanded", open ? "false" : "true");
        way.classList.toggle("is-open", !open);
        if (open) {
          body.style.height = body.scrollHeight + "px";
          requestAnimationFrame(function () { body.style.height = "0px"; });
          body.addEventListener("transitionend", function h() { body.hidden = true; body.style.height = ""; body.removeEventListener("transitionend", h); });
        } else {
          body.hidden = false;
          body.style.height = "0px";
          requestAnimationFrame(function () { body.style.height = body.scrollHeight + "px"; });
          body.addEventListener("transitionend", function h() { body.style.height = "auto"; body.removeEventListener("transitionend", h); });
        }
      });
    });
    /* open the first item when the nav link is used */
    function openFromHash() {
      if (location.hash !== "#ways-to-give") return;
      var first = $(".ag-way__toggle");
      if (first && first.getAttribute("aria-expanded") !== "true") first.click();
    }
    window.addEventListener("hashchange", openFromHash);
    window.addEventListener("load", openFromHash);
  })();

  /* ------------------------------------------------------------------ */
  /* 6. Alumni voices: autoplay (5s, loops, pauses on hover)             */
  /* ------------------------------------------------------------------ */
  (function voices() {
    var el = $("#testimonialCarousel");
    if (!el || !window.bootstrap) return;
    var carousel = bootstrap.Carousel.getOrCreateInstance(el, { interval: 5000, ride: "carousel", pause: "hover", wrap: true, touch: true });
    carousel.cycle();
    el.addEventListener("slid.bs.carousel", function () { carousel.cycle(); }); /* keep cycling after manual clicks */
  })();

  /* ------------------------------------------------------------------ */
  /* 7. Stories slider                                                   */
  /* ------------------------------------------------------------------ */
  (function stories() {
    var el = $(".ag-stories__swiper");
    if (!el || !window.Swiper) return;
    /* loop mode needs more slides than are visible: duplicate the set once */
    var wrap = el.querySelector(".swiper-wrapper");
    var N = wrap.children.length; /* real number of stories (for the dots) */
    Array.prototype.slice.call(wrap.children).forEach(function (slide) {
      var clone = slide.cloneNode(true);
      clone.setAttribute("aria-hidden", "true");
      wrap.appendChild(clone);
    });
    function syncDots(sw) {
      var bullets = $$(".ag-stories__pagination .swiper-pagination-bullet");
      var cur = sw.realIndex % N;
      bullets.forEach(function (b, i) { b.classList.toggle("swiper-pagination-bullet-active", i === cur); });
    }
    new Swiper(el, {
      slidesPerView: 1.08,
      spaceBetween: 16,
      loop: true,
      loopAdditionalSlides: 2,
      grabCursor: true,
      speed: 700,
      watchOverflow: false,
      autoplay: { delay: 4500, disableOnInteraction: false, pauseOnMouseEnter: true },
      keyboard: { enabled: true },
      pagination: {
        el: ".ag-stories__pagination", clickable: true,
        renderBullet: function (i, cls) { return i < N ? '<span class="' + cls + '"></span>' : ""; }
      },
      navigation: { nextEl: ".ag-stories__btn--next", prevEl: ".ag-stories__btn--prev" },
      on: { init: syncDots, slideChange: syncDots, slideChangeTransitionEnd: syncDots, paginationUpdate: syncDots },
      breakpoints: {
        640: { slidesPerView: 1.5, spaceBetween: 20 },
        992: { slidesPerView: 2, spaceBetween: 24 },
        1200: { slidesPerView: 3, spaceBetween: 28 }
      }
    });
  })();

  /* ------------------------------------------------------------------ */
  /* 8 + 9. Donation form & payment modal                                */
  /* ------------------------------------------------------------------ */
  onReady(function donationForm() {
    /* Payment partner links per country (monthly / one-time) */
    var paymentLinks = {
      usa:       { monthly: "https://iitkfoundation.org/faqs-ways-to-donate/#donate", "one-time": "https://iitkfoundation.org/faqs-ways-to-donate/#donate" },
      uk:        { monthly: "https://www.justgiving.com/charity/eff-iitkanpur", "one-time": "https://www.justgiving.com/charity/eff-iitkanpur" },
      australia: { monthly: "https://myriadau.fcsuite.com/erp/donate/create/fund?funit_id=1128", "one-time": "https://myriadau.fcsuite.com/erp/donate/create/fund?funit_id=1128" },
      belgium:   { monthly: "https://donate.kbs-frb.be/actions/EFF-IITKanpurUniversity", "one-time": "https://donate.kbs-frb.be/actions/EFF-IITKanpurUniversity" },
      canada:    { monthly: "https://www.canadahelps.org/en/charities/myriad-canada/campaign/h502-support-education-research-and-access-to-healthcare-with-the-iit-kanpur/#create-a-campaign", "one-time": "https://www.myriadcanada.org/en/project/support-education-research-healthcare-iit-kanpur/" },
      germany:   { monthly: "https://donate.transnationalgiving.eu/germany/IITKanpur", "one-time": "https://donate.transnationalgiving.eu/germany/IITKanpur" },
      other:     { monthly: "https://iitk.ac.in/dora/givingback/other-country/Annual-Gift-Programme", "one-time": "https://iitk.ac.in/dora/givingback/other-country/Annual-Gift-Programme" }
    };

    /* Step-by-step instructions shown in the modal (monthly gifts outside India) */
    function stepsFor(country, type) {
      var monthly = type === "monthly";
      function list(items) { return '<div class="payment-steps"><h4>Steps:</h4><ol><li>' + items.join("</li><li>") + "</li></ol></div>"; }
      switch (country) {
        case "usa":       return list(["Enter amount: $15 / $30 / $60 / $120.", monthly ? "Enter amount and complete payment" : "Enter your details and Complete Payment"]);
        case "uk":        return list([monthly ? 'Select "Monthly" Option' : "Select Donation Type", "Enter amount: £30 / £50 / £150 / £200.", "Enter your details and Complete Payment"]);
        case "australia": return list([monthly ? 'Select "Recurring Donation Amount"' : "Select Donation Type", "Enter amount" + (monthly ? " and End date" : "") + ".", "Enter your details and Complete Payment"]);
        case "canada":    return list([monthly ? 'Select "Donate Monthly"' : "Select Donation Type", "Enter amount", "Enter your details and Complete Payment"]);
        case "germany":   return list([monthly ? 'Select "Donate every month"' : "Select Donation Type", "Enter amount: €50 / €80 / €100 / €250.", "Enter your details and Complete Payment"]);
        case "belgium":   return list([monthly ? 'Select "Don Mensuel/ I Donate every month"' : "Select Donation Type", "Enter Amount", "Enter your details and Complete Payment"]);
        default:          return list(["Monthly giving is currently unavailable in other countries.", "At this time, we accept one-time donations only."]);
      }
    }

    /* --- elements --- */
    var countryDropdown = $(".country-dropdown");
    if (!countryDropdown) return;
    var countrySelected = countryDropdown.querySelector(".dropdown-selected");
    var indiaContent = $("#india-content");
    var otherCountryContent = $("#other-country-content");
    var globalNote = $("#global-note");
    var nextButton = $("#nextButton");
    var form = $("#donationForm");
    var modal = $("#paymentModal");

    var selected = { country: "india", name: "India", iconHtml: countrySelected.innerHTML.replace(/India\s*$/, "").trim() };

    /* --- payment modal --- */
    function openPaymentModal(country, countryName, iconHtml, donationType) {
      var link = (paymentLinks[country] || paymentLinks.other)[donationType] || paymentLinks.other[donationType];
      $("#modalCountryIcon").innerHTML = iconHtml;
      $("#modalCountryName").textContent = countryName;
      $("#modalContent").innerHTML = stepsFor(country, donationType);
      $("#proceedButton").href = link;
      modal.classList.add("is-open");
    }
    function closePaymentModal() { modal.classList.remove("is-open"); }
    $$("[data-close-payment-modal]").forEach(function (b) { b.addEventListener("click", closePaymentModal); });
    modal.addEventListener("click", function (e) { if (e.target === modal) closePaymentModal(); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") closePaymentModal(); });

    /* --- gift type & amount helpers (India) --- */
    function getSelectedType() {
      var scope = indiaContent.style.display !== "none" ? indiaContent : otherCountryContent;
      var active = scope.querySelector(".donation-type-option.active");
      return active ? active.getAttribute("data-type") : "one-time";
    }
    function getSelectedAmount() {
      var option = $(".amount-option.selected");
      if (option) return option.getAttribute("data-amount");
      var monthly = getSelectedType() === "monthly";
      var custom = $(monthly ? "#monthly-customAmountInput" : "#onetime-customAmountInput").value;
      var box = $(monthly ? "#monthly-other-option-box" : "#onetime-other-option-box");
      return (custom && box.classList.contains("selected")) ? custom : null;
    }
    function typeLabel() { return getSelectedType() === "monthly" ? "Monthly" : "One-time"; }
    function updateDonationDisplay() {
      var amount = getSelectedAmount();
      var display = $("#selectedDonationDisplay");
      if (amount) {
        $("#selectedAmountDisplay").textContent = "₹" + amount;
        $("#selectedTypeDisplay").textContent = typeLabel();
        display.classList.add("show");
      } else {
        display.classList.remove("show");
      }
    }
    function updateStep2DonationDisplay() {
      var amount = getSelectedAmount();
      if (!amount) return;
      $("#step2AmountDisplay").textContent = "₹" + amount;
      $("#step2TypeDisplay").textContent = typeLabel();
    }
    function switchTab(step) {
      $$(".form-step").forEach(function (s) { s.classList.remove("active"); });
      $("#step" + step).classList.add("active");
      if (step === 2) updateStep2DonationDisplay();
    }
    function switchAmountOptions(type) {
      $("#monthly-amounts").style.display = type === "monthly" ? "flex" : "none";
      $("#onetime-amounts").style.display = type === "monthly" ? "none" : "flex";
      $$(".amount-option").forEach(function (o) { o.classList.remove("selected"); });
      $$(".other-option-box").forEach(function (box) {
        box.classList.remove("selected");
        var input = box.querySelector("input");
        if (input) input.value = "";
      });
      updateDonationDisplay();
    }

    /* --- country dropdown --- */
    countrySelected.addEventListener("click", function () { countryDropdown.classList.toggle("active"); });
    $$(".option", countryDropdown).forEach(function (option) {
      option.addEventListener("click", function () {
        var value = option.getAttribute("data-value");
        var icon = option.querySelector(".flag-icon, .icon-globe");
        var iconHtml = icon ? icon.outerHTML : "";
        var name = option.textContent.trim();

        countrySelected.innerHTML = iconHtml + " " + name;
        countrySelected.setAttribute("data-value", value);
        countryDropdown.classList.remove("active");
        selected = { country: value, name: name, iconHtml: iconHtml };

        var india = value === "india";
        indiaContent.style.display = india ? "block" : "none";
        otherCountryContent.style.display = india ? "none" : "block";
        globalNote.style.display = india ? "block" : "none";
        nextButton.textContent = india ? "Next →" : "Proceed to Payment";
      });
    });

    /* --- gift type toggles --- */
    $$(".donation-type-option").forEach(function (option) {
      option.addEventListener("click", function () {
        var group = option.closest(".donation-type-toggle");
        $$(".donation-type-option", group).forEach(function (o) { o.classList.remove("active"); });
        option.classList.add("active");
        if (group.closest("#india-content")) switchAmountOptions(option.getAttribute("data-type"));
      });
    });

    /* --- preset / custom amounts --- */
    function initAmounts(containerId, otherBoxId, customInputId) {
      var container = document.getElementById(containerId);
      if (!container) return;
      var options = $$(".amount-option", container);
      var otherBox = document.getElementById(otherBoxId);
      var customInput = document.getElementById(customInputId);

      options.forEach(function (option) {
        option.addEventListener("click", function () {
          options.forEach(function (o) { o.classList.remove("selected"); });
          option.classList.add("selected");
          otherBox.classList.remove("selected");
          customInput.value = "";
          updateDonationDisplay();
        });
      });
      otherBox.addEventListener("click", function () {
        options.forEach(function (o) { o.classList.remove("selected"); });
        otherBox.classList.add("selected");
        customInput.focus();
        updateDonationDisplay();
      });
      customInput.addEventListener("input", function () {
        if (customInput.value) {
          options.forEach(function (o) { o.classList.remove("selected"); });
          otherBox.classList.add("selected");
          updateDonationDisplay();
        } else if (otherBox.classList.contains("selected")) {
          $("#selectedDonationDisplay").classList.remove("show");
        }
      });
    }
    initAmounts("monthly-amounts", "monthly-other-option-box", "monthly-customAmountInput");
    initAmounts("onetime-amounts", "onetime-other-option-box", "onetime-customAmountInput");

    /* --- Next / Proceed --- */
    nextButton.addEventListener("click", function (e) {
      e.preventDefault();
      if (selected.country === "india") {
        if (!getSelectedAmount()) { alert("Please select or enter a donation amount"); return; }
        switchTab(2);
        return;
      }
      if (getSelectedType() === "monthly") {
        openPaymentModal(selected.country, selected.name, selected.iconHtml, "monthly");
      } else {
        var link = (paymentLinks[selected.country] || paymentLinks.other)["one-time"];
        window.open(link, "_blank");
      }
    });
    $("#prevButton").addEventListener("click", function () { switchTab(1); });

    /* --- generic dropdowns (affiliation, program, year of graduation) --- */
    var yogOptions = $("#yog-options");
    if (yogOptions) {
      var currentYear = new Date().getFullYear();
      for (var year = currentYear; year >= 1965; year--) {
        var opt = document.createElement("div");
        opt.className = "option";
        opt.textContent = year;
        opt.setAttribute("data-value", year);
        yogOptions.appendChild(opt);
      }
    }
    var alumniFields = $("#alumniFields");
    $$(".dropdown:not(.country-dropdown)").forEach(function (dropdown) {
      var sel = dropdown.querySelector(".dropdown-selected");
      sel.addEventListener("click", function () { dropdown.classList.toggle("active"); });
      $$(".option", dropdown).forEach(function (option) {
        option.addEventListener("click", function () {
          sel.textContent = option.textContent;
          sel.setAttribute("data-value", option.getAttribute("data-value") || option.textContent);
          dropdown.classList.remove("active");
          if (dropdown.classList.contains("affiliation-dropdown")) {
            alumniFields.style.display = option.getAttribute("data-value") === "alumni" ? "block" : "none";
          }
        });
      });
    });
    document.addEventListener("click", function (e) {
      if (!e.target.closest(".dropdown")) $$(".dropdown").forEach(function (d) { d.classList.remove("active"); });
    });

    /* --- validation before submit (India) --- */
    function dropdownValue(selector) {
      var el = $(selector + " .dropdown-selected");
      return el.getAttribute("data-value") || el.textContent.trim();
    }
    function validateForm() {
      var affiliation = dropdownValue(".affiliation-dropdown");
      if (!affiliation || affiliation === "Affiliation *") { alert("Please select your affiliation (Alumni/Non-Alumni/Organization)"); return false; }

      var program = "", yog = "";
      if (affiliation === "alumni") {
        program = dropdownValue(".program-dropdown");
        yog = dropdownValue(".yog-dropdown");
        if (!program || program === "Select Program *") { alert("Please select your program"); return false; }
        if (!yog || yog === "Year of Graduation *") { alert("Please select your year of graduation"); return false; }
      }

      var name = $("#name").value.trim();
      var email = $("#email").value.trim();
      var phone = $("#phone").value.trim();
      if (!name) { alert("Please enter your full name"); return false; }
      if (!email) { alert("Please enter your email"); return false; }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { alert("Please enter a valid email address"); return false; }
      if (!phone) { alert("Please enter mobile number"); return false; }
      if (!/^\+?[0-9]{7,15}$/.test(phone)) { alert("Please enter valid mobile number (only numbers and optional + country code)"); return false; }

      var panInput = $("#panInput");
      var pan = panInput.value.trim().toUpperCase();
      if (pan !== "" && !/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(pan)) { alert("Invalid PAN number.\nFormat: ABCDE1234F"); panInput.focus(); return false; }

      var amount = getSelectedAmount();
      if (!amount || amount <= 0) { alert("Please select a valid donation amount"); return false; }
      if (parseInt(amount, 10) > 500000) { alert("Amount should not be greater than 5 Lakhs"); return false; }

      /* hidden fields posted with the form */
      $("#amount").value = amount;
      $("#donationtime").value = getSelectedType();
      $("#countryInput").value = "India";
      $("#currency").value = "inr";
      $("#select_category").value = affiliation;
      $("#program").value = affiliation === "alumni" ? program : "";
      $("#Year_of_Graduation").value = affiliation === "alumni" ? yog : "";
      return true;
    }
    /* run on the button click (before the browser's own "required" checks), as the original page did */
    $(".btn-submit", form).addEventListener("click", function (e) { if (!validateForm()) e.preventDefault(); });

    /* --- mobile "Make a Gift" bar --- */
    var mobileDonateBtn = $("#mobileDonateBtn");
    if (mobileDonateBtn) {
      mobileDonateBtn.addEventListener("click", function () {
        $("#donation-form").scrollIntoView({ behavior: "smooth" });
      });
    }
  });
})();
