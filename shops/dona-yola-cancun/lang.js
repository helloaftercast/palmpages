(function () {
  var KEY = "pp-lang-yola";

  function detect() {
    try {
      var saved = localStorage.getItem(KEY);
      if (saved === "en" || saved === "es") return saved;
    } catch (err) {}
    var nav = String(navigator.language || navigator.userLanguage || "").toLowerCase();
    return nav.indexOf("es") === 0 ? "es" : "en";
  }

  function textFor(el, lang) {
    var en = el.getAttribute("data-en");
    var es = el.getAttribute("data-es");
    if (en == null && es == null) return null;
    if (lang === "es") return es != null ? es : en;
    return en != null ? en : es;
  }

  function apply(lang) {
    if (lang !== "en" && lang !== "es") lang = "en";
    document.documentElement.lang = lang;
    document.documentElement.setAttribute("data-lang", lang);
    try {
      localStorage.setItem(KEY, lang);
    } catch (err) {}

    document.querySelectorAll("[data-en], [data-es]").forEach(function (el) {
      var next = textFor(el, lang);
      if (next != null) el.textContent = next;
    });

    document.querySelectorAll("[data-en-placeholder], [data-es-placeholder]").forEach(function (el) {
      var en = el.getAttribute("data-en-placeholder");
      var es = el.getAttribute("data-es-placeholder");
      var next = lang === "es" ? (es != null ? es : en) : (en != null ? en : es);
      if (next != null) el.setAttribute("placeholder", next);
    });

    document.querySelectorAll("[data-set-lang]").forEach(function (btn) {
      btn.classList.toggle("is-active", btn.getAttribute("data-set-lang") === lang);
      btn.setAttribute("aria-pressed", btn.getAttribute("data-set-lang") === lang ? "true" : "false");
    });

    document.querySelectorAll("[data-add][data-name-en], [data-add][data-name-es]").forEach(function (btn) {
      var en = btn.getAttribute("data-name-en");
      var es = btn.getAttribute("data-name-es");
      var name = lang === "es" ? (es || en) : (en || es);
      if (!name) return;
      btn.setAttribute("data-name", name);
      var label = btn.querySelector("span");
      if (label && !label.hasAttribute("data-en") && !label.hasAttribute("data-es")) {
        label.textContent = name;
      }
    });

    document.querySelectorAll("[data-wa-en]").forEach(function (a) {
      var href = lang === "es" ? a.getAttribute("data-wa-es") : a.getAttribute("data-wa-en");
      if (href) a.setAttribute("href", href);
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
