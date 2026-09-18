(function () {
  var WA = "529982426567";
  var LEAD_MIN = 45;
  var SLOTS = [
    "11:00", "11:30", "12:00", "12:30", "13:00", "13:30",
    "14:00", "14:30", "15:00", "15:30", "16:00", "16:30",
    "17:00", "17:30", "18:00", "18:30", "19:00"
  ];

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

  function isEs() {
    return lang() === "es";
  }

  function cancunParts(date) {
    var parts = new Intl.DateTimeFormat("en-GB", {
      timeZone: "America/Cancun",
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
    if (!n || n === 0) return isEs() ? "consultar" : "ask";
    return "MX$" + n.toLocaleString("en-US");
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
    return isEs() ? (item.nameEs || item.nameEn) : (item.nameEn || item.nameEs);
  }

  function greet() {
    return isEs()
      ? "Hola Doña Yola, quiero reservar una mesa."
      : "Hi Doña Yola, I'd like a table.";
  }

  function syncChannelUi() {
    var submit = form && form.querySelector('[type="submit"]');
    if (submit) {
      submit.classList.add("btn-wa");
      submit.classList.remove("btn-line");
      submit.textContent = isEs() ? "Enviar por WhatsApp" : "Send on WhatsApp";
    }
    if (reserveDock) {
      reserveDock.href = "https://wa.me/" + WA + "?text=" + encodeURIComponent(greet());
      reserveDock.textContent = isEs() ? "Reservar por WhatsApp" : "WhatsApp to reserve";
      reserveDock.classList.add("is-wa");
      reserveDock.classList.remove("is-line");
    }
    if (chatLayer) {
      chatLayer.classList.add("is-wa");
      chatLayer.classList.remove("is-line");
    }
  }

  function add(item) {
    var found = cart.find(function (row) { return row.id === item.id; });
    if (found) found.qty += 1;
    else cart.push({
      id: item.id,
      nameEn: item.nameEn,
      nameEs: item.nameEs,
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
      btn.classList.toggle("is-added", cart.some(function (row) { return row.id === id; }));
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
    var head = isEs() ? "Pedido · " : "Order · ";
    var ask = isEs() ? "consultar" : "ask";
    dock.textContent = hasAsk()
      ? (priced > 0 ? head + n + " · " + money(priced) + " + " + ask : head + n + " · " + ask)
      : head + n + " · " + money(priced);
  }

  function render() {
    var has = cart.length > 0;
    if (emptyEl) emptyEl.hidden = has;
    if (linesEl) linesEl.hidden = !has;
    if (totalEl) {
      totalEl.hidden = !has;
      var priced = pricedTotal();
      if (isEs()) {
        if (hasAsk() && priced > 0) totalEl.textContent = "Aprox. " + money(priced) + " + platillos por confirmar";
        else if (hasAsk()) totalEl.textContent = "Confirmamos el precio por chat";
        else totalEl.textContent = "Aprox. " + money(priced);
      } else {
        if (hasAsk() && priced > 0) totalEl.textContent = "Est. " + money(priced) + " + items to confirm in chat";
        else if (hasAsk()) totalEl.textContent = "Confirm prices in chat";
        else totalEl.textContent = "Est. " + money(priced);
      }
    }
    renderLines();
    markAdds();
    renderDock();
    syncChannelUi();
  }

  function fillDays() {
    if (!dayEl) return;
    var now = cancunParts(new Date());
    var start = new Date(Date.UTC(Number(now.y), Number(now.m) - 1, Number(now.d)));
    dayEl.innerHTML = "";
    for (var i = 0; i < 21; i += 1) {
      var next = new Date(start.getTime() + i * 86400000);
      var dow = next.getUTCDay();
      if (dow === 0 || dow === 1) continue;
      var iso = next.toISOString().slice(0, 10);
      var opt = document.createElement("option");
      opt.value = iso;
      opt.textContent = iso === ymd(now) ? (isEs() ? "Hoy, " : "Today, ") + iso : iso;
      dayEl.appendChild(opt);
      if (dayEl.options.length >= 10) break;
    }
  }

  function minutes(hhmm) {
    var bits = hhmm.split(":");
    return Number(bits[0]) * 60 + Number(bits[1]);
  }

  function fillSlots() {
    if (!slotEl || !dayEl) return;
    var now = cancunParts(new Date());
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
      opt.textContent = isEs()
        ? "Ya es tarde para hoy — cerramos a las 19:30"
        : "Too late to pre-order — we close at 19:30";
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
    var es = isEs();
    var estLine;
    if (hasAsk() && priced > 0) {
      estLine = es ? "Aprox. " + money(priced) + " + platillos por confirmar" : "Est. " + money(priced) + " + items to confirm";
    } else if (hasAsk()) {
      estLine = es ? "Por favor confirmen el precio" : "Please confirm prices";
    } else {
      estLine = es ? "Aprox. " + money(priced) : "Est. " + money(priced);
    }
    var lines = es ? [
      "Pedido anticipado — Doña Yola Mexican Home Cuisine",
      "",
      "Nombre: " + data.name,
      "WhatsApp: " + data.phone,
      "Personas: " + data.people,
      "Llegada: " + data.day + " " + data.slot,
      data.note ? "Nota: " + data.note : "",
      "",
      rows.join("\n"),
      "",
      estLine,
      "Aún no pagado. Por favor confirmen. Pagamos en efectivo al llegar."
    ] : [
      "Pre-order for Doña Yola Mexican Home Cuisine",
      "",
      "Name: " + data.name,
      "WhatsApp: " + data.phone,
      "People: " + data.people,
      "Arrive: " + data.day + " " + data.slot,
      data.note ? "Note: " + data.note : "",
      "",
      rows.join("\n"),
      "",
      estLine,
      "Not paid. Please confirm. We'll pay cash on arrival."
    ];
    return lines.filter(function (line) { return line !== ""; }).join("\n");
  }

  function prepareChat() {
    if (!chatLayer) return;
    var es = isEs();
    chatLayer.setAttribute("data-name", "Doña Yola");
    chatLayer.setAttribute(
      "data-reply",
      es
        ? "Listo — confirmamos mesa y precios. Nos vemos en Doña Yola."
        : "Got it — we'll confirm your table and any ask-price items. See you at Doña Yola."
    );
    chatLayer.setAttribute("data-continue", es ? "Abrir WhatsApp" : "Open WhatsApp");
    chatLayer.classList.add("is-wa");
    chatLayer.classList.remove("is-line");
  }

  document.addEventListener("click", function (e) {
    var addBtn = e.target.closest("[data-add]");
    if (addBtn) {
      add({
        id: addBtn.getAttribute("data-id"),
        nameEn: addBtn.getAttribute("data-name-en") || addBtn.getAttribute("data-name"),
        nameEs: addBtn.getAttribute("data-name-es") || addBtn.getAttribute("data-name"),
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
        document.getElementById("ticket").scrollIntoView({ behavior: "smooth", block: "start" });
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
      var href = "https://wa.me/" + WA + "?text=" + encodeURIComponent(text);
      prepareChat();
      if (window.playOrderChat) window.playOrderChat({ text: text, href: href, copy: false });
      else window.location.href = href;
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
