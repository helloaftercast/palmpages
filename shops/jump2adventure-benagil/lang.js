(function () {
  var KEY = "pp-lang-j2a";

  function detect() {
    try {
      var saved = localStorage.getItem(KEY);
      if (saved === "en" || saved === "pt") return saved;
    } catch (err) {}
    var nav = String(navigator.language || navigator.userLanguage || "").toLowerCase();
    return nav.indexOf("pt") === 0 ? "pt" : "en";
  }

  function textFor(el, lang) {
    var en = el.getAttribute("data-en");
    var pt = el.getAttribute("data-pt");
    if (en == null && pt == null) return null;
    if (lang === "pt") return pt != null ? pt : en;
    return en != null ? en : pt;
  }

  function apply(lang) {
    if (lang !== "en" && lang !== "pt") lang = "en";
    document.documentElement.lang = lang;
    document.documentElement.setAttribute("data-lang", lang);
    try {
      localStorage.setItem(KEY, lang);
    } catch (err) {}

    document.querySelectorAll("[data-en], [data-pt]").forEach(function (el) {
      var next = textFor(el, lang);
      if (next != null) el.textContent = next;
    });

    document.querySelectorAll("[data-en-placeholder], [data-pt-placeholder]").forEach(function (el) {
      var en = el.getAttribute("data-en-placeholder");
      var pt = el.getAttribute("data-pt-placeholder");
      var next = lang === "pt" ? (pt != null ? pt : en) : (en != null ? en : pt);
      if (next != null) el.setAttribute("placeholder", next);
    });

    document.querySelectorAll("[data-set-lang]").forEach(function (btn) {
      btn.classList.toggle("is-active", btn.getAttribute("data-set-lang") === lang);
      btn.setAttribute("aria-pressed", btn.getAttribute("data-set-lang") === lang ? "true" : "false");
    });

    document.querySelectorAll("[data-add][data-name-en], [data-add][data-name-pt]").forEach(function (btn) {
      var en = btn.getAttribute("data-name-en");
      var pt = btn.getAttribute("data-name-pt");
      var name = lang === "pt" ? (pt || en) : (en || pt);
      if (!name) return;
      btn.setAttribute("data-name", name);
      var label = btn.querySelector("span");
      if (label && !label.hasAttribute("data-en") && !label.hasAttribute("data-pt")) {
        label.textContent = name;
      }
    });

    window.dispatchEvent(new CustomEvent("pp-lang", { detail: { lang: lang } }));
  }

  window.getPpLang = function () {
    return document.documentElement.getAttribute("data-lang") || detect();
  };

  window.setPpLang = apply;

  document.addEventListener("click", function (e) {
    var btn = e.target.closest("[data-set-lang]");
    if (!btn) return;
    e.preventDefault();
    apply(btn.getAttribute("data-set-lang"));
  });

  apply(detect());
})();
