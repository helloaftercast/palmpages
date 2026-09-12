(function () {
  /* ---------- hero demo: zoom the phone up, pick dishes, watch the order land in WhatsApp ---------- */
  var demo = document.querySelector("[data-demo]");
  if (demo) {
    var slot = demo.parentElement;
    var backdrop = document.querySelector(".demo-backdrop");
    var closeBtn = demo.querySelector(".preview-close");
    var items = demo.querySelectorAll("[data-item]");
    var totalEl = demo.querySelector("[data-total]");
    var wa = demo.querySelector(".preview-wa");
    var orderText = demo.querySelector("[data-order-text]");
    var ticks = demo.querySelector(".ticks");
    var bubbles = demo.querySelectorAll(".bubble");
    var again = demo.querySelector(".chat-again");
    var zoomed = false, animating = false, typing = null;
    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function total() {
      var t = 0;
      items.forEach(function (it) {
        if (it.classList.contains("is-picked")) t += parseInt(it.getAttribute("data-cost"), 10);
      });
      totalEl.textContent = "$" + t;
      return t;
    }

    function open() {
      if (zoomed || animating) return;
      zoomed = true; animating = true;
      var r0 = demo.getBoundingClientRect();
      slot.style.width = r0.width + "px";
      slot.style.height = r0.height + "px";
      demo.classList.add("is-zoom");
      demo.style.transition = "none";
      var w1 = demo.offsetWidth, h1 = demo.offsetHeight;
      var vw = window.innerWidth, vh = window.innerHeight;
      var s = Math.min(1.5, (vw * 0.92) / w1, (vh * 0.9) / h1);
      var tx = (vw - w1 * s) / 2, ty = (vh - h1 * s) / 2;
      demo.style.transform = "translate(" + r0.left + "px," + r0.top + "px) scale(" + (r0.width / w1) + ")";
      void demo.offsetWidth;
      demo.style.transition = "";
      demo.classList.add("is-anim");
      document.body.classList.add("demo-open");
      requestAnimationFrame(function () {
        demo.style.transform = "translate(" + tx + "px," + ty + "px) scale(" + s + ")";
      });
      window.setTimeout(function () { animating = false; }, reduce ? 0 : 650);
    }

    function close() {
      if (!zoomed || animating) return;
      animating = true;
      var r0 = slot.getBoundingClientRect();
      var w1 = demo.offsetWidth;
      document.body.classList.remove("demo-open");
      demo.style.transform = "translate(" + r0.left + "px," + r0.top + "px) scale(" + (r0.width / w1) + ")";
      window.setTimeout(function () {
        demo.classList.remove("is-anim", "is-zoom", "is-chat");
        demo.style.transform = "";
        slot.style.width = ""; slot.style.height = "";
        resetOrder();
        zoomed = false; animating = false;
      }, reduce ? 0 : 600);
    }

    function resetOrder() {
      if (typing) { window.clearInterval(typing); typing = null; }
      items.forEach(function (it) { it.classList.remove("is-picked"); });
      total();
      bubbles.forEach(function (b) { b.classList.remove("is-in"); });
      ticks.classList.remove("is-read");
      again.classList.remove("is-in");
      orderText.textContent = "";
    }

    function send() {
      var picked = Array.prototype.filter.call(items, function (it) { return it.classList.contains("is-picked"); });
      if (!picked.length) {                       // nothing chosen: nudge the rows, don't send
        items.forEach(function (it) {
          it.classList.remove("is-nudge"); void it.offsetWidth; it.classList.add("is-nudge");
        });
        return;
      }
      var lines = ["Hi! I'd like:"];
      picked.forEach(function (it) {
        lines.push("1\u00d7 " + it.children[0].textContent + " \u2014 " + it.children[1].textContent);
      });
      lines.push("Total $" + total(), "Thanks!");
      var text = lines.join("\n");

      demo.classList.add("is-chat");
      window.setTimeout(function () {
        bubbles[0].classList.add("is-in");
        if (reduce) { orderText.textContent = text; afterTyped(); return; }
        var i = 0;
        typing = window.setInterval(function () {
          i += 2;
          orderText.textContent = text.slice(0, i);
          if (i >= text.length) { window.clearInterval(typing); typing = null; afterTyped(); }
        }, 22);
      }, 450);
    }

    function afterTyped() {
      window.setTimeout(function () { ticks.classList.add("is-read"); }, 500);
      window.setTimeout(function () { bubbles[1].classList.add("is-in"); }, 1300);
      window.setTimeout(function () { again.classList.add("is-in"); }, 1900);
    }

    demo.addEventListener("click", function (e) {
      if (!zoomed) { open(); return; }
      var row = e.target.closest("[data-item]");
      if (row) { row.classList.toggle("is-picked"); total(); return; }
      if (e.target === wa || wa.contains(e.target)) { send(); return; }
      if (e.target === closeBtn) { close(); return; }
      if (e.target === again) {
        demo.classList.remove("is-chat");
        window.setTimeout(resetOrder, 500);
      }
    });
    demo.addEventListener("keydown", function (e) {
      if (!zoomed && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); open(); }
    });
    backdrop.addEventListener("click", close);
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") close(); });
    window.addEventListener("resize", function () { if (zoomed && !animating) { close(); } });
  }

  document.querySelectorAll("[data-pulse]").forEach(function (el) {
    el.addEventListener("click", function () {
      el.classList.remove("is-pop");
      void el.offsetWidth;
      el.classList.add("is-pop");
    });
  });

  /* ---------- brand logos: same pop on click as the header ---------- */
  document.querySelectorAll(".brand").forEach(function (el) {
    el.addEventListener("click", function () {
      el.classList.remove("is-pop");
      void el.offsetWidth;
      el.classList.add("is-pop");
    });
  });

  /* ---------- pricing: the price show ---------- */
  var box = document.querySelector(".price-box[data-price]");
  if (!box) return;

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var num = box.querySelector(".amount-num");
  var range = box.querySelector(".amount-range");
  var stamp = box.querySelector(".stamp");
  var olds = box.querySelectorAll(".old-item");
  var meter = box.querySelector(".meter");
  var month = box.querySelector("[data-month]");
  var zero = box.querySelector(".meter-zero");
  var target = parseInt(num.getAttribute("data-count"), 10) || 300;
  var MONTHS = 36;
  var played = false;

  function finishInstantly() {
    box.classList.add("is-live");
    olds.forEach(function (o) { o.classList.add("is-struck"); });
    num.textContent = target;
    range.classList.add("is-in");
    stamp.classList.add("is-stamped");
    meter.classList.add("is-in", "is-done");
    month.textContent = MONTHS;
  }

  function countUp(done) {
    var dur = 1300, start = null;
    function ease(t) { return 1 - Math.pow(1 - t, 3); }
    function frame(ts) {
      if (!start) start = ts;
      var p = Math.min(1, (ts - start) / dur);
      num.textContent = Math.round(ease(p) * target);
      if (p < 1) requestAnimationFrame(frame);
      else { num.classList.add("is-land"); done(); }
    }
    requestAnimationFrame(frame);
  }

  function runMeter() {
    var m = 1;
    month.textContent = m;
    var id = window.setInterval(function () {
      m += 1;
      month.textContent = m;
      zero.classList.remove("is-tick");
      void zero.offsetWidth;
      zero.classList.add("is-tick");
      if (m >= MONTHS) {
        window.clearInterval(id);
        window.setTimeout(function () { meter.classList.add("is-done"); }, 250);
      }
    }, 75);
  }

  function play() {
    if (played) return;
    played = true;
    if (reduce) { finishInstantly(); return; }

    num.textContent = "0";
    box.classList.add("is-live");                       // old prices slide in

    olds.forEach(function (o, i) {                      // strike them one by one
      window.setTimeout(function () { o.classList.add("is-struck"); }, 800 + i * 220);
    });

    window.setTimeout(function () {                     // our number rolls up
      countUp(function () {
        window.setTimeout(function () { range.classList.add("is-in"); }, 150);
        window.setTimeout(function () {                 // stamp slams down
          stamp.classList.add("is-stamped");
          box.classList.add("is-shake");
          window.setTimeout(function () { box.classList.add("is-glow"); }, 120);
        }, 550);
        window.setTimeout(function () {                 // then the $0 meter runs
          meter.classList.add("is-in");
          window.setTimeout(runMeter, 400);
        }, 1250);
      });
    }, 1300);
  }

  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { play(); io.disconnect(); }
      });
    }, { threshold: 0.45 });
    io.observe(box);
  } else {
    finishInstantly();
  }

  box.addEventListener("click", function () {           // click to replay
    if (!played || reduce) return;
    played = false;
    box.classList.remove("is-live", "is-shake", "is-glow");
    olds.forEach(function (o) { o.classList.remove("is-struck"); });
    num.classList.remove("is-land");
    range.classList.remove("is-in");
    stamp.classList.remove("is-stamped");
    meter.classList.remove("is-in", "is-done");
    zero.classList.remove("is-tick");
    void box.offsetWidth;
    play();
  });
})();

(function () {
  var form = document.querySelector("[data-check]");
  if (!form) return;
  var note = form.querySelector("[data-check-note]");
  var hints = {
    restaurant: form.getAttribute("data-hint-restaurant") ||
      "For restaurants, the first screen is often Grab, TheFork, or a Facebook page. We will say who sits there.",
    outdoor: form.getAttribute("data-hint-outdoor") ||
      "For kayak, surf and boat trips, GetYourGuide and Viator often own the name. We will say if that is you.",
    other: form.getAttribute("data-hint-other") ||
      "We will search the name as a guest would, then tell you who owns that first screen."
  };

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var name = (form.elements.name.value || "").trim();
    var city = (form.elements.city.value || "").trim();
    var type = form.elements.type.value;
    if (!name || !city || !type) {
      form.reportValidity();
      return;
    }
    if (note) {
      note.hidden = false;
      note.textContent = hints[type] || hints.other;
    }
    var subject = "Who owns the search for " + name + " (" + city + ")";
    var body = [
      "Business: " + name,
      "City: " + city,
      "Type: " + type,
      "",
      "Please check who ranks first for this name — our site, Maps, Grab / TheFork / GetYourGuide / Viator — and say if a one-page draft is worth building."
    ].join("\n");
    window.location.href = "mailto:hello@palmpages.com?subject=" +
      encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
  });
})();
