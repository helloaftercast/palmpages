(function () {
  var WA = "66800821258";
  var STORE = "chow-chow-order";
  var cart = [];
  var guest = { name: "", people: "2", note: "" };
  var fab = document.getElementById("cart-fab");
  var countEl = document.getElementById("cart-count");
  var back = document.getElementById("cart-back");
  var sheet = document.getElementById("cart-sheet");
  var linesEl = document.getElementById("cart-lines");
  var emptyEl = document.getElementById("cart-empty");
  var totalEl = document.getElementById("cart-total");
  var infoForm = document.getElementById("info-form");

  function load() {
    try {
      var saved = JSON.parse(localStorage.getItem(STORE) || "null");
      if (!saved) return;
      if (Array.isArray(saved.cart)) {
        cart = saved.cart.filter(function (row) {
          return row && row.id && row.name && row.qty > 0;
        }).map(function (row) {
          return {
            id: String(row.id),
            name: String(row.name),
            price: row.price == null ? null : Number(row.price),
            qty: Number(row.qty)
          };
        });
      }
      if (saved.guest) {
        guest.name = String(saved.guest.name || "");
        guest.people = String(saved.guest.people || "2");
        guest.note = String(saved.guest.note || "");
      }
    } catch (err) {
      cart = [];
    }
  }

  function save() {
    localStorage.setItem(STORE, JSON.stringify({ cart: cart, guest: guest }));
  }

  function money(n) {
    return "฿" + n.toLocaleString("en-TH");
  }

  function find(id) {
    return cart.find(function (row) { return row.id === id; });
  }

  function qtyOf(id) {
    var row = find(id);
    return row ? row.qty : 0;
  }

  function add(btn) {
    var id = btn.getAttribute("data-id");
    var price = btn.getAttribute("data-price");
    var row = find(id);
    if (row) row.qty += 1;
    else cart.push({
      id: id,
      name: btn.getAttribute("data-name"),
      price: price === "ask" ? null : Number(price),
      qty: 1
    });
    render();
  }

  function setQty(id, qty) {
    var row = find(id);
    if (!row) return;
    if (qty < 1) cart.splice(cart.indexOf(row), 1);
    else row.qty = qty;
    render();
  }

  function pricedTotal() {
    return cart.reduce(function (sum, row) {
      return row.price == null ? sum : sum + row.price * row.qty;
    }, 0);
  }

  function count() {
    return cart.reduce(function (sum, row) { return sum + row.qty; }, 0);
  }

  function linePrice(row) {
    if (row.price == null) return "ask";
    return money(row.price * row.qty);
  }

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, function (ch) {
      return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" })[ch];
    });
  }

  function message() {
    var rows = cart.map(function (row) {
      var price = row.price == null ? "ask" : (row.price + " THB");
      return "• " + row.name + " × " + row.qty + " — " + price;
    }).join("\n");
    return [
      "Pre-order for Chow Chow, Chiang Mai",
      "Name: " + guest.name,
      "Guests: " + guest.people,
      "Note: " + (guest.note || "(none)"),
      "",
      rows,
      "",
      "Priced plates: " + pricedTotal() + " THB",
      "10% service charge is added at the table.",
      "Not paid yet."
    ].join("\n");
  }

  function render() {
    var n = count();
    countEl.hidden = n < 1;
    countEl.textContent = String(n);
    document.querySelectorAll("[data-add]").forEach(function (btn) {
      var q = qtyOf(btn.getAttribute("data-id"));
      btn.classList.toggle("is-in", q > 0);
      btn.textContent = q > 0 ? String(q) : "Add";
    });
    emptyEl.hidden = cart.length > 0;
    linesEl.hidden = cart.length === 0;
    linesEl.innerHTML = cart.map(function (row) {
      return "<li><span class=\"nm\">" + escapeHtml(row.name) + "</span><span class=\"sub\">" + linePrice(row) + "</span><span class=\"qty\"><button type=\"button\" data-qty=\"-1\" data-id=\"" + row.id + "\" aria-label=\"Less\">−</button><span>" + row.qty + "</span><button type=\"button\" data-qty=\"1\" data-id=\"" + row.id + "\" aria-label=\"More\">+</button></span></li>";
    }).join("");
    totalEl.textContent = money(pricedTotal());
    document.getElementById("info-items").innerHTML = cart.map(function (row) {
      return "<li>" + escapeHtml(row.name) + " × " + row.qty + " — " + escapeHtml(linePrice(row)) + "</li>";
    }).join("");
    infoForm.guest.value = guest.name;
    infoForm.people.value = guest.people || "2";
    infoForm.note.value = guest.note;
    save();
  }

  function show(panel, backdrop) {
    backdrop.hidden = false;
    panel.hidden = false;
  }

  function hide(panel, backdrop) {
    backdrop.hidden = true;
    panel.hidden = true;
  }

  function openCart() { show(sheet, back); }
  function closeCart() { hide(sheet, back); }
  function openInfo() { render(); show(document.getElementById("info-sheet"), document.getElementById("info-back")); }
  function closeInfo() { hide(document.getElementById("info-sheet"), document.getElementById("info-back")); }

  function openPreview() {
    document.getElementById("preview-text").textContent = message();
    show(document.getElementById("preview-sheet"), document.getElementById("preview-back"));
  }

  function closePreview() {
    hide(document.getElementById("preview-sheet"), document.getElementById("preview-back"));
  }

  function toast() {
    var el = document.getElementById("sent-toast");
    el.hidden = false;
    setTimeout(function () { el.hidden = true; }, 2000);
  }

  function send(href) {
    window.open(href, "_blank", "noopener");
    closePreview();
    toast();
  }

  document.querySelectorAll("[data-add]").forEach(function (btn) {
    btn.addEventListener("click", function () { add(btn); });
  });

  document.querySelectorAll(".buy").forEach(function (zone) {
    var btn = zone.querySelector("[data-add]");
    if (!btn) return;
    zone.addEventListener("click", function (event) {
      if (event.target.closest("[data-add]") || event.target.closest("a")) return;
      add(btn);
    });
  });

  fab.addEventListener("click", openCart);
  document.getElementById("cart-close").addEventListener("click", closeCart);
  document.getElementById("cart-more").addEventListener("click", closeCart);
  back.addEventListener("click", closeCart);
  linesEl.addEventListener("click", function (event) {
    var btn = event.target.closest("[data-qty]");
    if (!btn) return;
    var row = find(btn.getAttribute("data-id"));
    if (!row) return;
    setQty(row.id, row.qty + Number(btn.getAttribute("data-qty")));
  });
  document.getElementById("cart-send").addEventListener("click", function () {
    if (!cart.length) return;
    closeCart();
    openInfo();
  });
  document.getElementById("info-back").addEventListener("click", closeInfo);
  document.getElementById("info-back-btn").addEventListener("click", function () {
    closeInfo();
    openCart();
  });
  infoForm.addEventListener("submit", function (event) {
    event.preventDefault();
    guest.name = (this.guest.value || "").trim();
    guest.people = this.people.value || "1";
    guest.note = (this.note.value || "").trim();
    if (!guest.name) return;
    save();
    closeInfo();
    openPreview();
  });
  document.getElementById("preview-back").addEventListener("click", closePreview);
  document.getElementById("preview-close").addEventListener("click", closePreview);
  document.getElementById("send-wa").addEventListener("click", function () {
    if (!cart.length || !guest.name) return;
    send("https://wa.me/" + WA + "?text=" + encodeURIComponent(message()));
  });
  document.getElementById("send-line").addEventListener("click", function () {
    if (!cart.length || !guest.name) return;
    send("https://line.me/R/msg/text/?" + encodeURIComponent(message()));
  });

  load();
  render();
})();
