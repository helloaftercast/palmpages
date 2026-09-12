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
  var dock = document.querySelector("[data-bag-dock]");
  var reserveDock = document.querySelector("[data-reserve-dock]");
  var chatLayer = document.querySelector("[data-order-chat]");
  var cart = [];

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

  function syncDock() {
    if (!reserveDock) return;
    reserveDock.href = waHref(greet());
    reserveDock.textContent = isPt() ? "WhatsApp para reservar" : "WhatsApp to book";
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
    var n = count();
    if (reserveDock) reserveDock.hidden = n > 0;
    if (!dock) return;
    if (n === 0) {
      dock.hidden = true;
      return;
    }
    dock.hidden = false;
    var priced = pricedTotal();
    var label;
    if (isPt()) {
      label = hasAsk()
        ? (priced > 0 ? "Reserva · " + n + " · " + money(priced) + " + a confirmar" : "Reserva · " + n + " · a confirmar")
        : "Reserva · " + n + " · " + money(priced);
    } else {
      label = hasAsk()
        ? (priced > 0 ? "Book · " + n + " · " + money(priced) + " + ask" : "Book · " + n + " · ask")
        : "Book · " + n + " · " + money(priced);
    }
    dock.textContent = label;
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

  function minutes(hhmm) {
    var bits = hhmm.split(":");
    return Number(bits[0]) * 60 + Number(bits[1]);
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
      var opt = document.createElement("option");
      opt.value = slot;
      opt.textContent = slot;
      slotEl.appendChild(opt);
    });
    if (!slotEl.options.length) {
      var opt = document.createElement("option");
      opt.value = "";
      opt.textContent = isPt()
        ? "Já passou o horário de hoje — escolha outro dia"
        : "Today's slots have gone — pick another day";
      slotEl.appendChild(opt);
    } else if (keep) {
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
    if (dayEl) dayEl.addEventListener("change", fillSlots);
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!cart.length) {
        document.getElementById("book").scrollIntoView({ behavior: "smooth", block: "start" });
        return;
      }
      if (!slotEl.value) return;
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
    });
  }

  window.addEventListener("pp-lang", function () {
    try {
      fillDays();
      fillSlots();
    } catch (err) {}
    render();
  });

  render();
})();
