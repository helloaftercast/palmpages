/**
 * Turn an iCal feed into busy dates/slots only.
 * Drops SUMMARY, DESCRIPTION, ATTENDEE, URL, and any other guest text.
 */
var SLOT_WINDOWS = {
  "09:30": [9 * 60, 11 * 60],
  "14:00": [13 * 60, 16 * 60]
};

function unfold(text) {
  return String(text || "").replace(/\r\n/g, "\n").replace(/\n[ \t]/g, "");
}

function field(block, name) {
  var re = new RegExp("^" + name + "(;[^:]*)?:(.*)$", "im");
  var match = unfold(block).match(re);
  if (!match) return null;
  return { params: match[1] || "", value: match[2].trim() };
}

function isDateValue(parsed) {
  return /VALUE=DATE/i.test(parsed.params || "") || /^\d{8}$/.test(parsed.value);
}

function ymdFromDate(value) {
  return value.slice(0, 4) + "-" + value.slice(4, 6) + "-" + value.slice(6, 8);
}

function lisbonParts(date) {
  var parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Lisbon",
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
  return {
    ymd: get("year") + "-" + get("month") + "-" + get("day"),
    minutes: Number(get("hour")) * 60 + Number(get("minute"))
  };
}

function parseStamp(value) {
  var m = String(value || "").match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})?(Z)?$/);
  if (!m) return null;
  if (m[7] === "Z") return lisbonParts(new Date(Date.UTC(+m[1], +m[2] - 1, +m[3], +m[4], +m[5], +(m[6] || 0))));
  return {
    ymd: m[1] + "-" + m[2] + "-" + m[3],
    minutes: Number(m[4]) * 60 + Number(m[5])
  };
}

function addDays(ymd, n) {
  var bits = ymd.split("-");
  var d = new Date(Date.UTC(+bits[0], +bits[1] - 1, +bits[2] + n));
  return d.toISOString().slice(0, 10);
}

function daysInRange(startYmd, endYmdExclusive) {
  var out = [];
  var cur = startYmd;
  while (cur < endYmdExclusive) {
    out.push(cur);
    cur = addDays(cur, 1);
  }
  return out;
}

function slotForMinutes(mins, slots) {
  for (var i = 0; i < slots.length; i += 1) {
    var win = SLOT_WINDOWS[slots[i]];
    if (win && mins >= win[0] && mins < win[1]) return slots[i];
  }
  return null;
}

function eventsFromIcs(ics) {
  var raw = unfold(ics);
  var chunks = raw.split("BEGIN:VEVENT");
  var events = [];
  for (var i = 1; i < chunks.length; i += 1) {
    var block = chunks[i].split("END:VEVENT")[0];
    var start = field(block, "DTSTART");
    if (!start) continue;
    events.push({
      start: start,
      end: field(block, "DTEND")
    });
  }
  return events;
}

function busyFromIcal(ics, options) {
  var slots = (options && options.slots) || ["09:30", "14:00"];
  var busy = Object.create(null);

  function mark(key) {
    busy[key] = true;
  }

  eventsFromIcs(ics).forEach(function (ev) {
    if (isDateValue(ev.start)) {
      var startYmd = ymdFromDate(ev.start.value);
      var endYmd = ev.end && isDateValue(ev.end) ? ymdFromDate(ev.end.value) : addDays(startYmd, 1);
      daysInRange(startYmd, endYmd).forEach(mark);
      return;
    }
    var startLisbon = parseStamp(ev.start.value);
    if (!startLisbon) return;
    var endLisbon = ev.end && !isDateValue(ev.end) ? parseStamp(ev.end.value) : null;
    var overnight = endLisbon && (endLisbon.ymd > startLisbon.ymd || endLisbon.minutes - startLisbon.minutes >= 12 * 60);
    if (overnight && endLisbon) {
      daysInRange(startLisbon.ymd, endLisbon.ymd).forEach(mark);
      return;
    }
    var slot = slotForMinutes(startLisbon.minutes, slots);
    mark(slot ? startLisbon.ymd + "T" + slot : startLisbon.ymd);
  });

  return Object.keys(busy).sort();
}

function publicAvailability(ics, options) {
  var slots = (options && options.slots) || ["09:30", "14:00"];
  return {
    shop: (options && options.shop) || "",
    source: "ical",
    timezone: "Europe/Lisbon",
    slots: slots,
    updatedAt: new Date().toISOString(),
    busy: busyFromIcal(ics, { slots: slots })
  };
}

export { busyFromIcal, publicAvailability };
