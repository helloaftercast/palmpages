(function () {
  const WA = "639621745909";
  const LEAD_MIN = 45;
  const LUNCH = ["11:00", "11:30", "12:00", "12:30", "13:00", "13:30", "14:00", "14:30"];
  const DINNER = ["17:00", "17:30", "18:00", "18:30", "19:00", "19:30", "20:00", "20:30", "21:00"];
  const SLOTS = LUNCH.concat(DINNER);

  const linesEl = document.querySelector("[data-lines]");
  const emptyEl = document.querySelector("[data-empty]");
  const totalEl = document.querySelector("[data-total]");
  const form = document.querySelector("[data-form]");
  const dayEl = form && form.elements.namedItem("day");
  const slotEl = form && form.elements.namedItem("slot");
  const dock = document.querySelector("[data-bag-dock]");
  const reserveDock = document.querySelector("[data-reserve-dock]");
  const cart = [];

  function manilaParts(date) {
    const parts = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Asia/Manila",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      weekday: "short"
    }).formatToParts(date);
    const get = (type) => (parts.find(function (p) { return p.type === type; }) || {}).value;
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
    return "₱" + n.toLocaleString("en-PH");
  }

  function boilInCart() {
    return cart.some(function (item) {
      return item.boil;
    });
  }

  function total() {
    return cart.reduce(function (sum, item) {
      return sum + item.price * item.qty;
    }, 0);
  }

  function count() {
    return cart.reduce(function (sum, item) {
      return sum + item.qty;
    }, 0);
  }

  function add(item) {
    const found = cart.find(function (row) { return row.id === item.id; });
    if (found) found.qty += 1;
    else cart.push({ id: item.id, name: item.name, price: item.price, boil: item.boil, qty: 1 });
    render();
  }

  function setQty(id, qty) {
    const found = cart.find(function (row) { return row.id === id; });
    if (!found) return;
    if (qty < 1) {
      cart.splice(cart.indexOf(found), 1);
    } else {
      found.qty = qty;
    }
    render();
  }

  function markPick(attr, value) {
    document.querySelectorAll("[" + attr + "]").forEach(function (btn) {
      btn.classList.toggle("is-picked", btn.getAttribute(attr) === value);
    });
  }

  function markAdds() {
    document.querySelectorAll("[data-add]").forEach(function (btn) {
      const id = btn.getAttribute("data-id");
      const found = cart.find(function (row) { return row.id === id; });
      btn.classList.toggle("is-added", Boolean(found));
    });
  }

  function renderLines() {
    if (!linesEl) return;
    linesEl.innerHTML = "";
    cart.forEach(function (item) {
      const li = document.createElement("li");
      li.innerHTML =
        "<span>" + item.name + "</span>" +
        "<span class=\"ticket-qty\">" +
          "<button type=\"button\" data-qty=\"" + item.id + "\" data-d=\"-1\" aria-label=\"Remove one\">−</button>" +
          "<b>" + item.qty + "</b>" +
          "<button type=\"button\" data-qty=\"" + item.id + "\" data-d=\"1\" aria-label=\"Add one\">+</button>" +
        "</span>" +
        "<strong>" + money(item.price * item.qty) + "</strong>";
      linesEl.appendChild(li);
    });
  }

  function renderDock() {
    const n = count();
    if (reserveDock) reserveDock.hidden = n > 0;
    if (!dock) return;
    if (n === 0) {
      dock.hidden = true;
      return;
    }
    dock.hidden = false;
    dock.textContent = "Order · " + n + " · " + money(total());
  }

  function render() {
    const has = cart.length > 0;
    if (emptyEl) emptyEl.hidden = has;
    if (linesEl) linesEl.hidden = !has;
    if (totalEl) {
      totalEl.hidden = !has;
      totalEl.textContent = "Est. " + money(total());
    }
    renderLines();
    markAdds();
    renderDock();
  }

  function fillDays() {
    if (!dayEl) return;
    const now = manilaParts(new Date());
    const start = new Date(Date.UTC(Number(now.y), Number(now.m) - 1, Number(now.d)));
    dayEl.innerHTML = "";
    for (let i = 0; i < 8; i += 1) {
      const next = new Date(start.getTime() + i * 86400000);
      const iso = next.toISOString().slice(0, 10);
      const opt = document.createElement("option");
      opt.value = iso;
      opt.textContent = iso === ymd(now) ? "Today, " + iso : iso;
      dayEl.appendChild(opt);
    }
  }

  function minutes(hhmm) {
    const bits = hhmm.split(":");
    return Number(bits[0]) * 60 + Number(bits[1]);
  }

  function fillSlots() {
    if (!slotEl || !dayEl) return;
    const now = manilaParts(new Date());
    const today = ymd(now);
    const chosen = dayEl.value;
    const nowMin = minutes(now.hour + ":" + now.minute) + LEAD_MIN;
    const keep = slotEl.value;
    slotEl.innerHTML = "";
    SLOTS.forEach(function (slot) {
      if (chosen === today && minutes(slot) < nowMin) return;
      const opt = document.createElement("option");
      opt.value = slot;
      opt.textContent = LUNCH.indexOf(slot) === -1 ? slot + " dinner" : slot + " lunch";
      slotEl.appendChild(opt);
    });
    if (!slotEl.options.length) {
      const opt = document.createElement("option");
      opt.value = "";
      opt.textContent = "Kitchen closed for today — pick another day";
      slotEl.appendChild(opt);
    } else if (keep) {
      slotEl.value = keep;
    }
  }

  function message(data) {
    const rows = cart.map(function (item) {
      return "• " + item.name + " × " + item.qty + " — " + money(item.price * item.qty);
    });
    const lines = [
      "Pre-order for Maretes",
      "",
      "Name: " + data.name,
      "WhatsApp: " + data.phone,
      "People: " + data.people,
      "Arrive: " + data.day + " " + data.slot,
      data.sauce ? "Sauce: " + data.sauce : "",
      data.heat ? "Heat: " + data.heat : "",
      data.note ? "Note: " + data.note : "",
      "",
      rows.join("\n"),
      "",
      "Est. " + money(total()),
      "Not paid. Please confirm."
    ];
    return lines.filter(function (line) { return line !== ""; }).join("\n");
  }

  document.addEventListener("click", function (e) {
    const sauceBtn = e.target.closest("[data-sauce]");
    if (sauceBtn && form) {
      form.sauce.value = sauceBtn.getAttribute("data-sauce");
      markPick("data-sauce", form.sauce.value);
      return;
    }
    const heatBtn = e.target.closest("[data-heat]");
    if (heatBtn && form) {
      form.heat.value = heatBtn.getAttribute("data-heat");
      markPick("data-heat", form.heat.value);
      return;
    }
    const addBtn = e.target.closest("[data-add]");
    if (addBtn) {
      add({
        id: addBtn.getAttribute("data-id"),
        name: addBtn.getAttribute("data-name"),
        price: Number(addBtn.getAttribute("data-price")),
        boil: addBtn.getAttribute("data-boil") === "1"
      });
      return;
    }
    const qtyBtn = e.target.closest("[data-qty]");
    if (qtyBtn) {
      const found = cart.find(function (row) { return row.id === qtyBtn.getAttribute("data-qty"); });
      if (found) setQty(found.id, found.qty + Number(qtyBtn.getAttribute("data-d")));
    }
  });

  if (form) {
    try {
      fillDays();
      fillSlots();
    } catch (err) {}
    dayEl.addEventListener("change", fillSlots);
    form.sauce.addEventListener("change", function () {
      markPick("data-sauce", form.sauce.value);
    });
    form.heat.addEventListener("change", function () {
      markPick("data-heat", form.heat.value);
    });
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!cart.length) {
        document.getElementById("ticket").scrollIntoView({ behavior: "smooth", block: "start" });
        return;
      }
      if (!slotEl.value) return;
      if (boilInCart() && (!form.sauce.value || !form.heat.value)) {
        form.sauce.required = true;
        form.heat.required = true;
        form.reportValidity();
        return;
      }
      const text = message({
        name: form.name.value.trim(),
        phone: form.phone.value.trim(),
        people: form.people.value,
        day: form.day.value,
        slot: form.slot.value,
        sauce: form.sauce.value,
        heat: form.heat.value,
        note: form.note.value.trim()
      });
      var href = "https://wa.me/" + WA + "?text=" + encodeURIComponent(text);
      if (window.playOrderChat) window.playOrderChat({ text: text, href: href });
      else window.location.href = href;
    });
  }

  render();
})();
