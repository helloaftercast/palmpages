(function () {
  var KEY = "pp-lang";
  var VISIBLE = ["en", "ru", "zh"];
  var FALLBACK = ["en", "ru", "zh", "th"];

  function detect() {
    try {
      var saved = localStorage.getItem(KEY);
      if (saved === "th") return "en";
      if (VISIBLE.indexOf(saved) !== -1) return saved;
    } catch (err) {}
    var nav = String(navigator.language || navigator.userLanguage || "").toLowerCase();
    if (nav.indexOf("zh") === 0) return "zh";
    if (nav.indexOf("ru") === 0) return "ru";
    return "en";
  }

  function attrFor(el, lang, suffix) {
    var keys = [lang].concat(FALLBACK);
    var i;
    for (i = 0; i < keys.length; i += 1) {
      var val = el.getAttribute("data-" + keys[i] + suffix);
      if (val != null) return val;
    }
    return null;
  }

  function htmlLang(lang) {
    if (lang === "zh") return "zh-CN";
    return lang;
  }

  function apply(lang) {
    if (VISIBLE.indexOf(lang) === -1) lang = "en";
    document.documentElement.lang = htmlLang(lang);
    document.documentElement.setAttribute("data-lang", lang);
    try {
      localStorage.setItem(KEY, lang);
    } catch (err) {}

    document.querySelectorAll("[data-en], [data-th], [data-ru], [data-zh]").forEach(function (el) {
      var next = attrFor(el, lang, "");
      if (next != null) el.textContent = next;
    });

    document.querySelectorAll("[data-en-placeholder], [data-th-placeholder], [data-ru-placeholder], [data-zh-placeholder]").forEach(function (el) {
      var next = attrFor(el, lang, "-placeholder");
      if (next != null) el.setAttribute("placeholder", next);
    });

    document.querySelectorAll("[data-set-lang]").forEach(function (btn) {
      var on = btn.getAttribute("data-set-lang") === lang;
      btn.classList.toggle("is-active", on);
      btn.setAttribute("aria-pressed", on ? "true" : "false");
    });

    document.querySelectorAll("[data-add]").forEach(function (btn) {
      var name =
        btn.getAttribute("data-name-" + lang) ||
        btn.getAttribute("data-name-en") ||
        btn.getAttribute("data-name-ru") ||
        btn.getAttribute("data-name-zh") ||
        btn.getAttribute("data-name-th") ||
        btn.getAttribute("data-name");
      if (!name) return;
      btn.setAttribute("data-name", name);
      var label = btn.querySelector("span");
      if (
        label &&
        !label.hasAttribute("data-en") &&
        !label.hasAttribute("data-th") &&
        !label.hasAttribute("data-ru") &&
        !label.hasAttribute("data-zh")
      ) {
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
