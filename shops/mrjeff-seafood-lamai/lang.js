(function () {
  var KEY = "pp-lang";

  function detect() {
    try {
      var saved = localStorage.getItem(KEY);
      if (saved === "en" || saved === "th") return saved;
    } catch (err) {}
    var nav = String(navigator.language || navigator.userLanguage || "").toLowerCase();
    return nav.indexOf("th") === 0 ? "th" : "en";
  }

  function textFor(el, lang) {
    var en = el.getAttribute("data-en");
    var th = el.getAttribute("data-th");
    if (en == null && th == null) return null;
    if (lang === "th") return th != null ? th : en;
    return en != null ? en : th;
  }

  function apply(lang) {
    if (lang !== "en" && lang !== "th") lang = "en";
    document.documentElement.lang = lang;
    document.documentElement.setAttribute("data-lang", lang);
    try {
      localStorage.setItem(KEY, lang);
    } catch (err) {}

    document.querySelectorAll("[data-en], [data-th]").forEach(function (el) {
      var next = textFor(el, lang);
      if (next != null) el.textContent = next;
    });

    document.querySelectorAll("[data-en-placeholder], [data-th-placeholder]").forEach(function (el) {
      var en = el.getAttribute("data-en-placeholder");
      var th = el.getAttribute("data-th-placeholder");
      var next = lang === "th" ? (th != null ? th : en) : (en != null ? en : th);
      if (next != null) el.setAttribute("placeholder", next);
    });

    document.querySelectorAll("[data-set-lang]").forEach(function (btn) {
      btn.classList.toggle("is-active", btn.getAttribute("data-set-lang") === lang);
      btn.setAttribute("aria-pressed", btn.getAttribute("data-set-lang") === lang ? "true" : "false");
    });

    document.querySelectorAll("[data-add][data-name-en], [data-add][data-name-th]").forEach(function (btn) {
      var en = btn.getAttribute("data-name-en");
      var th = btn.getAttribute("data-name-th");
      var name = lang === "th" ? (th || en) : (en || th);
      if (!name) return;
      btn.setAttribute("data-name", name);
      var label = btn.querySelector("span");
      if (label && !label.hasAttribute("data-en") && !label.hasAttribute("data-th")) {
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
