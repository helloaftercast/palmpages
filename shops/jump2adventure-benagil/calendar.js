(function () {
  var root = document.querySelector("[data-availability]");
  if (!root) return;

  var daysEl = root.querySelector("[data-cal-days]");
  var slotsEl = root.querySelector("[data-cal-slots]");
  var updatedEl = root.querySelector("[data-cal-updated]");
  var statusEl = root.querySelector("[data-cal-status]");
  var data = {
    source: "manual",
    timezone: "Europe/Lisbon",
    slots: ["09:30", "14:00"],
    updatedAt: "",
    busy: []
  };
  var busySet = Object.create(null);
  var selectedDay = "";
  var DAYS = 14;
  var LEAD_MIN = 90;

  function lang() {
    return (window.getPpLang && window.getPpLang()) || document.documentElement.getAttribute("data-lang") || "en";
  }

  function isPt() {
    return lang() === "pt";
  }

  function addDays(ymd, n) {
    var bits = ymd.split("-");
    var d = new Date(Date.UTC(+bits[0], +bits[1] - 1, +bits[2] + n));
    return d.toISOString().slice(0, 10);
  }

  function lisbonNowParts() {
    var parts = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Europe/Lisbon",
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
    return new Intl.DateTimeFormat(isPt() ? "pt-PT" : "en-GB", {
      weekday: "short",
      timeZone: "UTC"
    }).format(d);
  }

  function monthDay(ymd) {
    var bits = ymd.split("-");
    var d = new Date(Date.UTC(+bits[0], +bits[1] - 1, +bits[2]));
    return new Intl.DateTimeFormat(isPt() ? "pt-PT" : "en-GB", {
      day: "numeric",
      month: "short",
      timeZone: "UTC"
    }).format(d);
  }

  function slotLabel(slot, taken) {
    var name = slot === "09:30"
      ? (isPt() ? "Manhã" : "Morning")
      : (isPt() ? "Tarde" : "Afternoon");
    if (taken) {
      return isPt() ? name + " · ocupado" : name + " · taken";
    }
    return name + " · " + slot;
  }

  function formatUpdated(iso) {
    if (!iso) return "";
    try {
      return new Intl.DateTimeFormat(isPt() ? "pt-PT" : "en-GB", {
        timeZone: "Europe/Lisbon",
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
      timezone: next.timezone || "Europe/Lisbon",
      slots: next.slots && next.slots.length ? next.slots : ["09:30", "14:00"],
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
    var chip = daysEl && daysEl.querySelector('[data-day="' + day + '"]');
    if (chip && chip.scrollIntoView) {
      chip.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  }

  function render() {
    if (!daysEl || !slotsEl) return;
    var now = lisbonNowParts();
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
      md.textContent = day === now.ymd ? (isPt() ? "Hoje" : "Today") : monthDay(day);
      btn.appendChild(wd);
      btn.appendChild(md);
      btn.addEventListener("click", function () { pickDay(day); });
      li.appendChild(btn);
      daysEl.appendChild(li);
    });

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
      empty.textContent = isPt()
        ? "Este dia já não tem saída. Deslizem para outro."
        : "No launch left this day. Scroll to another.";
      slotsEl.appendChild(empty);
    }

    if (statusEl) {
      if (!data.busy.length) {
        statusEl.textContent = isPt()
          ? "Deslizem os dias para cima. Manhã 09:30, tarde 14:00. Ainda não há saídas marcadas como ocupadas. Não é o Peek."
          : "Scroll the days. Morning 09:30, afternoon 14:00. None marked taken. Not Peek.";
      } else {
        statusEl.textContent = isPt()
          ? "Deslizem os dias para cima. Cinzento = essa saída parece ocupada. Não é em tempo real."
          : "Scroll the days. Grey = that launch looks taken. Not live.";
      }
    }

    if (updatedEl) {
      var when = formatUpdated(data.updatedAt);
      var source = data.source === "ical"
        ? (isPt() ? "Lido de um calendário exportado." : "Read from a calendar export.")
        : (isPt() ? "Marcado à mão." : "Marked by hand.");
      updatedEl.textContent = when
        ? (isPt()
          ? source + " Última nota: " + when + " (Lisboa). Confirmem no WhatsApp."
          : source + " Last marked: " + when + " Lisbon. Confirm on WhatsApp.")
        : (isPt()
          ? source + " Confirmem no WhatsApp."
          : source + " Confirm on WhatsApp.");
    }
  }

  function load() {
    var local = root.getAttribute("data-availability") || "availability.json";
    var api = root.getAttribute("data-availability-api");
    var req = api
      ? fetch(api).then(function (res) { return res.ok ? res.json() : Promise.reject(); }).catch(function () {
        return fetch(local).then(function (res) { return res.json(); });
      })
      : fetch(local).then(function (res) { return res.json(); });
    req.then(applyData).catch(function () {
      if (statusEl) {
        statusEl.textContent = isPt()
          ? "Não foi possível carregar as saídas marcadas. Perguntem no WhatsApp."
          : "Could not load marked launches. Ask on WhatsApp.";
      }
      render();
    });
  }

  window.addEventListener("pp-lang", render);
  load();
})();
