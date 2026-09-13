(function () {
  var WA = "351936242322";
  var LEAD_MIN = 90;
  var SLOTS = ["09:30", "14:00"];

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
  var busySet = Object.create(null);
  var bookVisible = false;

  function markBusy(list) {
    busySet = Object.create(null);
    (list || []).forEach(function (key) {
      busySet[key] = true;
    });
  }

  function isBusy(day, slot) {
    return Boolean(busySet[day] || (slot && busySet[day + "T" + slot]));
  }

  function dayTaken(day) {
    return SLOTS.every(function (slot) { return isBusy(day, slot); });
  }

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

  function greet() {
    return isPt()
      ? "Olá Jump2Adventure, queria reservar um kayak."
      : "Hi Jump2Adventure, I'd like to book a kayak.";
  }

  function waHref(text) {
    var q = "?text=" + encodeURIComponent(text);
    return WA ? "https://wa.me/" + WA + q : "https://wa.me/" + q;
  }

  function bookingConfig() {
    var root = document.querySelector("[data-booking]");
    if (!root) return { checkout: "whatsapp", widgetUrl: "" };
    var checkout = (root.getAttribute("data-checkout") || "whatsapp").toLowerCase();
    var signed = root.getAttribute("data-widget-signed-off") === "yes";
    var url = (root.getAttribute("data-widget-url") || "").trim();
    if (checkout === "widget" && signed && /^https:\/\//i.test(url)) {
      return { checkout: "widget", widgetUrl: url };
    }
    return { checkout: "whatsapp", widgetUrl: "" };
  }

  function bookHref(text) {
    var cfg = bookingConfig();
    if (cfg.checkout === "widget") return cfg.widgetUrl;
    return waHref(text);
  }

  function dockLabel() {
    var n = count();
    var priced = pricedTotal();
    if (!n) return isPt() ? "Reservar no WhatsApp" : "Book on WhatsApp";
    var extra = hasAsk()
      ? (priced > 0 ? money(priced) + (isPt() ? " + a confirmar" : " + ask") : (isPt() ? "a confirmar" : "ask"))
      : money(priced);
    return (isPt() ? "Enviar no WhatsApp · " : "Send on WhatsApp · ") + extra;
  }

  function syncDock() {
    if (!reserveDock) return;
    var widget = bookingConfig().checkout === "widget";
    reserveDock.classList.toggle("is-wa", !widget);
    reserveDock.textContent = widget
      ? (isPt() ? "Reservar" : "Book")
      : dockLabel();
    reserveDock.href = widget ? (bookingConfig().widgetUrl || "#book") : "#book";
    if (widget) reserveDock.setAttribute("rel", "noopener");
    else reserveDock.removeAttribute("rel");
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

  function render() {
    var has = cart.length > 0;
    if (emptyEl) emptyEl.hidden = has;
    if (linesEl) linesEl.hidden = !has;
    if (totalEl) {
      totalEl.hidden = !has;
      var priced = pricedTotal();
      if (isPt()) {
        if (hasAsk() && priced > 0) totalEl.textContent = "Cerca de " + money(priced) + " + itens a confirmar";
        else if (hasAsk()) totalEl.textContent = "Preço no WhatsApp";
        else totalEl.textContent = "Cerca de " + money(priced);
      } else {
        if (hasAsk() && priced > 0) totalEl.textContent = "Est. " + money(priced) + " + items to confirm";
        else if (hasAsk()) totalEl.textContent = "Confirm prices in chat";
        else totalEl.textContent = "Est. " + money(priced);
      }
    }
    renderLines();
    markAdds();
    renderDock();
    syncDock();
  }

  function minutes(hhmm) {
    var bits = hhmm.split(":");
    return Number(bits[0]) * 60 + Number(bits[1]);
  }

  function openSlotsForDay(day) {
    var now = lisbonParts(new Date());
    var today = ymd(now);
    var nowMin = minutes(now.hour + ":" + now.minute) + LEAD_MIN;
    return SLOTS.filter(function (slot) {
      if (day === today && minutes(slot) < nowMin) return false;
      if (isBusy(day, slot)) return false;
      return true;
    });
  }

  function firstOpenDay() {
    var now = lisbonParts(new Date());
    var start = new Date(Date.UTC(Number(now.y), Number(now.m) - 1, Number(now.d)));
    for (var i = 0; i < 12; i += 1) {
      var iso = new Date(start.getTime() + i * 86400000).toISOString().slice(0, 10);
      if (openSlotsForDay(iso).length) return iso;
    }
    return "";
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
    if (!dayEl || !dayEl.value || !openSlotsForDay(dayEl.value).length) {
      return {
        el: dayEl,
        msg: isPt()
          ? "Este dia já não tem saída. Escolham outro dia."
          : "This day has no launch left. Pick another day."
      };
    }
    if (!slotEl || !slotEl.value) {
      return {
        el: slotEl,
        msg: isPt() ? "Escolham a manhã ou a tarde." : "Pick morning or afternoon."
      };
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
    var cfg = bookingConfig();
    if (cfg.checkout === "widget") {
      window.location.href = cfg.widgetUrl;
      return true;
    }
    var text = message({
      name: form.name.value.trim(),
      phone: form.phone.value.trim(),
      people: form.people.value,
      day: form.day.value,
      slot: form.slot.value,
      note: form.note.value.trim()
    });
    prepareChat();
    if (window.playOrderChat) window.playOrderChat({ text: text, href: waHref(text), copy: !WA });
    else window.location.href = waHref(text);
    return true;
  }

  function fillDays() {
    if (!dayEl) return;
    var keep = dayEl.value;
    var now = lisbonParts(new Date());
    var start = new Date(Date.UTC(Number(now.y), Number(now.m) - 1, Number(now.d)));
    dayEl.innerHTML = "";
    for (var i = 0; i < 12; i += 1) {
      var next = new Date(start.getTime() + i * 86400000);
      var iso = next.toISOString().slice(0, 10);
      var opt = document.createElement("option");
      opt.value = iso;
      var label = iso === ymd(now)
        ? (isPt() ? "Hoje, " + iso : "Today, " + iso)
        : iso;
      if (dayTaken(iso) || !openSlotsForDay(iso).length) {
        label += isPt() ? " · ocupado" : " · full";
      }
      opt.textContent = label;
      dayEl.appendChild(opt);
    }
    // Land on a day that actually has a slot, so Send always works.
    if (keep && openSlotsForDay(keep).length) {
      dayEl.value = keep;
    } else {
      var open = firstOpenDay();
      if (open) dayEl.value = open;
    }
  }

  function fillSlots() {
    if (!slotEl || !dayEl) return;
    var now = lisbonParts(new Date());
    var today = ymd(now);
    var chosen = dayEl.value;
    var nowMin = minutes(now.hour + ":" + now.minute) + LEAD_MIN;
    var keep = slotEl.value;
    slotEl.innerHTML = "";
    SLOTS.forEach(function (slot) {
      if (chosen === today && minutes(slot) < nowMin) return;
      if (isBusy(chosen, slot)) return;
      var opt = document.createElement("option");
      opt.value = slot;
      opt.textContent = slot;
      slotEl.appendChild(opt);
    });
    if (!slotEl.options.length) {
      var opt = document.createElement("option");
      opt.value = "";
      opt.textContent = dayTaken(chosen)
        ? (isPt()
          ? "Estas saídas parecem ocupadas — outro dia, ou escrevam-nos"
          : "These launches look taken — another day, or write us")
        : (isPt()
          ? "Já passou o horário de hoje — escolha outro dia"
          : "Today's slots have gone — pick another day");
      slotEl.appendChild(opt);
    } else if (keep && !isBusy(chosen, keep)) {
      slotEl.value = keep;
    }
  }

  function message(data) {
    var rows = cart.map(function (item) {
      return "• " + itemName(item) + " × " + item.qty + " — " + lineMoney(item);
    });
    var priced = pricedTotal();
    var pt = isPt();
    var estLine;
    if (hasAsk() && priced > 0) {
      estLine = pt ? "Cerca de " + money(priced) + " + a confirmar" : "Est. " + money(priced) + " + items to confirm";
    } else if (hasAsk()) {
      estLine = pt ? "Por favor confirmem o preço" : "Please confirm prices";
    } else {
      estLine = pt ? "Cerca de " + money(priced) : "Est. " + money(priced);
    }
    var lines = pt ? [
      "Reserva Jump2Adventure — kayak Benagil",
      "",
      "Nome: " + data.name,
      "WhatsApp: " + data.phone,
      "Pessoas: " + data.people,
      "Saída: " + data.day + " " + data.slot,
      data.note ? "Nota: " + data.note : "",
      "",
      rows.join("\n"),
      "",
      estLine,
      "Ainda não paguei. Confirmam, por favor?"
    ] : [
      "Booking for Jump2Adventure — Benagil kayak",
      "",
      "Name: " + data.name,
      "WhatsApp: " + data.phone,
      "People: " + data.people,
      "Launch: " + data.day + " " + data.slot,
      data.note ? "Note: " + data.note : "",
      "",
      rows.join("\n"),
      "",
      estLine,
      "Not paid. Please confirm."
    ];
    return lines.filter(function (line) { return line !== ""; }).join("\n");
  }

  function prepareChat() {
    if (!chatLayer) return;
    var pt = isPt();
    chatLayer.setAttribute("data-name", "Jump2Adventure");
    chatLayer.setAttribute(
      "data-reply",
      pt
        ? "Recebido. Confirmamos o horário e o mar na véspera."
        : "Got it — we confirm the slot and the sea the night before."
    );
    chatLayer.setAttribute("data-continue", pt ? "Abrir WhatsApp" : "Open WhatsApp");
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
    if (dayEl) dayEl.addEventListener("change", function () {
      clearBad();
      fillSlots();
    });
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
      if (bookingConfig().checkout === "widget") return;
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

  window.addEventListener("pp-availability", function (e) {
    markBusy(e.detail && e.detail.busy);
    try {
      fillDays();
      fillSlots();
    } catch (err) {}
  });
  if (window.ppAvailability) markBusy(window.ppAvailability.busy);

  var bookSection = document.getElementById("book");
  if (bookSection && "IntersectionObserver" in window) {
    new IntersectionObserver(function (entries) {
      bookVisible = entries[0].isIntersecting;
      renderDock();
    }, { threshold: 0.12 }).observe(bookSection);
  }

  render();
})();
