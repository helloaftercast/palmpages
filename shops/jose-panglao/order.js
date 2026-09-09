(function () {
  const WA = "639985586501";
  const LEAD_MIN = 45;
  const SLOTS = ["11:30", "12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30", "18:00", "18:30", "19:00", "19:30", "20:00", "20:30", "21:00", "21:30"];

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
      hour12: false
    }).formatToParts(date);
    const get = (type) => (parts.find(function (p) { return p.type === type; }) || {}).value;
    return { y: get("year"), m: get("month"), d: get("day"), hour: get("hour"), minute: get("minute") };
  }

  function ymd(parts) {
    return parts.y + "-" + parts.m + "-" + parts.d;
  }

  function money(n) {
    return "₱" + n.toLocaleString("en-PH");
  }

  function total() {
    return cart.reduce(function (sum, item) { return sum + item.price * item.qty; }, 0);
  }

  function count() {
    return cart.reduce(function (sum, item) { return sum + item.qty; }, 0);
  }

  function hasPaluto() {
    return cart.some(function (item) { return item.id.indexOf("pal-") === 0; });
  }

  function add(item) {
    const found = cart.find(function (row) { return row.id === item.id; });
    if (found) found.qty += 1;
    else cart.push({ id: item.id, name: item.name, price: item.price, qty: 1 });
    render();
  }

  function setQty(id, qty) {
    const found = cart.find(function (row) { return row.id === id; });
    if (!found) return;
    if (qty < 1) cart.splice(cart.indexOf(found), 1);
    else found.qty = qty;
    render();
  }

  function markAdds() {
    document.querySelectorAll("[data-add]").forEach(function (btn) {
      const id = btn.getAttribute("data-id");
      btn.classList.toggle("is-added", cart.some(function (row) { return row.id === id; }));
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
      totalEl.textContent = "Est. " + money(total()) + " — kitchen confirms exact weight";
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
      opt.textContent = slot;
      slotEl.appendChild(opt);
    });
    if (!slotEl.options.length) {
      const opt = document.createElement("option");
      opt.value = "";
      opt.textContent = "Kitchen closing soon — pick another day";
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
      "Pre-order for Jose' Panglao",
      "",
      "Name: " + data.name,
      "Number: " + data.phone,
      "People: " + data.people,
      "Arrive: " + data.day + " " + data.slot,
      hasPaluto() ? "Cook the catch: " + data.style : "",
      data.note ? "Note: " + data.note : "",
      "",
      rows.join("\n"),
      "",
      "Est. " + money(total()) + " — please weigh and confirm.",
      "Not paid. Salamat!"
    ];
    return lines.filter(function (line) { return line !== ""; }).join("\n");
  }

  document.addEventListener("click", function (e) {
    const addBtn = e.target.closest("[data-add]");
    if (addBtn) {
      add({
        id: addBtn.getAttribute("data-id"),
        name: addBtn.getAttribute("data-name"),
        price: Number(addBtn.getAttribute("data-price"))
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
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!cart.length) {
        document.getElementById("menu").scrollIntoView({ behavior: "smooth", block: "start" });
        return;
      }
      if (!slotEl.value) return;
      const text = message({
        name: form.name.value.trim(),
        phone: form.phone.value.trim(),
        people: form.people.value,
        style: form.style.value,
        day: form.day.value,
        slot: form.slot.value,
        note: form.note.value.trim()
      });
      var href = "https://wa.me/" + WA + "?text=" + encodeURIComponent(text);
      if (window.playOrderChat) window.playOrderChat({ text: text, href: href });
      else window.location.href = href;
    });
  }

  render();
})();
