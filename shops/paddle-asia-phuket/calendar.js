(function () {
  var root = document.querySelector("[data-availability]");
  if (!root) return;

  var daysEl = root.querySelector("[data-cal-days]");
  var slotsEl = root.querySelector("[data-cal-slots]");
  var updatedEl = root.querySelector("[data-cal-updated]");
  var statusEl = root.querySelector("[data-cal-status]");
  var fallback = (root.getAttribute("data-slots") || "morning,afternoon").split(",");
  var data = {
    source: "manual",
    timezone: "Asia/Bangkok",
    slots: fallback,
    updatedAt: "",
    busy: []
  };
  var busySet = Object.create(null);
  var selectedDay = "";
  var DAYS = 14;
  var LEAD_MIN = 90;
  var NAMES = {
    "09:30": ["Morning", "เช้า"],
    "14:00": ["Afternoon", "บ่าย"],
    morning: ["Morning", "เช้า"],
    afternoon: ["Afternoon", "บ่าย"],
    sunrise: ["Sunrise", "พระอาทิตย์ขึ้น"],
    sunset: ["Sunset", "พระอาทิตย์ตก"]
  };

  function lang() {
    return (window.getPpLang && window.getPpLang()) || document.documentElement.getAttribute("data-lang") || "en";
  }

  function isTh() {
    return lang() === "th";
  }

  function addDays(ymd, n) {
    var bits = ymd.split("-");
    var d = new Date(Date.UTC(+bits[0], +bits[1] - 1, +bits[2] + n));
    return d.toISOString().slice(0, 10);
  }

  function bangkokNowParts() {
    var parts = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Asia/Bangkok",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false
    }).formatToParts(new Date());
    var get = function (type) {
      return (parts.find(function (p) { return p.type === type; }) || {}).value;
    };
    return {
      ymd: get("year") + "-" + get("month") + "-" + get("day"),
      minutes: Number(get("hour")) * 60 + Number(get("minute")) + LEAD_MIN
    };
  }

  function slotMinutes(hhmm) {
    var bits = hhmm.split(":");
    return Number(bits[0]) * 60 + Number(bits[1]);
  }

  function markBusy(list) {
    busySet = Object.create(null);
    (list || []).forEach(function (key) {
      busySet[key] = true;
    });
  }

  function isBusy(day, slot) {
    return Boolean(busySet[day] || busySet[day + "T" + slot]);
  }

  function slotGone(day, slot, now) {
    if (String(slot).indexOf(":") === -1) return false;
    return day === now.ymd && slotMinutes(slot) < now.minutes;
  }

  function openSlots(day, now) {
    return data.slots.filter(function (slot) {
      return !slotGone(day, slot, now) && !isBusy(day, slot);
    });
  }

  function visibleDays(now) {
    var list = [];
    for (var i = 0; i < DAYS; i += 1) {
      var day = addDays(now.ymd, i);
      if (data.slots.some(function (slot) { return !slotGone(day, slot, now); })) {
        list.push(day);
      }
    }
    return list;
  }

  function weekday(ymd) {
    var bits = ymd.split("-");
    var d = new Date(Date.UTC(+bits[0], +bits[1] - 1, +bits[2]));
    return new Intl.DateTimeFormat(isTh() ? "th-TH" : "en-GB", {
      weekday: "short",
      timeZone: "UTC"
    }).format(d);
  }

  function monthDay(ymd) {
    var bits = ymd.split("-");
    var d = new Date(Date.UTC(+bits[0], +bits[1] - 1, +bits[2]));
    return new Intl.DateTimeFormat(isTh() ? "th-TH" : "en-GB", {
      day: "numeric",
      month: "short",
      timeZone: "UTC"
    }).format(d);
  }

  function slotName(slot) {
    var pair = NAMES[slot];
    if (!pair) return slot;
    return isTh() ? pair[1] : pair[0];
  }

  function slotLabel(slot, taken) {
    var name = slotName(slot);
    if (taken) return isTh() ? name + " · เต็ม" : name + " · taken";
    if (String(slot).indexOf(":") !== -1) return name + " · " + slot;
    return name;
  }

  function confirmLine() {
    return isTh()
      ? (root.getAttribute("data-confirm-th") || "ยืนยันกับ Dave")
      : (root.getAttribute("data-confirm-en") || "Confirm with Dave.");
  }

  function formatUpdated(iso) {
    if (!iso) return "";
    try {
      return new Intl.DateTimeFormat(isTh() ? "th-TH" : "en-GB", {
        timeZone: "Asia/Bangkok",
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit"
      }).format(new Date(iso));
    } catch (err) {
      return iso;
    }
  }

  function applyData(next) {
    if (!next || !Array.isArray(next.busy)) return;
    data = {
      source: next.source || "manual",
      timezone: next.timezone || "Asia/Bangkok",
      slots: next.slots && next.slots.length ? next.slots : fallback,
      updatedAt: next.updatedAt || "",
      busy: next.busy
    };
    markBusy(data.busy);
    window.ppAvailability = data;
    window.dispatchEvent(new CustomEvent("pp-availability", { detail: data }));
    render();
  }

  function setForm(day, slot) {
    var form = document.querySelector("[data-form]");
    if (!form || !form.day || !form.slot) return;
    form.day.value = day;
    form.day.dispatchEvent(new Event("change"));
    if (!isBusy(day, slot)) form.slot.value = slot;
    var ticket = document.getElementById("ticket") || document.getElementById("book");
    if (ticket) ticket.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function pickDay(day) {
    selectedDay = day;
    render();
  }

  function daysWrap() {
    return daysEl && daysEl.closest(".launch-cal-days-wrap");
  }

  function railEl() {
    return root.querySelector("[data-cal-rail]");
  }

  function dayStep() {
    var wrap = daysWrap();
    if (!wrap) return 0;
    var first = wrap.querySelector("li");
    var next = first && first.nextElementSibling;
    if (first && next) return next.offsetTop - first.offsetTop;
    return first ? first.offsetHeight : 0;
  }

  function syncRail() {
    var wrap = daysWrap();
    var rail = railEl();
    if (!wrap || !rail) return;
    var max = Math.max(0, wrap.scrollHeight - wrap.clientHeight);
    var canUp = wrap.scrollTop > 3;
    var canDown = wrap.scrollTop < max - 3;
    rail.classList.toggle("is-can-up", canUp);
    rail.classList.toggle("is-can-down", canDown);
    var up = rail.querySelector("[data-cal-up]");
    var down = rail.querySelector("[data-cal-down]");
    if (up) {
      up.hidden = !canUp;
      up.setAttribute("aria-label", isTh() ? "วันก่อนหน้า" : "Earlier days");
    }
    if (down) {
      down.hidden = !canDown;
      down.setAttribute("aria-label", isTh() ? "วันถัดไป" : "Later days");
    }
  }

  function stepDays(dir) {
    var wrap = daysWrap();
    var step = dayStep();
    if (!wrap || !step) return;
    var max = wrap.scrollHeight - wrap.clientHeight;
    glide(wrap, Math.max(0, Math.min(max, wrap.scrollTop + dir * step)), 320);
    window.setTimeout(syncRail, 330);
  }

  function easeOut(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  function glide(el, to, ms) {
    var from = el.scrollTop;
    var dist = to - from;
    if (!dist) return;
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.scrollTop = to;
      return;
    }
    var start = performance.now();
    function frame(now) {
      var t = Math.min(1, (now - start) / ms);
      el.scrollTop = from + dist * easeOut(t);
      if (t < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  function bindDayScroll() {
    var wrap = daysWrap();
    var rail = railEl();
    if (!wrap || wrap.dataset.bound === "1") return;
    wrap.dataset.bound = "1";
    var locked = false;
    function markMoved() {
      if (rail) rail.classList.add("has-moved");
      syncRail();
    }
    wrap.addEventListener("scroll", syncRail, { passive: true });
    wrap.addEventListener("wheel", function (e) {
      if (!e.deltaY) return;
      e.preventDefault();
      if (locked) return;
      var step = dayStep();
      if (!step) return;
      locked = true;
      var max = wrap.scrollHeight - wrap.clientHeight;
      var next = Math.max(0, Math.min(max, wrap.scrollTop + (e.deltaY > 0 ? step : -step)));
      glide(wrap, next, 320);
      markMoved();
      window.setTimeout(function () { locked = false; }, 300);
    }, { passive: false });
    if (rail) {
      var up = rail.querySelector("[data-cal-up]");
      var down = rail.querySelector("[data-cal-down]");
      if (up) up.addEventListener("click", function () { stepDays(-1); markMoved(); });
      if (down) down.addEventListener("click", function () { stepDays(1); markMoved(); });
    }
    syncRail();
  }

  function render() {
    if (!daysEl || !slotsEl) return;
    var wrap = daysWrap();
    var keepY = wrap ? wrap.scrollTop : 0;
    var now = bangkokNowParts();
    var days = visibleDays(now);
    if (days.indexOf(selectedDay) === -1) {
      selectedDay = days[0] || "";
    }

    daysEl.innerHTML = "";
    days.forEach(function (day) {
      var li = document.createElement("li");
      var btn = document.createElement("button");
      btn.type = "button";
      btn.setAttribute("data-day", day);
      btn.className = "launch-cal-day" + (day === selectedDay ? " is-on" : "") + (openSlots(day, now).length ? "" : " is-taken");
      var wd = document.createElement("b");
      wd.textContent = weekday(day);
      var md = document.createElement("span");
      md.textContent = day === now.ymd ? (isTh() ? "วันนี้" : "Today") : monthDay(day);
      btn.appendChild(wd);
      btn.appendChild(md);
      btn.addEventListener("click", function () { pickDay(day); });
      li.appendChild(btn);
      daysEl.appendChild(li);
    });
    if (wrap) wrap.scrollTop = keepY;
    bindDayScroll();
    syncRail();

    slotsEl.innerHTML = "";
    if (!selectedDay) return;
    data.slots.forEach(function (slot) {
      if (slotGone(selectedDay, slot, now)) return;
      var taken = isBusy(selectedDay, slot);
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "launch-cal-slot" + (taken ? " is-taken" : "");
      btn.textContent = slotLabel(slot, taken);
      btn.disabled = taken;
      if (!taken) {
        btn.addEventListener("click", function () { setForm(selectedDay, slot); });
      }
      slotsEl.appendChild(btn);
    });
    if (!slotsEl.childNodes.length) {
      var empty = document.createElement("p");
      empty.className = "launch-cal-empty";
      empty.textContent = isTh()
        ? "วันนี้ไม่มีรอบแล้ว เลื่อนไปวันอื่น"
        : "No launch left this day. Scroll to another.";
      slotsEl.appendChild(empty);
    }

    if (statusEl) {
      if (!data.busy.length) {
        statusEl.textContent = isTh()
          ? (root.getAttribute("data-empty-th") || "เลื่อนดูวันได้ ยังไม่มีรอบที่ทำเครื่องหมายว่าเต็ม ไม่ใช่ปฏิทินสด")
          : (root.getAttribute("data-empty-en") || "Scroll the days. None marked taken. Not live.");
      } else {
        statusEl.textContent = isTh()
          ? "เลื่อนดูวัน สีเทา = รอบนั้นดูเหมือนเต็ม ไม่ใช่ระบบสด"
          : "Scroll the days. Grey = that launch looks taken. Not live.";
      }
    }

    if (updatedEl) {
      var when = formatUpdated(data.updatedAt);
      var source = isTh() ? "ทำเครื่องหมายด้วยมือ" : "Marked by hand.";
      updatedEl.textContent = when
        ? source + (isTh() ? " บันทึกล่าสุด: " + when + " (กรุงเทพฯ) " : " Last marked: " + when + " Bangkok. ") + confirmLine()
        : source + " " + confirmLine();
    }
  }

  function load() {
    var local = root.getAttribute("data-availability") || "availability.json";
    fetch(local).then(function (res) { return res.json(); }).then(applyData).catch(function () {
      if (statusEl) {
        statusEl.textContent = isTh()
          ? "โหลดรอบที่ทำเครื่องหมายไม่ได้"
          : "Could not load marked launches.";
      }
      render();
    });
  }

  window.addEventListener("pp-lang", render);
  load();
})();
