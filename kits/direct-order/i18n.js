(function () {
  var STORE = "direct-order-lang";
  var dict = {
    en: {
      "doc.title": "Direct order kit — PalmPages",
      "skip": "Skip to menu",
      "brand.aria": "Sample Kitchen",
      "nav.menu": "Menu",
      "nav.about": "About",
      "nav.events": "Events",
      "nav.contact": "Contact",
      "lang.aria": "Language",
      "overview.aria": "Overview",
      "overview.h": "Overview",
      "hero.kicker": "Sample town",
      "hero.h1": "Our Menu",
      "hero.p": "Replace this line with the shop’s own hours. Do not invent a service charge.",
      "cats.aria": "Menu categories",
      "cats.highlights": "Highlights",
      "cats.plates": "Plates",
      "cats.drinks": "Drinks",
      "start.kicker": "Start",
      "start.h2": "Start here",
      "start.lede": "One sentence on where the table is. Prices below are samples, not a real menu.",
      "highlights.kicker": "Photos",
      "highlights.h2": "On the table",
      "highlights.lede": "Highlight plates get a photo. Everything else stays a text row.",
      "plates.h2": "Plates",
      "drinks.h2": "Drinks",
      "about.kicker": "About",
      "about.h2": "The kitchen",
      "about.lede": "Two short sentences in the shop’s own voice.",
      "events.kicker": "Events",
      "events.h2": "Nothing posted",
      "events.lede": "Only write an event the shop has actually posted.",
      "contact.kicker": "Contact",
      "contact.h2": "Find us",
      "hours.h": "Hours",
      "hours.days": "Replace",
      "addr.h": "Address",
      "addr.lines": "Street<br>Town",
      "reach.h": "Reach the kitchen",
      "reach.ig": "The account they post on.",
      "reach.line": "Same number, on LINE.",
      "foot": "Sample prices. Not a live menu.",
      "cart.aria": "Cart",
      "cart.h": "Your order",
      "cart.close": "Close",
      "cart.empty": "Tap a price, or Add.",
      "cart.total": "Priced plates",
      "cart.note": "Not paid yet.",
      "cart.send": "Send order",
      "cart.more": "Continue browsing",
      "cart.less": "Less",
      "cart.moreQty": "More",
      "info.h": "Your table",
      "info.name": "Name",
      "info.guests": "Guests",
      "info.note": "Note",
      "info.picked": "Selected dishes",
      "info.back": "Back",
      "info.preview": "Preview",
      "preview.aria": "Order preview",
      "preview.sub": "Order preview",
      "preview.close": "Close",
      "toast": "Sent ✓✓",
      "add": "Add",
      "price.ask": "ask",
      "price.suffix": " THB",
      "msg.title": "Pre-order for Sample Kitchen",
      "msg.name": "Name: ",
      "msg.guests": "Guests: ",
      "msg.note": "Note: ",
      "msg.none": "(none)",
      "msg.priced": "Priced plates: ",
      "msg.service": "",
      "msg.unpaid": "Not paid yet.",
      "dish.plate.name": "House plate",
      "dish.plate.sub": "จานตัวอย่าง",
      "dish.plate.desc": "Replace with the printed description. Do not invent a price.",
      "dish.plate.alt": "Placeholder for the house plate",
      "dish.soup.name": "House soup",
      "dish.soup.sub": "ซุปตัวอย่าง",
      "dish.soup.desc": "A text row. Tap the price or Add.",
      "dish.water.name": "Water",
      "dish.water.sub": "น้ำ",
      "dish.water.desc": "Use ask when the paper has no single price."
    },
    th: {
      "doc.title": "เทมเพลตสั่งอาหาร — PalmPages",
      "skip": "ข้ามไปเมนู",
      "brand.aria": "ครัวตัวอย่าง",
      "nav.menu": "เมนู",
      "nav.about": "เกี่ยวกับ",
      "nav.events": "กิจกรรม",
      "nav.contact": "ติดต่อ",
      "lang.aria": "ภาษา",
      "overview.aria": "ภาพรวม",
      "overview.h": "ภาพรวม",
      "hero.kicker": "เมืองตัวอย่าง",
      "hero.h1": "เมนู",
      "hero.p": "เปลี่ยนบรรทัดนี้เป็นเวลาของร้าน อย่าใส่ค่าบริการที่เมนูไม่มี",
      "cats.aria": "หมวดเมนู",
      "cats.highlights": "จานเด่น",
      "cats.plates": "จานหลัก",
      "cats.drinks": "เครื่องดื่ม",
      "start.kicker": "เริ่ม",
      "start.h2": "เริ่มที่นี่",
      "start.lede": "หนึ่งประโยคว่าร้านอยู่ที่ไหน ราคาด้านล่างเป็นตัวอย่าง",
      "highlights.kicker": "รูป",
      "highlights.h2": "บนโต๊ะ",
      "highlights.lede": "จานเด่นใส่รูป นอกนั้นเป็นแถวข้อความ",
      "plates.h2": "จานหลัก",
      "drinks.h2": "เครื่องดื่ม",
      "about.kicker": "เกี่ยวกับ",
      "about.h2": "ครัว",
      "about.lede": "สองประโยคสั้น ๆ ด้วยน้ำเสียงของร้าน",
      "events.kicker": "กิจกรรม",
      "events.h2": "ยังไม่ประกาศ",
      "events.lede": "เขียนเฉพาะกิจกรรมที่ร้านประกาศจริง",
      "contact.kicker": "ติดต่อ",
      "contact.h2": "มาหาเรา",
      "hours.h": "เวลา",
      "hours.days": "เปลี่ยน",
      "addr.h": "ที่อยู่",
      "addr.lines": "ถนน<br>เมือง",
      "reach.h": "ติดต่อครัว",
      "reach.ig": "บัญชีที่ร้านโพสต์เอง",
      "reach.line": "เบอร์เดียวกัน บน LINE",
      "foot": "ราคาตัวอย่าง ไม่ใช่เมนูจริง",
      "cart.aria": "ตะกร้า",
      "cart.h": "รายการของคุณ",
      "cart.close": "ปิด",
      "cart.empty": "แตะราคา หรือปุ่มเพิ่ม",
      "cart.total": "รายการที่ระบุราคา",
      "cart.note": "ยังไม่ได้จ่าย",
      "cart.send": "ส่งออเดอร์",
      "cart.more": "ดูต่อ",
      "cart.less": "ลด",
      "cart.moreQty": "เพิ่ม",
      "info.h": "โต๊ะของคุณ",
      "info.name": "ชื่อ",
      "info.guests": "จำนวนคน",
      "info.note": "หมายเหตุ",
      "info.picked": "จานที่เลือก",
      "info.back": "กลับ",
      "info.preview": "ดูก่อนส่ง",
      "preview.aria": "ตัวอย่างออเดอร์",
      "preview.sub": "ตัวอย่างออเดอร์",
      "preview.close": "ปิด",
      "toast": "ส่งแล้ว ✓✓",
      "add": "เพิ่ม",
      "price.ask": "ถามราคา",
      "price.suffix": " บาท",
      "msg.title": "สั่งล่วงหน้า ครัวตัวอย่าง",
      "msg.name": "ชื่อ: ",
      "msg.guests": "จำนวนคน: ",
      "msg.note": "หมายเหตุ: ",
      "msg.none": "ไม่มี",
      "msg.priced": "รวมรายการที่ระบุราคา: ",
      "msg.service": "",
      "msg.unpaid": "ยังไม่ได้จ่าย",
      "dish.plate.name": "จานตัวอย่าง",
      "dish.plate.sub": "House plate",
      "dish.plate.desc": "เปลี่ยนเป็นคำบรรยายบนเมนู อย่าตั้งราคาเอง",
      "dish.plate.alt": "ที่ว่างสำหรับรูปจาน",
      "dish.soup.name": "ซุปตัวอย่าง",
      "dish.soup.sub": "House soup",
      "dish.soup.desc": "แถวข้อความ แตะราคาหรือปุ่มเพิ่ม",
      "dish.water.name": "น้ำ",
      "dish.water.sub": "Water",
      "dish.water.desc": "ถ้าเมนูไม่มีราคาเดียว ให้ใช้ถามราคา"
    },
    zh: {
      "doc.title": "直接点单模板 — PalmPages",
      "skip": "跳到菜单",
      "brand.aria": "示例厨房",
      "nav.menu": "菜单",
      "nav.about": "关于",
      "nav.events": "活动",
      "nav.contact": "联系",
      "lang.aria": "语言",
      "overview.aria": "总览",
      "overview.h": "总览",
      "hero.kicker": "示例小镇",
      "hero.h1": "我们的菜单",
      "hero.p": "这一行换成店里自己的时间。菜单上没有服务费就不要写。",
      "cats.aria": "菜单分类",
      "cats.highlights": "亮点",
      "cats.plates": "主菜",
      "cats.drinks": "饮品",
      "start.kicker": "开始",
      "start.h2": "从这里开始",
      "start.lede": "一句话写店在哪。下面的价格是示例，不是真菜单。",
      "highlights.kicker": "图片",
      "highlights.h2": "桌上这几道",
      "highlights.lede": "亮点菜带图，其余是文字。",
      "plates.h2": "主菜",
      "drinks.h2": "饮品",
      "about.kicker": "关于",
      "about.h2": "厨房",
      "about.lede": "用店里自己的口气写两句短的。",
      "events.kicker": "活动",
      "events.h2": "还没贴活动",
      "events.lede": "只写店里真贴出来的活动。",
      "contact.kicker": "联系",
      "contact.h2": "怎么找",
      "hours.h": "时间",
      "hours.days": "替换",
      "addr.h": "地址",
      "addr.lines": "街道<br>城市",
      "reach.h": "联系厨房",
      "reach.ig": "店里自己在更的号。",
      "reach.line": "同一个号码，走 LINE。",
      "foot": "示例价格，不是在售菜单。",
      "cart.aria": "购物车",
      "cart.h": "你的单",
      "cart.close": "关闭",
      "cart.empty": "点价格，或者点加上。",
      "cart.total": "标了价的",
      "cart.note": "还没付款。",
      "cart.send": "送出订单",
      "cart.more": "继续看",
      "cart.less": "少",
      "cart.moreQty": "多",
      "info.h": "你的桌子",
      "info.name": "名字",
      "info.guests": "几位",
      "info.note": "备注",
      "info.picked": "已选",
      "info.back": "返回",
      "info.preview": "预览",
      "preview.aria": "订单预览",
      "preview.sub": "订单预览",
      "preview.close": "关掉",
      "toast": "已送出 ✓✓",
      "add": "加上",
      "price.ask": "问价",
      "price.suffix": " 泰铢",
      "msg.title": "预点 示例厨房",
      "msg.name": "名字：",
      "msg.guests": "几位：",
      "msg.note": "备注：",
      "msg.none": "无",
      "msg.priced": "标了价的：",
      "msg.service": "",
      "msg.unpaid": "还没付款。",
      "dish.plate.name": "示例主菜",
      "dish.plate.sub": "House plate",
      "dish.plate.desc": "换成菜单上印的那句。不要自己编价格。",
      "dish.plate.alt": "主菜图片占位",
      "dish.soup.name": "示例汤",
      "dish.soup.sub": "House soup",
      "dish.soup.desc": "文字一行。点价格或点加上。",
      "dish.water.name": "水",
      "dish.water.sub": "Water",
      "dish.water.desc": "纸上没有一个价的时候，用问价。"
    }
  };

  var lang = "en";
  function t(key) {
    var pack = dict[lang] || dict.en;
    if (pack[key] != null && pack[key] !== "") return pack[key];
    if (dict.en[key] != null) return dict.en[key];
    return "";
  }
  function dishName(id) {
    var local = t("dish." + id + ".name");
    var en = dict.en["dish." + id + ".name"] || local;
    if (!local) return en;
    if (lang === "en" || local === en) return local;
    return local + " (" + en + ")";
  }
  function apply() {
    document.documentElement.lang = lang === "zh" ? "zh-Hans" : lang;
    document.title = t("doc.title");
    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      var value = t(el.getAttribute("data-i18n"));
      if (el.hasAttribute("data-i18n-html")) el.innerHTML = value;
      else el.textContent = value;
    });
    document.querySelectorAll("[data-i18n-alt]").forEach(function (el) {
      el.alt = t(el.getAttribute("data-i18n-alt"));
    });
    document.querySelectorAll("[data-i18n-aria]").forEach(function (el) {
      el.setAttribute("aria-label", t(el.getAttribute("data-i18n-aria")));
    });
    document.querySelectorAll("[data-baht]").forEach(function (el) {
      var raw = el.getAttribute("data-baht");
      el.textContent = raw === "ask" ? t("price.ask") : raw + t("price.suffix");
    });
    document.querySelectorAll("[data-set-lang]").forEach(function (btn) {
      var on = btn.getAttribute("data-set-lang") === lang;
      btn.classList.toggle("is-on", on);
      btn.setAttribute("aria-pressed", on ? "true" : "false");
    });
    try { localStorage.setItem(STORE, lang); } catch (err) { /* ignore */ }
    if (window.chowRerender) window.chowRerender();
  }
  function setLang(next) {
    if (!dict[next]) return;
    lang = next;
    apply();
  }
  document.querySelectorAll("[data-set-lang]").forEach(function (btn) {
    btn.addEventListener("click", function () { setLang(btn.getAttribute("data-set-lang")); });
  });
  try {
    var saved = localStorage.getItem(STORE);
    if (saved && dict[saved]) lang = saved;
  } catch (err) { /* ignore */ }
  window.chowT = t;
  window.chowDishName = dishName;
  apply();
})();
