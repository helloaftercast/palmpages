(function () {
  var WA = "66897350605";
  var LEAD_MIN = 45;
  var SLOTS = [
    "08:00", "08:30", "09:00", "09:30", "10:00", "10:30",
    "11:00", "11:30", "12:00", "12:30", "13:00", "13:30",
    "17:00", "17:30", "18:00", "18:30", "19:00", "19:30",
    "20:00", "20:30"
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
  var channelTouched = false;

  function lang() {
    return (window.getPpLang && window.getPpLang()) || document.documentElement.getAttribute("data-lang") || "en";
  }

  function isTh() {
    return lang() === "th";
  }

  function bangkokParts(date) {
    var parts = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Asia/Bangkok",
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
    if (!n || n === 0) return isTh() ? "สอบถาม" : "ask";
    return "฿" + n.toLocaleString("en-TH");
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
    return isTh() ? (item.nameTh || item.nameEn || item.name) : (item.nameEn || item.nameTh || item.name);
  }

  function channel() {
    if (!form) return isTh() ? "line" : "whatsapp";
    var picked = form.querySelector('input[name="channel"]:checked');
    return picked ? picked.value : (isTh() ? "line" : "whatsapp");
  }

  function setDefaultChannel() {
    if (!form || channelTouched) return;
    var want = isTh() ? "line" : "whatsapp";
    var radio = form.querySelector('input[name="channel"][value="' + want + '"]');
    if (radio) radio.checked = true;
    syncChannelUi();
  }

  function syncChannelUi() {
    var ch = channel();
    var submit = form && form.querySelector('[type="submit"]');
    if (submit) {
      submit.classList.toggle("btn-wa", ch === "whatsapp");
      submit.classList.toggle("btn-line", ch === "line");
      submit.textContent = ch === "line"
        ? (isTh() ? "ส่งทาง LINE" : "Send on LINE")
        : (isTh() ? "ส่งทาง WhatsApp" : "Send on WhatsApp");
    }
    if (reserveDock) {
      var greet = isTh()
        ? "สวัสดีครับ/ค่ะ ร้านต้นมะยม ขอจองโต๊ะหน่อย"
        : "Hello Ton Ma Yom, I'd like a table please.";
      if (ch === "line" || (ch !== "whatsapp" && isTh())) {
        reserveDock.href = "https://line.me/R/msg/text/?" + encodeURIComponent(greet);
        reserveDock.textContent = isTh() ? "จองผ่าน LINE" : "LINE to reserve";
        reserveDock.classList.add("is-line");
        reserveDock.classList.remove("is-wa");
      } else {
        reserveDock.href = "https://wa.me/" + WA + "?text=" + encodeURIComponent(greet);
        reserveDock.textContent = isTh() ? "จองผ่าน WhatsApp" : "WhatsApp to reserve";
        reserveDock.classList.add("is-wa");
        reserveDock.classList.remove("is-line");
      }
    }
    if (chatLayer) {
      chatLayer.classList.toggle("is-line", ch === "line");
      chatLayer.classList.toggle("is-wa", ch === "whatsapp");
    }
  }

  function add(item) {
    var found = cart.find(function (row) { return row.id === item.id; });
    if (found) found.qty += 1;
    else cart.push({
      id: item.id,
      nameEn: item.nameEn,
      nameTh: item.nameTh,
      name: item.nameEn || item.nameTh,
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
    if (isTh()) {
      label = hasAsk()
        ? (priced > 0 ? "ออเดอร์ · " + n + " · " + money(priced) + " + สอบถาม" : "ออเดอร์ · " + n + " · สอบถาม")
        : "ออเดอร์ · " + n + " · " + money(priced);
    } else {
      label = hasAsk()
        ? (priced > 0 ? "Order · " + n + " · " + money(priced) + " + ask" : "Order · " + n + " · ask")
        : "Order · " + n + " · " + money(priced);
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
      if (isTh()) {
        if (hasAsk() && priced > 0) totalEl.textContent = "ประมาณ " + money(priced) + " + รายการที่ต้องยืนยัน";
        else if (hasAsk()) totalEl.textContent = "ยืนยันราคาทางแชท";
        else totalEl.textContent = "ประมาณ " + money(priced);
      } else {
        if (hasAsk() && priced > 0) totalEl.textContent = "Est. " + money(priced) + " + items to confirm";
        else if (hasAsk()) totalEl.textContent = "Confirm prices in chat";
        else totalEl.textContent = "Est. " + money(priced);
      }
    }
    renderLines();
    markAdds();
    renderDock();
    syncChannelUi();
  }

  function isMonday(iso) {
    var bits = iso.split("-");
    var utc = new Date(Date.UTC(Number(bits[0]), Number(bits[1]) - 1, Number(bits[2]), 12));
    var parts = bangkokParts(utc);
    return parts.weekday === "Mon";
  }

  function fillDays() {
    if (!dayEl) return;
    var now = bangkokParts(new Date());
    var start = new Date(Date.UTC(Number(now.y), Number(now.m) - 1, Number(now.d)));
    dayEl.innerHTML = "";
    var added = 0;
    for (var i = 0; added < 10 && i < 20; i += 1) {
      var next = new Date(start.getTime() + i * 86400000);
      var iso = next.toISOString().slice(0, 10);
      if (isMonday(iso)) continue;
      var opt = document.createElement("option");
      opt.value = iso;
      if (iso === ymd(now)) {
        opt.textContent = isTh() ? "วันนี้, " + iso : "Today, " + iso;
      } else {
        opt.textContent = iso;
      }
      dayEl.appendChild(opt);
      added += 1;
    }
  }

  function minutes(hhmm) {
    var bits = hhmm.split(":");
    return Number(bits[0]) * 60 + Number(bits[1]);
  }

  function fillSlots() {
    if (!slotEl || !dayEl) return;
    var now = bangkokParts(new Date());
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
      opt.textContent = isTh()
        ? "สายเกินไปสำหรับรอบนี้ — ครัวปิด 21:00"
        : "Too late for this service — kitchen closes 21:00";
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
    var th = isTh();
    var estLine;
    if (hasAsk() && priced > 0) {
      estLine = th ? "ประมาณ " + money(priced) + " + รายการที่ต้องยืนยัน" : "Est. " + money(priced) + " + items to confirm";
    } else if (hasAsk()) {
      estLine = th ? "รบกวนยืนยันราคานะครับ/ค่ะ" : "Please confirm prices";
    } else {
      estLine = th ? "ประมาณ " + money(priced) : "Est. " + money(priced);
    }
    var chLabel = data.channel === "line" ? "LINE" : "WhatsApp";
    var lines = th ? [
      "จองล่วงหน้า ร้านต้นมะยม อ่าวนาง",
      "",
      "ชื่อ: " + data.name,
      chLabel + ": " + data.phone,
      "จำนวนคน: " + data.people,
      "เวลามาถึง: " + data.day + " " + data.slot,
      data.note ? "หมายเหตุ: " + data.note : "",
      "",
      rows.join("\n"),
      "",
      estLine,
      "ยังไม่ชำระเงิน รบกวนยืนยันด้วยนะครับ/ค่ะ"
    ] : [
      "Pre-order for Ton Ma Yom, Ao Nang",
      "",
      "Name: " + data.name,
      chLabel + ": " + data.phone,
      "People: " + data.people,
      "Arrive: " + data.day + " " + data.slot,
      data.note ? "Note: " + data.note : "",
      "",
      rows.join("\n"),
      "",
      estLine,
      "Not paid. Please confirm."
    ];
    return lines.filter(function (line) { return line !== ""; }).join("\n");
  }

  function prepareChat(ch) {
    if (!chatLayer) return;
    var th = isTh();
    chatLayer.setAttribute("data-name", th ? "ต้นมะยม" : "Ton Ma Yom");
    if (ch === "line") {
      chatLayer.setAttribute(
        "data-reply",
        th
          ? "รับข้อความแล้วค่ะ เดี๋ยวยืนยันราคาและโต๊ะให้ — ข้อความคัดลอกไว้แล้ว วางใน LINE ได้เลย"
          : "Got it — we'll confirm prices and your table. Message copied; paste it in LINE."
      );
      chatLayer.setAttribute("data-continue", th ? "เปิด LINE" : "Open LINE");
    } else {
      chatLayer.setAttribute(
        "data-reply",
        th
          ? "รับข้อความแล้วค่ะ เดี๋ยวยืนยันราคาและโต๊ะในสวนให้นะ"
          : "Got it — we'll confirm prices and keep a garden table ready."
      );
      chatLayer.setAttribute("data-continue", th ? "เปิด WhatsApp" : "Open WhatsApp");
    }
    chatLayer.classList.toggle("is-line", ch === "line");
    chatLayer.classList.toggle("is-wa", ch !== "line");
  }

  document.addEventListener("click", function (e) {
    var addBtn = e.target.closest("[data-add]");
    if (addBtn) {
      add({
        id: addBtn.getAttribute("data-id"),
        nameEn: addBtn.getAttribute("data-name-en") || addBtn.getAttribute("data-name"),
        nameTh: addBtn.getAttribute("data-name-th") || addBtn.getAttribute("data-name"),
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
    form.querySelectorAll('input[name="channel"]').forEach(function (input) {
      input.addEventListener("change", function () {
        channelTouched = true;
        syncChannelUi();
      });
    });
    try {
      fillDays();
      fillSlots();
      setDefaultChannel();
    } catch (err) {}
    if (dayEl) dayEl.addEventListener("change", fillSlots);
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!cart.length) {
        document.getElementById("ticket").scrollIntoView({ behavior: "smooth", block: "start" });
        return;
      }
      if (!slotEl.value) return;
      var ch = channel();
      var text = message({
        name: form.name.value.trim(),
        phone: form.phone.value.trim(),
        people: form.people.value,
        day: form.day.value,
        slot: form.slot.value,
        note: form.note.value.trim(),
        channel: ch
      });
      var href;
      var copy = false;
      if (ch === "line") {
        href = "https://line.me/R/msg/text/?" + encodeURIComponent(text);
        copy = true;
      } else {
        href = "https://wa.me/" + WA + "?text=" + encodeURIComponent(text);
      }
      prepareChat(ch);
      if (window.playOrderChat) window.playOrderChat({ text: text, href: href, copy: copy });
      else window.location.href = href;
    });
  }

  window.addEventListener("pp-lang", function () {
    channelTouched = false;
    try {
      fillDays();
      fillSlots();
      setDefaultChannel();
    } catch (err) {}
    render();
  });

  render();
})();
