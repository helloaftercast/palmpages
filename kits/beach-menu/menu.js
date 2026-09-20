(function () {
  var nav = document.querySelector("[data-nav]");
  var pills = document.querySelectorAll("[data-cats] button");
  var sections = document.querySelectorAll("[data-menu-section]");
  var last = "";

  function onScroll() {
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
  onScroll();
})();
