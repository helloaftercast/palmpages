(function () {
  var WA = "";
  var AIRBNB = "https://www.airbnb.com/experiences/6612487";
  var LEAD_MIN = 90;
  var SLOTS = [
    { value: "morning", en: "Morning", pt: "Manhã" },
    { value: "afternoon", en: "Afternoon", pt: "Tarde" }
  ];

  var linesEl = document.querySelector("[data-lines]");
  var emptyEl = document.querySelector("[data-empty]");
  var totalEl = document.querySelector("[data-total]");
  var form = document.querySelector("[data-form]");
  var dayEl = form && form.elements.namedItem("day");
  var slotEl = form && form.elements.namedItem("slot");
  var warnEl = document.querySelector("[data-warn]");
  var reserveDock = document.querySelector("[data-reserve-dock]");
  var chatLayer = document.querySelector("[data-order-chat]");
  var cart = [];
  var bookVisible = false;

  function lang() {
    return (window.getPpLang && window.getPpLang()) || document.documentElement.getAttribute("data-lang") || "en";
  }

  function isPt() {
    return lang() === "pt";
  }

  function lisbonParts(date) {
    var parts = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Europe/Lisbon",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      weekday: "short"
    }).formatToParts(date);
    var get = function (type) {
      return (parts.find(function (p) { return p.type === type; }) || {}).value;
    };
    return {
      y: get("year"),
      m: get("month"),
      d: get("day"),
      hour: get("hour"),
      minute: get("minute"),
      weekday: get("weekday")
    };
  }

  function ymd(parts) {
    return parts.y + "-" + parts.m + "-" + parts.d;
  }

  function money(n) {
    if (!n || n === 0) return isPt() ? "a confirmar" : "ask";
    return "€" + n;
  }

  function lineMoney(item) {
    if (!item.price || item.price === 0) {
      return item.qty > 1 ? money(0) + " × " + item.qty : money(0);
    }
    return money(item.price * item.qty);
  }

  function pricedTotal() {
    return cart.reduce(function (sum, item) {
      return sum + (item.price || 0) * item.qty;
    }, 0);
  }

  function hasAsk() {
    return cart.some(function (item) { return !item.price || item.price === 0; });
  }

  function count() {
    return cart.reduce(function (sum, item) {
      return sum + item.qty;
    }, 0);
  }

  function itemName(item) {
    return isPt() ? (item.namePt || item.nameEn || item.name) : (item.nameEn || item.namePt || item.name);
  }

  function slotLabel(value) {
    var found = SLOTS.find(function (s) { return s.value === value; });
    if (!found) return value;
    return isPt() ? found.pt : found.en;
  }

  function greet() {
    return isPt()
      ? "Olá Prestige Kayak Algarve, queria reservar um kayak a partir da Praia Nova."
      : "Hi Prestige Kayak Algarve, I'd like to book a kayak from Praia Nova.";
  }

  function bookHref() {
    return AIRBNB;
  }

  function dockLabel() {
    if (!count()) return isPt() ? "Reservar no Airbnb" : "Book on Airbnb";
    return isPt() ? "Copiar e abrir o Airbnb" : "Copy and open Airbnb";
  }

  function syncDock() {
    if (!reserveDock) return;
    reserveDock.href = "#book";
    reserveDock.textContent = dockLabel();
    reserveDock.classList.add("is-wa");
  }

  function add(item) {
    var found = cart.find(function (row) { return row.id === item.id; });
    if (found) found.qty += 1;
    else cart.push({
      id: item.id,
      nameEn: item.nameEn,
      namePt: item.namePt,
      name: item.nameEn || item.namePt,
      price: item.price,
      qty: 1
    });
    clearBad();
    render();
  }

  function setQty(id, qty) {
    var found = cart.find(function (row) { return row.id === id; });
    if (!found) return;
    if (qty < 1) cart.splice(cart.indexOf(found), 1);
    else found.qty = qty;
    render();
  }

  function markAdds() {
    document.querySelectorAll("[data-add]").forEach(function (btn) {
      var id = btn.getAttribute("data-id");
      var found = cart.find(function (row) { return row.id === id; });
      btn.classList.toggle("is-added", Boolean(found));
    });
  }

  function renderLines() {
    if (!linesEl) return;
    linesEl.innerHTML = "";
    cart.forEach(function (item) {
      var li = document.createElement("li");
      li.innerHTML =
        "<span>" + itemName(item) + "</span>" +
        "<span class=\"ticket-qty\">" +
          "<button type=\"button\" data-qty=\"" + item.id + "\" data-d=\"-1\" aria-label=\"Remove one\">−</button>" +
          "<b>" + item.qty + "</b>" +
          "<button type=\"button\" data-qty=\"" + item.id + "\" data-d=\"1\" aria-label=\"Add one\">+</button>" +
        "</span>" +
        "<strong>" + lineMoney(item) + "</strong>";
      linesEl.appendChild(li);
    });
  }

  function renderDock() {
    if (!reserveDock) return;
    syncDock();
    reserveDock.hidden = bookVisible;
  }

  function showWarn(msg) {
    if (!warnEl) return;
    warnEl.textContent = msg || "";
    warnEl.hidden = !msg;
  }

  function clearBad() {
    document.querySelectorAll(".is-bad").forEach(function (n) {
      n.classList.remove("is-bad");
      n.removeAttribute("aria-invalid");
    });
    showWarn("");
  }

  function focusBad(el, msg) {
    clearBad();
    showWarn(msg);
    if (!el) return;
    el.classList.add("is-bad");
    if (el.setAttribute) el.setAttribute("aria-invalid", "true");
    el.scrollIntoView({ behavior: "smooth", block: "center" });
    window.setTimeout(function () {
      if (typeof el.focus !== "function") return;
      try { el.focus({ preventScroll: true }); } catch (err) { el.focus(); }
    }, 280);
  }

  function firstError() {
    if (!form) return null;
    if (!cart.length) {
      return {
        el: document.querySelector(".order-places") || document.getElementById("book"),
        msg: isPt() ? "Toquem num lugar acima primeiro." : "Tap a place above first."
      };
    }
    if (!form.name.value.trim()) {
      return { el: form.name, msg: isPt() ? "Escrevam o vosso nome." : "Write your name." };
    }
    var digits = String(form.phone.value || "").replace(/\D/g, "");
    if (digits.length < 8) {
      return {
        el: form.phone,
        msg: isPt() ? "Escrevam um WhatsApp que possamos alcançar." : "Write a WhatsApp number we can reach."
      };
    }
    if (!dayEl || !dayEl.value) {
      return { el: dayEl, msg: isPt() ? "Escolham o dia." : "Pick a day." };
    }
    if (!slotEl || !slotEl.value) {
      return { el: slotEl, msg: isPt() ? "Escolham a manhã ou a tarde." : "Pick morning or afternoon." };
    }
    return null;
  }

  function sendBooking() {
    var bad = firstError();
    if (bad) {
      focusBad(bad.el, bad.msg);
      return false;
    }
    clearBad();
    var text = message({
      name: form.name.value.trim(),
      phone: form.phone.value.trim(),
      people: form.people.value,
      day: form.day.value,
      slot: form.slot.value,
      note: form.note.value.trim()
    });
    prepareChat();
    if (window.playOrderChat) window.playOrderChat({ text: text, href: bookHref(), copy: true });
    else window.location.href = bookHref();
    return true;
  }

  function render() {
    var has = cart.length > 0;
    if (emptyEl) emptyEl.hidden = has;
    if (linesEl) linesEl.hidden = !has;
    if (totalEl) {
      totalEl.hidden = !has;
      totalEl.textContent = isPt() ? "Preço no Airbnb / no dia" : "Confirm the price on Airbnb";
    }
    renderLines();
    markAdds();
    renderDock();
    syncDock();
  }

  function fillDays() {
    if (!dayEl) return;
    var now = lisbonParts(new Date());
    var start = new Date(Date.UTC(Number(now.y), Number(now.m) - 1, Number(now.d)));
    dayEl.innerHTML = "";
    for (var i = 0; i < 12; i += 1) {
      var next = new Date(start.getTime() + i * 86400000);
      var iso = next.toISOString().slice(0, 10);
      var opt = document.createElement("option");
      opt.value = iso;
      opt.textContent = iso === ymd(now)
        ? (isPt() ? "Hoje, " + iso : "Today, " + iso)
        : iso;
      dayEl.appendChild(opt);
    }
  }

  function fillSlots() {
    if (!slotEl) return;
    var keep = slotEl.value;
    slotEl.innerHTML = "";
    SLOTS.forEach(function (slot) {
      var opt = document.createElement("option");
      opt.value = slot.value;
      opt.textContent = isPt() ? slot.pt : slot.en;
      slotEl.appendChild(opt);
    });
    if (keep) slotEl.value = keep;
  }

  function message(data) {
    var rows = cart.map(function (item) {
      return "• " + itemName(item) + " × " + item.qty + " — " + lineMoney(item);
    });
    var pt = isPt();
    var lines = pt ? [
      "Reserva Prestige Kayak Algarve — Praia Nova / Gruta dos Capitães",
      "",
      "Nome: " + data.name,
      "WhatsApp: " + data.phone,
      "Pessoas: " + data.people,
      "Saída: " + data.day + " " + slotLabel(data.slot),
      data.note ? "Nota: " + data.note : "",
      "",
      rows.join("\n"),
      "",
      "Por favor confirmem o preço. Ainda não paguei."
    ] : [
      "Booking for Prestige Kayak Algarve — Praia Nova / Captains' Cave",
      "",
      "Name: " + data.name,
      "WhatsApp: " + data.phone,
      "People: " + data.people,
      "Launch: " + data.day + " " + slotLabel(data.slot),
      data.note ? "Note: " + data.note : "",
      "",
      rows.join("\n"),
      "",
      "Please confirm the price. Not paid."
    ];
    return lines.filter(function (line) { return line !== ""; }).join("\n");
  }

  function prepareChat() {
    if (!chatLayer) return;
    var pt = isPt();
    chatLayer.setAttribute("data-name", "Prestige Kayak Algarve");
    chatLayer.setAttribute(
      "data-reply",
      pt
        ? "Eles ainda só respondem no Airbnb. Copiem a mensagem e colem lá."
        : "They still only reply on Airbnb. Copy the message and paste it there."
    );
    chatLayer.setAttribute("data-continue", pt ? "Abrir Airbnb" : "Open Airbnb");
    chatLayer.classList.add("is-wa");
  }

  document.addEventListener("click", function (e) {
    var addBtn = e.target.closest("[data-add]");
    if (addBtn) {
      add({
        id: addBtn.getAttribute("data-id"),
        nameEn: addBtn.getAttribute("data-name-en") || addBtn.getAttribute("data-name"),
        namePt: addBtn.getAttribute("data-name-pt") || addBtn.getAttribute("data-name"),
        price: Number(addBtn.getAttribute("data-price"))
      });
      return;
    }
    var qtyBtn = e.target.closest("[data-qty]");
    if (qtyBtn) {
      var found = cart.find(function (row) { return row.id === qtyBtn.getAttribute("data-qty"); });
      if (found) setQty(found.id, found.qty + Number(qtyBtn.getAttribute("data-d")));
    }
  });

  if (form) {
    try {
      fillDays();
      fillSlots();
    } catch (err) {}
    if (dayEl) dayEl.addEventListener("change", function () { clearBad(); fillSlots(); });
    if (slotEl) slotEl.addEventListener("change", clearBad);
    ["name", "phone"].forEach(function (field) {
      if (form[field]) form[field].addEventListener("input", clearBad);
    });
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      sendBooking();
    });
  }

  if (reserveDock) {
    reserveDock.addEventListener("click", function (e) {
      e.preventDefault();
      if (count() && !firstError()) {
        sendBooking();
        return;
      }
      var bad = firstError();
      if (bad) focusBad(bad.el, bad.msg);
      else document.getElementById("book").scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  window.addEventListener("pp-lang", function () {
    try {
      fillDays();
      fillSlots();
    } catch (err) {}
    render();
  });

  var bookSection = document.getElementById("book");
  if (bookSection && "IntersectionObserver" in window) {
    new IntersectionObserver(function (entries) {
      bookVisible = entries[0].isIntersecting;
      renderDock();
    }, { threshold: 0.12 }).observe(bookSection);
  }

  render();
})();
