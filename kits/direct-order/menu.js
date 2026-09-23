(function () {
  var nav = document.querySelector("[data-nav]");
  var pills = document.querySelectorAll("[data-cats] button");
  var sections = document.querySelectorAll("[data-menu-section]");
  var pageLinks = document.querySelectorAll("[data-page]");
  var last = "";

  var cats = document.querySelector("[data-cats]");

  function pinCats() {
    if (!nav || !cats) return;
    cats.style.top = Math.ceil(nav.getBoundingClientRect().height) + "px";
  }

  function onScroll() {
    pinCats();
    if (nav) nav.classList.toggle("is-scrolled", window.scrollY > 24);
    var current = "";
    sections.forEach(function (section) {
      if (section.getBoundingClientRect().top <= 150) current = section.id;
    });
    if (current === last) return;
    last = current;
    pills.forEach(function (btn) {
      var on = btn.getAttribute("data-target") === current;
      btn.classList.toggle("is-on", on);
      if (on) btn.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    });
    var inMenu = current === "start" || current === "highlights" || current === "plates" || current === "drinks";
    pageLinks.forEach(function (link) {
      var id = (link.getAttribute("href") || "").slice(1);
      link.classList.toggle("is-on", id && (id === current || (id === "menu" && inMenu)));
    });
  }

  pills.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var target = document.getElementById(btn.getAttribute("data-target"));
      if (!target) return;
      var top = target.getBoundingClientRect().top + window.scrollY - 120;
      window.scrollTo({ top: top, behavior: "smooth" });
    });
  });

  var ticking = false;
  window.addEventListener("scroll", function () {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      onScroll();
      ticking = false;
    });
  }, { passive: true });
  window.addEventListener("resize", pinCats);
  pinCats();
  onScroll();

  var heads = document.querySelectorAll(".block h2");
  if (!("IntersectionObserver" in window)) {
    heads.forEach(function (head) { head.classList.add("is-seen"); });
  } else {
    var seen = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-seen");
        seen.unobserve(entry.target);
      });
    }, { threshold: 0.6 });
    heads.forEach(function (head) { seen.observe(head); });
  }

  var openBtn = document.getElementById("overview-open");
  var panel = document.getElementById("overview");
  var back = document.getElementById("overview-back");
  var closeBtn = document.getElementById("overview-close");

  function setOverview(on) {
    if (!panel || !back || !openBtn) return;
    panel.hidden = !on;
    back.hidden = !on;
    openBtn.setAttribute("aria-expanded", on ? "true" : "false");
    openBtn.classList.toggle("is-on", on);
  }

  if (openBtn) openBtn.addEventListener("click", function () { setOverview(panel.hidden); });
  if (closeBtn) closeBtn.addEventListener("click", function () { setOverview(false); });
  if (back) back.addEventListener("click", function () { setOverview(false); });
  if (panel) {
    panel.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function (event) {
        var id = (link.getAttribute("href") || "").slice(1);
        var target = document.getElementById(id);
        if (!target) return;
        event.preventDefault();
        setOverview(false);
        var top = target.getBoundingClientRect().top + window.scrollY - 120;
        window.scrollTo({ top: top, behavior: "smooth" });
      });
    });
  }
  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") setOverview(false);
  });
})();
