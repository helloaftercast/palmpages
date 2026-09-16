(function () {
  var WA = "66818936558";
  var MAIL = "paddleasia@gmail.com";
  var TEL = "66817974855";
  var LEAD_MIN = 90;
  var SLOTS = ["morning"];

  var linesEl = document.querySelector("[data-lines]");
  var emptyEl = document.querySelector("[data-empty]");
  var totalEl = document.querySelector("[data-total]");
  var form = document.querySelector("[data-form]");
  var dayEl = form && form.elements.namedItem("day");
  var slotEl = form && form.elements.namedItem("slot");
  var warnEl = document.querySelector("[data-warn]");
  var reserveDock = document.querySelector("[data-reserve-dock]");
  var chatLayer = document.querySelector("[data-order-chat]");
  var channelFab = document.querySelector("[data-channel-fab]");
  var channelWidget = document.querySelector("[data-channel-widget]");
  var chatChannels = document.querySelector("[data-chat-channels]");
  var cart = [];
  var bookVisible = false;
  var lastText = "";

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
    return "฿" + Number(n).toLocaleString("en-US");
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

  function hasDayTrip() {
    return cart.some(function (item) { return item.id === "day"; });
  }

  function greet() {
    return isTh()
      ? "สวัสดี Paddle Asia อยากจองทัวร์คายัคส่วนตัวครับ/ค่ะ"
      : "Hi Paddle Asia, I'd like to book a private kayak tour.";
  }

  function waHref(text) {
    return "https://wa.me/" + WA + "?text=" + encodeURIComponent(text || greet());
  }

  function mailHref(text) {
    var sub = isTh() ? "จองทัวร์ Paddle Asia" : "Paddle Asia booking";
    return "mailto:" + MAIL + "?subject=" + encodeURIComponent(sub) + "&body=" + encodeURIComponent(text || greet());
  }

  function telHref() {
    return "tel:+" + TEL;
  }

  function channelHref(kind, text) {
    if (kind === "mail") return mailHref(text);
    if (kind === "tel") return telHref();
    return waHref(text);
  }

  function dockLabel() {
    var n = count();
    var priced = pricedTotal();
    if (!n) return isTh() ? "จองทัวร์" : "Book a tour";
    var extra = hasAsk()
      ? (priced > 0 ? money(priced) + (isTh() ? " + สอบถาม" : " + ask") : (isTh() ? "สอบถาม" : "ask"))
      : money(priced);
    return (isTh() ? "ส่งการจอง · " : "Send booking · ") + extra;
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
      nameTh: item.nameTh,
      name: item.nameEn || item.nameTh,
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
        msg: isTh() ? "แตะทัวร์ด้านบนก่อน" : "Tap a tour above first."
      };
    }
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
    if (!dayEl || !dayEl.value) {
      return { el: dayEl, msg: isTh() ? "เลือกวัน" : "Pick a day." };
    }
    if (!slotEl || !slotEl.value) {
      return { el: slotEl, msg: isTh() ? "เลือกช่วงเช้า" : "Pick morning." };
    }
    if (hasDayTrip() && Number(form.people.value) < 2) {
      return {
        el: form.people,
        msg: isTh() ? "ทริปวันเดียวขั้นต่ำ 2 คน" : "The day trip needs two people minimum."
      };
    }
    return null;
  }

  function slotLabel(value) {
    if (value === "morning") return isTh() ? "เช้า" : "Morning";
    return value;
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
      estLine = th ? "รบกวนยืนยันราคา" : "Please confirm prices";
    } else {
      estLine = th ? "ประมาณ " + money(priced) : "Est. " + money(priced);
    }
    var lines = th ? [
      "จอง Paddle Asia — คายัคส่วนตัว อ่าวพังงา",
      "",
      "ชื่อ: " + data.name,
      "ติดต่อ: " + data.phone,
      "จำนวนคน: " + data.people,
      "วัน: " + data.day + " " + slotLabel(data.slot),
      data.note ? "หมายเหตุ: " + data.note : "",
      "",
      rows.join("\n"),
      "",
      estLine,
      "ยังไม่ได้ชำระ รบกวนยืนยันด้วยครับ/ค่ะ"
    ] : [
      "Booking for Paddle Asia — private kayak, Phang Nga Bay",
      "",
      "Name: " + data.name,
      "Contact: " + data.phone,
      "People: " + data.people,
      "Day: " + data.day + " " + slotLabel(data.slot),
      data.note ? "Note: " + data.note : "",
      "",
      rows.join("\n"),
      "",
      estLine,
      "Not paid. Please confirm."
    ];
    return lines.filter(function (line) { return line !== ""; }).join("\n");
  }

  function wireChannelLinks(text) {
    lastText = text || lastText || greet();
    document.querySelectorAll("[data-channel]").forEach(function (a) {
      var kind = a.getAttribute("data-channel");
      a.href = channelHref(kind, lastText);
    });
  }

  function openChannels(fromChat) {
    wireChannelLinks(lastText);
    if (fromChat && chatChannels) {
      chatChannels.hidden = false;
      return;
    }
    if (channelWidget) channelWidget.classList.add("is-open");
    if (channelFab) {
      channelFab.classList.add("is-open");
      channelFab.setAttribute("aria-expanded", "true");
    }
  }

  function closeChannels() {
    if (channelWidget) channelWidget.classList.remove("is-open");
    if (channelFab) {
      channelFab.classList.remove("is-open");
      channelFab.setAttribute("aria-expanded", "false");
    }
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
    lastText = text;
    wireChannelLinks(text);
    if (chatChannels) chatChannels.hidden = true;
    if (window.playOrderChat) {
      window.playOrderChat({ text: text, href: waHref(text), copy: true });
    } else {
      openChannels(false);
    }
    return true;
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
        else if (hasAsk()) totalEl.textContent = "ยืนยันราคาในแชท";
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
    syncDock();
  }

  function fillDays() {
    if (!dayEl) return;
    var now = bangkokParts(new Date());
    var start = new Date(Date.UTC(Number(now.y), Number(now.m) - 1, Number(now.d)));
    dayEl.innerHTML = "";
    for (var i = 0; i < 12; i += 1) {
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

  function fillSlots() {
    if (!slotEl) return;
    var keep = slotEl.value;
    slotEl.innerHTML = "";
    SLOTS.forEach(function (slot) {
      var opt = document.createElement("option");
      opt.value = slot;
      opt.textContent = slotLabel(slot);
      slotEl.appendChild(opt);
    });
    if (keep) slotEl.value = keep;
  }

  document.addEventListener("click", function (e) {
    var addBtn = e.target.closest("[data-add]");
    if (addBtn) {
      add({
        id: addBtn.getAttribute("data-id"),
        nameEn: addBtn.getAttribute("data-name-en"),
        nameTh: addBtn.getAttribute("data-name-th"),
        price: Number(addBtn.getAttribute("data-price") || 0)
      });
    }
    var qtyBtn = e.target.closest("[data-qty]");
    if (qtyBtn) {
      var found = cart.find(function (row) { return row.id === qtyBtn.getAttribute("data-qty"); });
      if (found) setQty(found.id, found.qty + Number(qtyBtn.getAttribute("data-d")));
    }
  });

  if (form) {
    fillDays();
    fillSlots();
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

  if (channelFab) {
    channelFab.addEventListener("click", function (e) {
      e.preventDefault();
      if (channelWidget && channelWidget.classList.contains("is-open")) closeChannels();
      else openChannels(false);
    });
  }

  document.addEventListener("click", function (e) {
    if (!channelWidget) return;
    if (e.target.closest("[data-channel-widget]")) return;
    closeChannels();
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeChannels();
  });

  window.addEventListener("pp-lang", function () {
    try {
      fillDays();
      fillSlots();
    } catch (err) {}
    render();
    wireChannelLinks(lastText);
  });

  var bookSection = document.getElementById("book");
  if (bookSection && "IntersectionObserver" in window) {
    new IntersectionObserver(function (entries) {
      bookVisible = entries[0].isIntersecting;
      renderDock();
    }, { threshold: 0.12 }).observe(bookSection);
  }

  wireChannelLinks(greet());
  render();
})();
