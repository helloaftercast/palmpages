(function () {
  var LEAD_MIN = 90;
  var SLOTS = [
    "11:00", "11:30", "12:00", "12:30", "13:00", "13:30",
    "14:00", "14:30", "15:00", "15:30", "16:00", "16:30",
    "17:00", "17:30", "18:00", "18:30", "19:00", "19:30",
    "20:00", "20:30"
  ];

  var form = document.querySelector("[data-form]");
  var dayEl = form && form.elements.namedItem("day");
  var slotEl = form && form.elements.namedItem("slot");
  var warnEl = document.querySelector("[data-warn]");
  var reserveDock = document.querySelector("[data-reserve-dock]");
  var chatLayer = document.querySelector("[data-order-chat]");

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

  function greet() {
    return isTh()
      ? "สวัสดีครับ/ค่ะ ร้านตู้กับข้าว ขอจองโต๊ะหน่อย"
      : "Hello Tu Kab Khao, I'd like a table please.";
  }

  function lineHref(text) {
    return "https://line.me/R/msg/text/?" + encodeURIComponent(text || greet());
  }

  function syncDock() {
    if (!reserveDock) return;
    reserveDock.href = lineHref(greet());
    reserveDock.textContent = isTh() ? "จองผ่าน LINE" : "LINE to reserve";
    reserveDock.classList.add("is-line");
    reserveDock.classList.remove("is-wa");
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
    if (!form.name.value.trim()) {
      return { el: form.name, msg: isTh() ? "เขียนชื่อของคุณ" : "Write your name." };
    }
    var digits = String(form.phone.value || "").replace(/\D/g, "");
    if (digits.length < 8) {
      return {
        el: form.phone,
        msg: isTh() ? "เขียนเบอร์ที่ติดต่อได้" : "Write a number we can reach."
      };
    }
    if (!form.people.value || Number(form.people.value) < 1) {
      return { el: form.people, msg: isTh() ? "บอกจำนวนคน" : "How many people?" };
    }
    if (!dayEl || !dayEl.value) {
      return { el: dayEl, msg: isTh() ? "เลือกวัน" : "Pick a day." };
    }
    if (!slotEl || !slotEl.value) {
      return { el: slotEl, msg: isTh() ? "เลือกเวลา" : "Pick a time." };
    }
    return null;
  }

  function fillDays() {
    if (!dayEl) return;
    var now = bangkokParts(new Date());
    var start = new Date(Date.UTC(Number(now.y), Number(now.m) - 1, Number(now.d)));
    dayEl.innerHTML = "";
    for (var i = 0; i < 10; i += 1) {
      var next = new Date(start.getTime() + i * 86400000);
      var iso = next.toISOString().slice(0, 10);
      var opt = document.createElement("option");
      opt.value = iso;
      opt.textContent = iso === ymd(now)
        ? (isTh() ? "วันนี้, " + iso : "Today, " + iso)
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
        ? "สายเกินไปสำหรับวันนี้ — เปิดถึง 21:00"
        : "Too late for today — open until 21:00";
      slotEl.appendChild(opt);
    } else if (keep) {
      slotEl.value = keep;
    }
  }

  function message(data) {
    var th = isTh();
    var lines = th ? [
      "จองโต๊ะ ร้านตู้กับข้าว ถนนพังงา เมืองเก่าภูเก็ต",
      "",
      "ชื่อ: " + data.name,
      "ติดต่อ: " + data.phone,
      "จำนวนคน: " + data.people,
      "เวลามาถึง: " + data.day + " " + data.slot,
      data.note ? "หมายเหตุ: " + data.note : "",
      "",
      "ขอจองโต๊ะเท่านั้น อาหารสั่งที่ร้าน",
      "ยังไม่ชำระเงิน รบกวนยืนยันโต๊ะด้วยนะครับ/ค่ะ"
    ] : [
      "Table for Tu Kab Khao, Phang Nga Road, Phuket Old Town",
      "",
      "Name: " + data.name,
      "Contact: " + data.phone,
      "People: " + data.people,
      "Arrive: " + data.day + " " + data.slot,
      data.note ? "Note: " + data.note : "",
      "",
      "Table only — we order food when we sit down.",
      "Not paid. Please confirm the table."
    ];
    return lines.filter(function (line) { return line !== ""; }).join("\n");
  }

  function prepareChat() {
    if (!chatLayer) return;
    var th = isTh();
    chatLayer.setAttribute("data-name", th ? "ตู้กับข้าว" : "Tu Kab Khao");
    chatLayer.setAttribute(
      "data-reply",
      th
        ? "รับข้อความแล้วค่ะ เดี๋ยวยืนยันโต๊ะให้ — ข้อความคัดลอกไว้แล้ว วางใน LINE ได้เลย"
        : "Got it — they will confirm the table. Message copied; paste it in LINE."
    );
    chatLayer.setAttribute("data-continue", th ? "เปิด LINE" : "Open LINE");
    chatLayer.classList.add("is-line");
    chatLayer.classList.remove("is-wa");
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
    var href = lineHref(text);
    prepareChat();
    if (window.playOrderChat) window.playOrderChat({ text: text, href: href, copy: true });
    else window.location.href = href;
    return true;
  }

  if (form) {
    try {
      fillDays();
      fillSlots();
    } catch (err) {}
    if (dayEl) dayEl.addEventListener("change", function () { clearBad(); fillSlots(); });
    if (slotEl) slotEl.addEventListener("change", clearBad);
    ["name", "phone", "people"].forEach(function (field) {
      if (form[field]) form[field].addEventListener("input", clearBad);
    });
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      sendBooking();
    });
  }

  if (reserveDock) {
    reserveDock.addEventListener("click", function (e) {
      if (!form) return;
      e.preventDefault();
      if (!firstError()) {
        sendBooking();
        return;
      }
      document.getElementById("ticket").scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  window.addEventListener("pp-lang", function () {
    try {
      fillDays();
      fillSlots();
    } catch (err) {}
    syncDock();
  });

  syncDock();
})();
