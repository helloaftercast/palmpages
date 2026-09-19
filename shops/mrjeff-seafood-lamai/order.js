(function () {
  var WA = "66620454983";
  var LEAD_MIN = 45;
  var SLOTS = [
    "13:00", "13:30", "14:00", "14:30", "15:00", "15:30",
    "16:00", "16:30", "17:00", "17:30", "18:00", "18:30",
    "19:00", "19:30", "20:00", "20:30", "21:00", "21:30", "22:00"
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
      hour12: false
    }).formatToParts(date);
    var get = function (type) {
      return (parts.find(function (p) { return p.type === type; }) || {}).value;
    };
    return { y: get("year"), m: get("month"), d: get("day"), hour: get("hour"), minute: get("minute") };
  }

  function ymd(parts) {
    return parts.y + "-" + parts.m + "-" + parts.d;
  }

  function byWt() {
    return isTh() ? "ตามน้ำหนัก" : "by wt";
  }

  function askWord() {
    return isTh() ? "สอบถาม" : "ask";
  }

  function money(n) {
    return "฿" + n.toLocaleString("en-TH");
  }

  function lineLabel(item) {
    if (item.kind === "cook") return "—";
    if (!item.price || item.price === 0) return item.ask ? askWord() : byWt();
    return money(item.price * item.qty);
  }

  function count() {
    return cart.reduce(function (sum, item) { return sum + item.qty; }, 0);
  }

  function itemName(item) {
    return isTh() ? (item.nameTh || item.nameEn) : (item.nameEn || item.nameTh);
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

  function greet() {
    return isTh() ? "สวัสดีครับ/ค่ะ ร้าน Mr.Jeff ขอจองโต๊ะหน่อย" : "Hi Mr. Jeff, I'd like a table.";
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
      if (ch === "line") {
        reserveDock.href = "https://line.me/R/msg/text/?" + encodeURIComponent(greet());
        reserveDock.textContent = isTh() ? "ทัก LINE จองโต๊ะ" : "LINE to reserve";
        reserveDock.classList.add("is-line");
        reserveDock.classList.remove("is-wa");
      } else {
        reserveDock.href = "https://wa.me/" + WA + "?text=" + encodeURIComponent(greet());
        reserveDock.textContent = isTh() ? "ทัก WhatsApp จองโต๊ะ" : "Chat on WhatsApp";
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
      price: item.price,
      ask: item.ask,
      kind: item.kind,
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
        "<strong>" + lineLabel(item) + "</strong>";
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
    dock.textContent = (isTh() ? "ออเดอร์ · " : "Order · ") + n + " · " + byWt();
  }

  function render() {
    var has = cart.length > 0;
    if (emptyEl) emptyEl.hidden = has;
    if (linesEl) linesEl.hidden = !has;
    if (totalEl) {
      totalEl.hidden = !has;
      totalEl.textContent = isTh() ? "ครัวยืนยันน้ำหนักและราคา" : "Weight & price confirmed by kitchen";
    }
    renderLines();
    markAdds();
    renderDock();
    syncChannelUi();
  }

  function fillDays() {
    if (!dayEl) return;
    var now = bangkokParts(new Date());
    var start = new Date(Date.UTC(Number(now.y), Number(now.m) - 1, Number(now.d)));
    dayEl.innerHTML = "";
    for (var i = 0; i < 8; i += 1) {
      var next = new Date(start.getTime() + i * 86400000);
      var iso = next.toISOString().slice(0, 10);
      var opt = document.createElement("option");
      opt.value = iso;
      opt.textContent = iso === ymd(now) ? (isTh() ? "วันนี้, " : "Today, ") + iso : iso;
      dayEl.appendChild(opt);
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
        ? "ครัวใกล้ปิดแล้ว — เลือกวันอื่นนะ"
        : "Kitchen closing soon — pick another day";
      slotEl.appendChild(opt);
    } else if (keep) {
      slotEl.value = keep;
    }
  }

  function message(data) {
    var rows = cart.map(function (item) {
      return "• " + itemName(item) + " × " + item.qty + " — " + lineLabel(item);
    });
    var th = isTh();
    var chLabel = data.channel === "line" ? "LINE" : "WhatsApp";
    var lines = th ? [
      "สั่งล่วงหน้า ร้าน Mr.Jeff ละไม",
      "",
      "ชื่อ: " + data.name,
      chLabel + ": " + data.phone,
      "จำนวนคน: " + data.people,
      "เวลามาถึง: " + data.day + " " + data.slot,
      data.note ? "หมายเหตุ: " + data.note : "",
      "",
      rows.join("\n"),
      "",
      "ครัวยืนยันน้ำหนักและราคา",
      "ยังไม่ชำระ — รับเงินสดเท่านั้น ขอบคุณครับ/ค่ะ"
    ] : [
      "Pre-order for Mr.Jeff, Lamai",
      "",
      "Name: " + data.name,
      chLabel + ": " + data.phone,
      "People: " + data.people,
      "Arrive: " + data.day + " " + data.slot,
      data.note ? "Note: " + data.note : "",
      "",
      rows.join("\n"),
      "",
      "Weight & price confirmed by kitchen.",
      "Not paid — cash only. Khob khun!"
    ];
    return lines.filter(function (line) { return line !== ""; }).join("\n");
  }

  function prepareChat(ch) {
    if (!chatLayer) return;
    var th = isTh();
    chatLayer.setAttribute("data-name", "Mr.Jeff");
    if (ch === "line") {
      chatLayer.setAttribute(
        "data-reply",
        th
          ? "รับแล้วครับ เดี๋ยวชั่งของสดแล้วยืนยันราคาให้ — ข้อความคัดลอกไว้แล้ว วางใน LINE ได้เลย"
          : "Got it — we'll weigh the catch and confirm the price. Message copied; paste it in LINE."
      );
      chatLayer.setAttribute("data-continue", th ? "เปิด LINE" : "Open LINE");
    } else {
      chatLayer.setAttribute(
        "data-reply",
        th
          ? "รับแล้วครับ เดี๋ยวชั่งของสดแล้วยืนยันราคาให้ เจอกันครับ"
          : "Got it — we'll weigh the catch and confirm the price. See you soon."
      );
      chatLayer.setAttribute("data-continue", th ? "เปิด WhatsApp" : "Open WhatsApp");
    }
    chatLayer.classList.toggle("is-line", ch === "line");
    chatLayer.classList.toggle("is-wa", ch !== "line");
  }

  document.addEventListener("click", function (e) {
    var addBtn = e.target.closest("[data-add]");
    if (addBtn) {
      var id = addBtn.getAttribute("data-id");
      add({
        id: id,
        nameEn: addBtn.getAttribute("data-name-en") || addBtn.getAttribute("data-name"),
        nameTh: addBtn.getAttribute("data-name-th") || addBtn.getAttribute("data-name"),
        price: Number(addBtn.getAttribute("data-price")),
        ask: addBtn.getAttribute("data-ask") === "1" || id.indexOf("side-") === 0,
        kind: id.indexOf("cook-") === 0 ? "cook" : "catch"
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
        document.getElementById("menu").scrollIntoView({ behavior: "smooth", block: "start" });
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
