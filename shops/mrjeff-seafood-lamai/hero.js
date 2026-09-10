(function () {
  const hero = document.querySelector("[data-hero-scene]");
  if (!hero) return;

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let settled = false;

  function settle() {
    if (settled) return;
    settled = true;
    hero.classList.remove("is-playing");
    hero.classList.add("is-settled");
  }

  if (reduce) {
    settle();
    return;
  }

  const stage = hero.querySelector(".hero-stage");
  if (stage) {
    stage.addEventListener("animationend", function (e) {
      if (e.target === stage && e.animationName === "hero-pan") settle();
    });
  }

  window.setTimeout(settle, 9000);
})();
