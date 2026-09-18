/* PalmPages motion layer: scroll reveal, hero parallax, header state,
   current-section underline, language crossfade. Pairs with fx.css. */
(function () {
  var html = document.documentElement;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var hasIO = "IntersectionObserver" in window;

  /* ── sticky header shadow ── */
  var top = document.querySelector(".top");
  function headerState() {
    if (top) top.classList.toggle("is-scrolled", window.scrollY > 24);
  }
  window.addEventListener("scroll", headerState, { passive: true });
  headerState();

  /* ── current-section underline in the nav ── */
  var links = Array.prototype.slice.call(document.querySelectorAll('.top nav a[href^="#"]'));
  var sections = links
    .map(function (a) {
      return document.querySelector(a.getAttribute("href"));
    })
    .filter(Boolean);
  if (hasIO && sections.length) {
    var navIO = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (en) {
          if (!en.isIntersecting) return;
          var id = "#" + en.target.id;
          links.forEach(function (a) {
            a.classList.toggle("is-current", a.getAttribute("href") === id);
          });
        });
      },
      { rootMargin: "-40% 0px -55% 0px" }
    );
    sections.forEach(function (s) {
      navIO.observe(s);
    });
  }

  /* ── language switch crossfade (runs in capture phase, before lang.js) ── */
  document.addEventListener(
    "click",
    function (e) {
      var btn = e.target.closest("[data-set-lang]");
      if (!btn || typeof window.setPpLang !== "function") return;
      var lang = btn.getAttribute("data-set-lang");
      if (btn.getAttribute("aria-pressed") === "true") {
        e.preventDefault();
        e.stopPropagation();
        return;
      }
      e.preventDefault();
      e.stopPropagation();
      if (reduce) {
        window.setPpLang(lang);
        return;
      }
      html.classList.add("lang-fading");
      window.setTimeout(function () {
        window.setPpLang(lang);
        window.setTimeout(function () {
          html.classList.remove("lang-fading");
        }, 30);
      }, 170);
    },
    true
  );

  if (reduce || !hasIO) return;
  html.classList.add("has-fx");

  /* ── tag reveal targets ── */
  function siblingIndex(el) {
    return Array.prototype.indexOf.call(el.parentNode.children, el);
  }
  function tag(selector, kind, stagger, cap) {
    document.querySelectorAll(selector).forEach(function (el) {
      if (el.closest(".hero") || el.hasAttribute("data-fx")) return;
      el.setAttribute("data-fx", kind || "");
      if (stagger) {
        var i = Math.min(siblingIndex(el), cap || 6);
        el.style.setProperty("--fx-delay", (i * stagger).toFixed(2) + "s");
      }
    });
  }
  tag(".block > h2, .visit-copy > h2", "left");
  tag(".block > .intro, .block > .note, .visit-copy > p, .visit-copy > dl, .visit-copy > .hero-actions", "");
  tag(".shots button", "scale", 0.09, 5);
  tag(".steps li, .platters article", "", 0.1, 3);
  tag(".sheet, .ticket", "scale");
  tag(".sheet-list li", "", 0.045, 8);
  tag(".quotes li", "", 0.1, 3);

  var io = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.classList.add("is-in");
        io.unobserve(en.target);
      });
    },
    { rootMargin: "0px 0px -6% 0px", threshold: 0.04 }
  );
  document.querySelectorAll("[data-fx]").forEach(function (el) {
    io.observe(el);
  });

  /* safety net: never leave something hidden (e.g. anchor jumps, print) */
  window.setTimeout(function () {
    document.querySelectorAll("[data-fx]:not(.is-in)").forEach(function (el) {
      var r = el.getBoundingClientRect();
      if (r.top < window.innerHeight && r.bottom > 0) el.classList.add("is-in");
    });
  }, 2500);
  window.addEventListener("beforeprint", function () {
    document.querySelectorAll("[data-fx]").forEach(function (el) {
      el.classList.add("is-in");
    });
  });

  /* ── hero parallax ── */
  var hero = document.querySelector("[data-hero-scene]");
  if (hero) {
    var ticking = false;
    function parallax() {
      ticking = false;
      var r = hero.getBoundingClientRect();
      if (r.bottom < 0) return;
      var y = Math.min(Math.max(-r.top, 0), r.height);
      hero.style.setProperty("--hero-y", (y * 0.1).toFixed(1) + "px");
      hero.style.setProperty("--hero-fade", Math.max(0, 1 - y / (r.height * 0.75)).toFixed(3));
    }
    window.addEventListener(
      "scroll",
      function () {
        if (ticking) return;
        ticking = true;
        window.requestAnimationFrame(parallax);
      },
      { passive: true }
    );
    parallax();
  }
})();
