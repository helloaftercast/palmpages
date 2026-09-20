import { publicAvailability } from "../_lib/busy-from-ical.js";

var SHOP = /^[a-z0-9][a-z0-9-]{0,62}$/;

function envKey(shop) {
  return "ICAL_URL_" + shop.toUpperCase().replace(/-/g, "_");
}

function json(data, status, maxAge) {
  return new Response(JSON.stringify(data), {
    status: status || 200,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "public, max-age=" + (maxAge == null ? 900 : maxAge),
      "x-robots-tag": "noindex"
    }
  });
}

export async function onRequestGet(context) {
  var shop = context.params.shop;
  if (!SHOP.test(shop)) return json({ error: "unknown shop" }, 404, 60);

  var icalUrl = context.env && context.env[envKey(shop)];
  if (icalUrl) {
    try {
      var icsRes = await fetch(icalUrl, { redirect: "follow" });
      if (!icsRes.ok) return json({ error: "calendar unavailable" }, 502, 60);
      var ics = await icsRes.text();
      return json(publicAvailability(ics, { shop: shop }));
    } catch (err) {
      return json({ error: "calendar unavailable" }, 502, 60);
    }
  }

  if (context.env && context.env.ASSETS) {
    return context.env.ASSETS.fetch(
      new URL("/shops/" + shop + "/availability.json", context.request.url)
    );
  }
  return json({ error: "no calendar" }, 404, 60);
}
