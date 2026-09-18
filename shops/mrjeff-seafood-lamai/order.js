(function () {
  var WA = "66620454983";
  var LEAD_MIN = 45;
  var SLOTS = [
    "13:00", "13:30", "14:00", "14:30", "15:00", "15:30",
    "16:00", "16:30", "17:00", "17:30", "18:00", "18:30",
    "19:00", "19:30", "20:00", "20:30", "21:00", "21:30", "22:00"
  ];

  var COPY = {
    en: {
      byWt: "by wt",
      ask: "ask",
      today: "Today, ",
      closing: "Kitchen closing soon — pick another day",
      order: "Order · ",
      total: "Weight & price confirmed by kitchen",
      greet: "Hi Mr. Jeff, I'd like a table.",
      sendLine: "Send on LINE",
      sendWa: "Send on WhatsApp",
      dockLine: "LINE to reserve",
      dockWa: "Chat on WhatsApp",
      replyLine: "Got it — we'll weigh the catch and confirm the price. Message copied; paste it in LINE.",
      replyWa: "Got it — we'll weigh the catch and confirm the price. See you soon.",
      openLine: "Open LINE",
      openWa: "Open WhatsApp",
      msg: [
        "Pre-order for Mr.Jeff, Lamai",
        "",
        "Name: {name}",
        "{ch}: {phone}",
        "People: {people}",
        "Arrive: {day} {slot}",
        "{note}",
        "",
        "{rows}",
        "",
        "Weight & price confirmed by kitchen.",
        "Not paid — cash only. Khob khun!"
      ]
    },
    ru: {
      byWt: "на вес",
      ask: "уточнить",
      today: "Сегодня, ",
      closing: "Кухня скоро закрывается — выберите другой день",
      order: "Заказ · ",
      total: "Кухня подтвердит вес и цену",
      greet: "Здравствуйте, мистер Джефф, хотим столик.",
      sendLine: "Отправить в LINE",
      sendWa: "Отправить в WhatsApp",
      dockLine: "LINE — забронировать",
      dockWa: "Написать в WhatsApp",
      replyLine: "Приняли — взвесим улов и подтвердим цену. Сообщение скопировано, вставьте в LINE.",
      replyWa: "Приняли — взвесим улов и подтвердим цену. До встречи.",
      openLine: "Открыть LINE",
      openWa: "Открыть WhatsApp",
      msg: [
        "Предзаказ в Mr.Jeff, Ламай",
        "",
        "Имя: {name}",
        "{ch}: {phone}",
        "Гостей: {people}",
        "Приход: {day} {slot}",
        "{note}",
        "",
        "{rows}",
        "",
        "Кухня подтвердит вес и цену.",
        "Не оплачено — только наличные. Спасибо!"
      ]
    },
    zh: {
      byWt: "按重量",
      ask: "询价",
      today: "今天，",
      closing: "厨房快打烊了 — 请换一天",
      order: "点单 · ",
      total: "厨房确认重量和价格",
      greet: "你好 Mr. Jeff，想订一张桌子。",
      sendLine: "用 LINE 发送",
      sendWa: "用 WhatsApp 发送",
      dockLine: "用 LINE 订位",
      dockWa: "用 WhatsApp 联系",
      replyLine: "收到了——我们会称重并确认价格。信息已复制，粘贴到 LINE 即可。",
      replyWa: "收到了——我们会称重并确认价格。回头见。",
      openLine: "打开 LINE",
      openWa: "打开 WhatsApp",
      msg: [
        "Mr.Jeff 拉迈 · 提前点餐",
        "",
        "姓名：{name}",
        "{ch}：{phone}",
        "人数：{people}",
        "到达：{day} {slot}",
        "{note}",
        "",
        "{rows}",
        "",
        "厨房确认重量和价格。",
        "尚未付款 — 只收现金。谢谢！"
      ]
    },
    th: {
      byWt: "ตามน้ำหนัก",
      ask: "สอบถาม",
      today: "วันนี้, ",
      closing: "ครัวใกล้ปิดแล้ว — เลือกวันอื่นนะ",
      order: "ออเดอร์ · ",
      total: "ครัวยืนยันน้ำหนักและราคา",
      greet: "สวัสดีครับ/ค่ะ ร้าน Mr.Jeff ขอจองโต๊ะหน่อย",
      sendLine: "ส่งทาง LINE",
      sendWa: "ส่งทาง WhatsApp",
      dockLine: "ทัก LINE จองโต๊ะ",
      dockWa: "ทัก WhatsApp จองโต๊ะ",
      replyLine: "รับแล้วครับ เดี๋ยวชั่งของสดแล้วยืนยันราคาให้ — ข้อความคัดลอกไว้แล้ว วางใน LINE ได้เลย",
      replyWa: "รับแล้วครับ เดี๋ยวชั่งของสดแล้วยืนยันราคาให้ เจอกันครับ",
      openLine: "เปิด LINE",
      openWa: "เปิด WhatsApp",
      msg: [
        "สั่งล่วงหน้า ร้าน Mr.Jeff ละไม",
        "",
        "ชื่อ: {name}",
        "{ch}: {phone}",
        "จำนวนคน: {people}",
        "เวลามาถึง: {day} {slot}",
        "{note}",
        "",
        "{rows}",
        "",
        "ครัวยืนยันน้ำหนักและราคา",
        "ยังไม่ชำระ — รับเงินสดเท่านั้น ขอบคุณครับ/ค่ะ"
      ]
    }
  };

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

  function t(key) {
    var pack = COPY[lang()] || COPY.en;
    return pack[key] != null ? pack[key] : COPY.en[key];
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

  function money(n) {
    return "฿" + n.toLocaleString("en-TH");
  }

  function lineLabel(item) {
    if (item.kind === "cook") return "—";
    if (!item.price || item.price === 0) return item.ask ? t("ask") : t("byWt");
    return money(item.price * item.qty);
  }

  function count() {
    return cart.reduce(function (sum, item) { return sum + item.qty; }, 0);
  }

  function itemName(item) {
    var L = lang();
    if (L === "zh") return item.nameZh || item.nameEn || item.nameRu || item.nameTh;
    if (L === "ru") return item.nameRu || item.nameEn || item.nameZh || item.nameTh;
    if (L === "th") return item.nameTh || item.nameEn;
    return item.nameEn || item.nameRu || item.nameZh || item.nameTh;
  }

  function channel() {
    if (!form) return "whatsapp";
    var picked = form.querySelector('input[name="channel"]:checked');
    return picked ? picked.value : "whatsapp";
  }

  function setDefaultChannel() {
    if (!form || channelTouched) return;
    var radio = form.querySelector('input[name="channel"][value="whatsapp"]');
    if (radio) radio.checked = true;
    syncChannelUi();
  }

  function greet() {
    return t("greet");
  }

  function syncChannelUi() {
    var ch = channel();
    var submit = form && form.querySelector('[type="submit"]');
    if (submit) {
      submit.classList.toggle("btn-wa", ch === "whatsapp");
      submit.classList.toggle("btn-line", ch === "line");
      submit.textContent = ch === "line" ? t("sendLine") : t("sendWa");
    }
    if (reserveDock) {
      if (ch === "line") {
        reserveDock.href = "https://line.me/R/msg/text/?" + encodeURIComponent(greet());
        reserveDock.textContent = t("dockLine");
        reserveDock.classList.add("is-line");
        reserveDock.classList.remove("is-wa");
      } else {
        reserveDock.href = "https://wa.me/" + WA + "?text=" + encodeURIComponent(greet());
        reserveDock.textContent = t("dockWa");
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
      nameRu: item.nameRu,
      nameZh: item.nameZh,
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
    dock.textContent = t("order") + n + " · " + t("byWt");
  }

  function render() {
    var has = cart.length > 0;
    if (emptyEl) emptyEl.hidden = has;
    if (linesEl) linesEl.hidden = !has;
    if (totalEl) {
      totalEl.hidden = !has;
      totalEl.textContent = t("total");
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
      opt.textContent = iso === ymd(now) ? t("today") + iso : iso;
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
      opt.textContent = t("closing");
      slotEl.appendChild(opt);
    } else if (keep) {
      slotEl.value = keep;
    }
  }

  function message(data) {
    var rows = cart.map(function (item) {
      return "• " + itemName(item) + " × " + item.qty + " — " + lineLabel(item);
    }).join("\n");
    var noteKey = lang() === "zh" ? "备注：" : lang() === "ru" ? "Заметка: " : lang() === "th" ? "หมายเหตุ: " : "Note: ";
    var note = data.note ? noteKey + data.note : "";
    return t("msg").map(function (line) {
      return line
        .replace("{name}", data.name)
        .replace("{ch}", data.channel === "line" ? "LINE" : "WhatsApp")
        .replace("{phone}", data.phone)
        .replace("{people}", data.people)
        .replace("{day}", data.day)
        .replace("{slot}", data.slot)
        .replace("{note}", note)
        .replace("{rows}", rows);
    }).filter(function (line) { return line !== ""; }).join("\n");
  }

  function prepareChat(ch) {
    if (!chatLayer) return;
    chatLayer.setAttribute("data-name", "Mr.Jeff");
    if (ch === "line") {
      chatLayer.setAttribute("data-reply", t("replyLine"));
      chatLayer.setAttribute("data-continue", t("openLine"));
    } else {
      chatLayer.setAttribute("data-reply", t("replyWa"));
      chatLayer.setAttribute("data-continue", t("openWa"));
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
        nameRu: addBtn.getAttribute("data-name-ru") || addBtn.getAttribute("data-name-en"),
        nameZh: addBtn.getAttribute("data-name-zh") || addBtn.getAttribute("data-name-en"),
        price: Number(addBtn.getAttribute("data-price")),
        ask: addBtn.getAttribute("data-ask") === "1" || id.indexOf("side-") === 0 || id.indexOf("thai-") === 0,
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

  var board = document.querySelector(".menu-board");
  if (board) {
    board.addEventListener("click", function (e) {
      var tab = e.target.closest("[data-menu-tab]");
      if (!tab || !board.contains(tab)) return;
      var id = tab.getAttribute("data-menu-tab");
      board.querySelectorAll("[data-menu-tab]").forEach(function (btn) {
        var on = btn === tab;
        btn.setAttribute("aria-selected", on ? "true" : "false");
      });
      board.querySelectorAll("[data-menu-panel]").forEach(function (panel) {
        var on = panel.getAttribute("data-menu-panel") === id;
        panel.hidden = !on;
        if (on) {
          panel.querySelectorAll("[data-fx]").forEach(function (el) {
            el.classList.add("is-in");
          });
        }
      });
    });
  }

  render();
})();
