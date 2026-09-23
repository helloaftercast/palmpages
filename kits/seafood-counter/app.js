(function () {
  var WA = "66000000000";
  var STORE = "seafood-counter-sample";
  var lang = "en";
  var active = "catch";
  var methodDish = "";
  var cart = [];
  var guest = { name: "", people: "2", note: "" };

  var CATS = [
    { id: "catch", en: "Catch", th: "ของสด", zh: "食材" },
    { id: "plates", en: "Plates", th: "จาน", zh: "现成" },
    { id: "drinks", en: "Drinks", th: "เครื่องดื่ม", zh: "饮品" }
  ];

  var MENU = {
    catch: [
      {
        id: "catch-a",
        name: { en: "Catch A", th: "ของสด ก", zh: "食材甲" },
        desc: { en: "By weight. Replace with the real catch.", th: "ตามน้ำหนัก เปลี่ยนเป็นของจริง", zh: "按重量。换成真的食材。" },
        label: "by wt",
        methods: [
          { id: "grill", en: "Charcoal grill", th: "ย่างถ่าน", zh: "炭烤", hot: true },
          { id: "steam", en: "Steamed", th: "นึ่ง", zh: "清蒸" },
          { id: "garlic", en: "Garlic butter", th: "เนยกระเทียม", zh: "蒜香黄油" }
        ]
      },
      {
        id: "catch-b",
        name: { en: "Catch B", th: "ของสด ข", zh: "食材乙" },
        desc: { en: "By weight. Three styles is enough to show the sheet.", th: "ตามน้ำหนัก", zh: "按重量。" },
        label: "by wt",
        methods: [
          { id: "grill", en: "Grilled", th: "ย่าง", zh: "烤" },
          { id: "fried", en: "Fried", th: "ทอด", zh: "炸", hot: true }
        ]
      }
    ],
    plates: [
      {
        id: "plate",
        name: { en: "House plate", th: "จานตัวอย่าง", zh: "示例主菜" },
        desc: { en: "A priced plate. Tap to add. No cooking sheet.", th: "จานมีราคา กดเพื่อเพิ่ม", zh: "有价的菜，直接加上，不选做法。" },
        label: "฿120"
      }
    ],
    drinks: [
      {
        id: "water",
        name: { en: "Water", th: "น้ำ", zh: "水" },
        desc: { en: "Use ask when the paper has no single price.", th: "ถ้าไม่มีราคาเดียว ให้ใช้ถามราคา", zh: "纸上没有一个价的时候用问价。" },
        label: "ask"
      }
    ]
  };

  function t(map) { return map[lang] || map.en; }
  function text(el) {
    var key = "data-" + lang;
    var val = el.getAttribute(key) || el.getAttribute("data-en");
    if (val != null) el.textContent = val;
    var aria = el.getAttribute(key + "-aria") || el.getAttribute("data-en-aria");
    if (aria) el.setAttribute("aria-label", aria);
  }
  function applyStatic() {
    document.documentElement.lang = lang === "zh" ? "zh-Hans" : lang;
    document.querySelectorAll("[data-en]").forEach(text);
    document.querySelectorAll("[data-en-aria]").forEach(text);
    document.querySelectorAll("[data-set-lang]").forEach(function (btn) {
      var on = btn.getAttribute("data-set-lang") === lang;
      btn.setAttribute("aria-pressed", on ? "true" : "false");
    });
  }
  function findDish(id) {
    var keys = Object.keys(MENU);
    for (var i = 0; i < keys.length; i++) {
      var hit = MENU[keys[i]].find(function (d) { return d.id === id; });
      if (hit) return hit;
    }
    return null;
  }
  function priceLabel(label) {
    if (label === "by wt") return t({ en: "by wt", th: "ตามน้ำหนัก", zh: "按重量" });
    if (label === "ask") return t({ en: "ask", th: "ถามราคา", zh: "问价" });
    return label;
  }
  function shown(row) {
    var local = row.name[lang] || row.name.en;
    if (lang === "en" || local === row.name.en) return local;
    return local + " (" + row.name.en + ")";
  }
  function qtyOf(id) {
    var row = cart.find(function (item) { return item.id === id; });
    return row ? row.qty : 0;
  }
  function qtyOfDish(id) {
    return cart.reduce(function (n, row) {
      return row.id === id || row.id.indexOf(id + "::") === 0 ? n + row.qty : n;
    }, 0);
  }
  function save() {
    try { localStorage.setItem(STORE, JSON.stringify({ cart: cart, guest: guest, lang: lang })); } catch (err) { /* ignore */ }
  }
  function add(id, methodId) {
    var dish = findDish(id);
    if (!dish) return;
    var method = methodId && dish.methods ? dish.methods.find(function (m) { return m.id === methodId; }) : null;
    var rowId = method ? dish.id + "::" + method.id : dish.id;
    var found = cart.find(function (row) { return row.id === rowId; });
    if (found) found.qty += 1;
    else cart.push({
      id: rowId,
      name: {
        en: method ? dish.name.en + " (" + method.en + ")" : dish.name.en,
        th: method ? dish.name.th + " (" + method.th + ")" : dish.name.th,
        zh: method ? dish.name.zh + "（" + method.zh + "）" : dish.name.zh
      },
      th: method ? method.th : "",
      label: dish.label,
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
  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, function (ch) {
      return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" })[ch];
    });
  }
  function renderPills() {
    document.getElementById("pills").innerHTML = CATS.map(function (cat) {
      return "<button type=\"button\" role=\"tab\" data-cat=\"" + cat.id + "\" class=\"" + (cat.id === active ? "is-on" : "") + "\" aria-selected=\"" + (cat.id === active ? "true" : "false") + "\">" + escapeHtml(t(cat)) + "</button>";
    }).join("");
  }
  function renderBoard() {
    var list = MENU[active] || [];
    var board = document.getElementById("board");
    if (active === "drinks") {
      board.innerHTML = "<div class=\"list\">" + list.map(function (dish) {
        var q = qtyOf(dish.id);
        return "<button type=\"button\" class=\"line" + (q ? " is-in" : "") + "\" data-add=\"" + dish.id + "\">" +
          "<span>" + escapeHtml(t(dish.name)) + (q ? " × " + q : "") + "<i class=\"styles\">" + escapeHtml(t(dish.desc)) + "</i></span>" +
          "<b>" + escapeHtml(priceLabel(dish.label)) + "</b></button>";
      }).join("") + "</div>";
      return;
    }
    board.innerHTML = "<div class=\"grid\">" + list.map(function (dish) {
      var q = qtyOfDish(dish.id);
      var styles = dish.methods
        ? t({ en: dish.methods.length + " cooking styles", th: dish.methods.length + " วิธี", zh: dish.methods.length + " 种做法" })
        : "";
      var btn = dish.methods
        ? "<button type=\"button\" class=\"order\" data-methods=\"" + dish.id + "\">" + escapeHtml(t({ en: "Choose style", th: "เลือกวิธีทำ", zh: "选做法" })) + "</button>"
        : "<button type=\"button\" class=\"order\" data-add=\"" + dish.id + "\">" + escapeHtml(t({ en: "Add", th: "เพิ่ม", zh: "加上" })) + (q ? " · " + q : "") + "</button>";
      return "<article class=\"card" + (q ? " is-in" : "") + "\">" +
        "<div class=\"plate\" aria-hidden=\"true\"></div>" +
        "<h3>" + escapeHtml(t(dish.name)) + "</h3>" +
        "<p>" + escapeHtml(t(dish.desc)) + "</p>" +
        "<p class=\"price\">" + escapeHtml(priceLabel(dish.label)) + (styles ? "<i class=\"styles\">" + escapeHtml(styles) + "</i>" : "") + "</p>" +
        btn + "</article>";
    }).join("") + "</div>";
  }
  function renderMethods() {
    var dish = findDish(methodDish);
    if (!dish || !dish.methods) return;
    document.getElementById("method-name").textContent = t(dish.name);
    document.getElementById("method-price").textContent = priceLabel(dish.label);
    var ordered = dish.methods.slice().sort(function (a, b) { return (b.hot ? 1 : 0) - (a.hot ? 1 : 0); });
    document.getElementById("method-grid").innerHTML = ordered.map(function (m) {
      var q = qtyOf(dish.id + "::" + m.id);
      var local = lang === "zh" ? "<span class=\"local\">" + escapeHtml(m.zh) + "</span>" : "";
      return "<div class=\"chip" + (q ? " is-on" : "") + "\">" +
        (m.hot ? "<span class=\"tag\">" + escapeHtml(t({ en: "House pick", th: "แนะนำ", zh: "招牌" })) + "</span>" : "") +
        "<span class=\"en\">" + escapeHtml(m.en) + "</span>" +
        local +
        "<span class=\"th\">" + escapeHtml(m.th) + "</span>" +
        "<span class=\"step\"><button type=\"button\" data-method=\"" + m.id + "\" data-d=\"-1\"" + (q ? "" : " disabled") + " aria-label=\"−\">−</button><b>" + q + "</b><button type=\"button\" data-method=\"" + m.id + "\" data-d=\"1\" aria-label=\"+\">+</button></span></div>";
    }).join("");
  }
  function renderCart() {
    var n = cart.reduce(function (sum, row) { return sum + row.qty; }, 0);
    var countEl = document.getElementById("cart-count");
    countEl.hidden = n < 1;
    countEl.textContent = String(n);
    var empty = document.getElementById("cart-empty");
    var lines = document.getElementById("cart-lines");
    empty.hidden = n > 0;
    lines.hidden = n === 0;
    lines.innerHTML = cart.map(function (row) {
      return "<li><span>" + escapeHtml(shown(row)) + "<i class=\"styles\">" + escapeHtml(priceLabel(row.label)) + "</i></span>" +
        "<span class=\"qty\"><button type=\"button\" data-qty=\"" + row.id + "\" data-d=\"-1\" aria-label=\"−\">−</button><b>" + row.qty + "</b><button type=\"button\" data-qty=\"" + row.id + "\" data-d=\"1\" aria-label=\"+\">+</button></span></li>";
    }).join("");
    document.getElementById("info-items").innerHTML = cart.map(function (row) {
      return "<li><span>" + escapeHtml(shown(row)) + " × " + row.qty + "</span><span>" + escapeHtml(priceLabel(row.label)) + "</span></li>";
    }).join("");
  }
  function render() {
    renderPills();
    renderBoard();
    renderCart();
    if (methodDish && !document.getElementById("method-sheet").hidden) renderMethods();
    var form = document.getElementById("info-form");
    form.guest.value = guest.name;
    form.people.value = guest.people || "2";
    form.note.value = guest.note;
    save();
  }
  function message() {
    var rows = cart.map(function (row) {
      return "• " + shown(row) + (row.th && lang !== "th" ? " · " + row.th : "") + " × " + row.qty + " — " + priceLabel(row.label);
    }).join("\n");
    var note = guest.note || t({ en: "(none)", th: "ไม่มี", zh: "无" });
    return [
      t({ en: "Pre-order for Sample Counter", th: "สั่งล่วงหน้า เคาน์เตอร์ตัวอย่าง", zh: "预点 示例柜台" }),
      t({ en: "Name: ", th: "ชื่อ: ", zh: "名字：" }) + guest.name,
      t({ en: "Guests: ", th: "จำนวนคน: ", zh: "几位：" }) + guest.people,
      t({ en: "Note: ", th: "หมายเหตุ: ", zh: "备注：" }) + note,
      "",
      rows,
      "",
      t({ en: "Kitchen confirms the weight.", th: "ครัวยืนยันน้ำหนัก", zh: "重量由厨房再确认。" }),
      t({ en: "Not paid yet.", th: "ยังไม่ได้จ่าย", zh: "还没付款。" })
    ].join("\n");
  }
  function show(id, back) {
    document.getElementById(back).hidden = false;
    document.getElementById(id).hidden = false;
  }
  function hide(id, back) {
    document.getElementById(id).hidden = true;
    document.getElementById(back).hidden = true;
  }
  function openMethods(id) {
    methodDish = id;
    renderMethods();
    show("method-sheet", "method-back");
  }

  document.getElementById("pills").addEventListener("click", function (event) {
    var btn = event.target.closest("[data-cat]");
    if (!btn) return;
    active = btn.getAttribute("data-cat");
    render();
  });
  document.getElementById("board").addEventListener("click", function (event) {
    var methods = event.target.closest("[data-methods]");
    if (methods) { openMethods(methods.getAttribute("data-methods")); return; }
    var addBtn = event.target.closest("[data-add]");
    if (addBtn) add(addBtn.getAttribute("data-add"));
  });
  document.getElementById("method-grid").addEventListener("click", function (event) {
    var btn = event.target.closest("[data-method]");
    if (!btn) return;
    var id = btn.getAttribute("data-method");
    var delta = Number(btn.getAttribute("data-d"));
    var rowId = methodDish + "::" + id;
    if (delta > 0) add(methodDish, id);
    else setQty(rowId, qtyOf(rowId) + delta);
  });
  document.getElementById("method-close").addEventListener("click", function () { hide("method-sheet", "method-back"); });
  document.getElementById("method-done").addEventListener("click", function () { hide("method-sheet", "method-back"); });
  document.getElementById("method-back").addEventListener("click", function () { hide("method-sheet", "method-back"); });

  document.getElementById("cart-fab").addEventListener("click", function () { show("cart-sheet", "cart-back"); });
  document.getElementById("cart-close").addEventListener("click", function () { hide("cart-sheet", "cart-back"); });
  document.getElementById("cart-more").addEventListener("click", function () { hide("cart-sheet", "cart-back"); });
  document.getElementById("cart-back").addEventListener("click", function () { hide("cart-sheet", "cart-back"); });
  document.getElementById("cart-lines").addEventListener("click", function (event) {
    var btn = event.target.closest("[data-qty]");
    if (!btn) return;
    setQty(btn.getAttribute("data-qty"), qtyOf(btn.getAttribute("data-qty")) + Number(btn.getAttribute("data-d")));
  });
  document.getElementById("cart-send").addEventListener("click", function () {
    if (!cart.length) return;
    hide("cart-sheet", "cart-back");
    show("info-sheet", "info-back");
  });
  document.getElementById("info-back").addEventListener("click", function () { hide("info-sheet", "info-back"); });
  document.getElementById("info-back-btn").addEventListener("click", function () {
    hide("info-sheet", "info-back");
    show("cart-sheet", "cart-back");
  });
  document.getElementById("info-form").addEventListener("submit", function (event) {
    event.preventDefault();
    guest.name = (this.guest.value || "").trim();
    guest.people = this.people.value || "1";
    guest.note = (this.note.value || "").trim();
    if (!guest.name || !cart.length) return;
    save();
    hide("info-sheet", "info-back");
    document.getElementById("preview-text").textContent = message();
    show("preview-sheet", "preview-back");
  });
  document.getElementById("preview-close").addEventListener("click", function () { hide("preview-sheet", "preview-back"); });
  document.getElementById("preview-back").addEventListener("click", function () { hide("preview-sheet", "preview-back"); });
  function send(href) {
    if (!cart.length || !guest.name) return;
    window.open(href, "_blank", "noopener");
    hide("preview-sheet", "preview-back");
    var toast = document.getElementById("toast");
    toast.textContent = t({ en: "Sent ✓✓", th: "ส่งแล้ว ✓✓", zh: "已送出 ✓✓" });
    toast.hidden = false;
    setTimeout(function () { toast.hidden = true; }, 2000);
  }
  document.getElementById("send-wa").addEventListener("click", function () {
    send("https://wa.me/" + WA + "?text=" + encodeURIComponent(message()));
  });
  document.getElementById("send-line").addEventListener("click", function () {
    send("https://line.me/R/msg/text/?" + encodeURIComponent(message()));
  });
  document.querySelectorAll("[data-set-lang]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      lang = btn.getAttribute("data-set-lang");
      applyStatic();
      render();
    });
  });
  document.addEventListener("keydown", function (event) {
    if (event.key !== "Escape") return;
    hide("method-sheet", "method-back");
    hide("cart-sheet", "cart-back");
    hide("info-sheet", "info-back");
    hide("preview-sheet", "preview-back");
  });

  try {
    var saved = JSON.parse(localStorage.getItem(STORE) || "null");
    if (saved && Array.isArray(saved.cart)) cart = saved.cart;
    if (saved && saved.guest) guest = saved.guest;
    if (saved && saved.lang) lang = saved.lang;
  } catch (err) { /* ignore */ }
  applyStatic();
  render();
})();
