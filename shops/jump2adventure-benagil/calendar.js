(function () {
  var root = document.querySelector("[data-availability]");
  if (!root) return;

  var daysEl = root.querySelector("[data-cal-days]");
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

  function lang() {
    return (window.getPpLang && window.getPpLang()) || document.documentElement.getAttribute("data-lang") || "en";
  }

  function isPt() {
    return lang() === "pt";
  }

  function lisbonNow() {
    var parts = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Europe/Lisbon",
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    }).formatToParts(new Date());
    var get = function (type) {
      return (parts.find(function (p) { return p.type === type; }) || {}).value;
    };
    return get("year") + "-" + get("month") + "-" + get("day");
  }

  function addDays(ymd, n) {
    var bits = ymd.split("-");
    var d = new Date(Date.UTC(+bits[0], +bits[1] - 1, +bits[2] + n));
    return d.toISOString().slice(0, 10);
  }

  var LEAD_MIN = 90;

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

  function weekday(ymd) {
    var bits = ymd.split("-");
    var d = new Date(Date.UTC(+bits[0], +bits[1] - 1, +bits[2]));
    return new Intl.DateTimeFormat(isPt() ? "pt-PT" : "en-GB", {
      weekday: "short",
      timeZone: "UTC"
    }).format(d);
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

  function dayTaken(day) {
    return data.slots.every(function (slot) { return isBusy(day, slot); });
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

  function render() {
    if (!daysEl) return;
    var now = lisbonNowParts();
    var today = now.ymd;
    daysEl.innerHTML = "";
    for (var i = 0; i < 12; i += 1) {
      var day = addDays(today, i);
      var li = document.createElement("li");
      li.className = "launch-cal-day" + (dayTaken(day) ? " is-taken" : "");
      var head = document.createElement("p");
      head.className = "launch-cal-date";
      head.textContent = weekday(day) + " " + day;
      li.appendChild(head);
      var row = document.createElement("div");
      row.className = "launch-cal-slots";
      data.slots.forEach(function (slot) {
        if (day === today && slotMinutes(slot) < now.minutes) return;
        var taken = isBusy(day, slot);
        var btn = document.createElement("button");
        btn.type = "button";
        btn.className = "launch-cal-slot" + (taken ? " is-taken" : "");
        btn.textContent = taken
          ? (isPt() ? slot + " ocupado" : slot + " taken")
          : slot;
        btn.disabled = taken;
        if (!taken) {
          btn.addEventListener("click", (function (pickedDay, pickedSlot) {
            return function () { setForm(pickedDay, pickedSlot); };
          })(day, slot));
        }
        row.appendChild(btn);
      });
      if (!row.childNodes.length) continue;
      li.appendChild(row);
      daysEl.appendChild(li);
    }

    if (statusEl) {
      if (!data.busy.length) {
        statusEl.textContent = isPt()
          ? "Ainda não há saídas marcadas como ocupadas. Isto é uma nota, não lugares livres. 09:30 e 14:00 saem se o mar deixar."
          : "No launches marked taken. This is a note, not remaining seats. 09:30 and 14:00 still go out if the sea allows.";
      } else {
        statusEl.textContent = isPt()
          ? "Cinzento = essa saída parece ocupada. Não é em tempo real, não são lugares livres."
          : "Grey = that launch looks taken. Not live, not remaining seats.";
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
