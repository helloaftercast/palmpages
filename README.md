# PalmPages

Live domain: **https://palmpages.com**

Static one-page site for restaurant and outdoor-operator websites (draft-first, WhatsApp orders/bookings).

Draft shop (noindex): [`/shops/jump2adventure-benagil/`](https://palmpages.com/shops/jump2adventure-benagil/) — Benagil kayak, EN/PT, WhatsApp booking.

## Booking checkout (product boundary)

**Default: WhatsApp.** The page writes the message. We do not take a card and we do not take a cut.

**Optional: their existing official widget.** Book may open Peek / Bókun / FareHarbor only if they already have that account, they send the official embed URL or snippet, and they say yes in writing. Then checkout stays on that platform (they still pay the platform). Paste-the-widget is inside the page price — do not quote a booking-system fee.

**Never:** Peek OCTO / Viator Supplier / Bókun or FareHarbor partner APIs; opening a new Peek / FH / Bókun account for them; remaining-seat counts; a calendar that looks live when it is not. Jump2 already has Peek — do not add FareHarbor.

On a shop page the switch is on `<body>`:

- `data-booking` `data-checkout="whatsapp"` — current Jump2
- `data-checkout="widget"` + `data-widget-url="https://…"` + `data-widget-signed-off="yes"` — only after they send the official embed

A Peek listing URL is not a widget. Leave the attributes empty until they send one.

## Availability calendar (display only)

Shop pages can show which days or launches **look taken**. They do not take the booking and they must not show remaining seats. No Peek / Viator / GetYourGuide API.

1. **Hand list (Jump2 now).** Edit [`shops/jump2adventure-benagil/availability.json`](shops/jump2adventure-benagil/availability.json). Put `YYYY-MM-DD` for a whole day, or `YYYY-MM-DDT09:30` / `YYYY-MM-DDT14:00` for one launch. Do not put guest names.
2. **iCal later.** Put the secret `.ics` URL in a Cloudflare env var `ICAL_URL_JUMP2ADVENTURE_BENAGIL` (see [`.dev.vars.example`](.dev.vars.example)). The Pages Function at `/availability/<shop>` fetches it server-side, drops names, and returns the same JSON. Never paste an iCal URL into HTML. iCal is a poor fit for kayak sold by seat — easy to mark a whole day wrong.
3. The page says **last marked**, not live. WhatsApp still confirms unless they signed off on an official widget.

```bash
node tools/ical-to-busy.mjs tools/fixtures/sample-bookings.ics jump2adventure-benagil
```

## Custom domain

1. Cloudflare → **Workers & Pages** → project **palmpages**
2. **Custom domains** → add `palmpages.com` and `www.palmpages.com`
3. Wait until both show **Active**

## Push updates

```bash
cd "/Users/tianzhong/创业看板/palmpages-site"
git add -A
git commit -m "Update site"
git push
```

## SEO

Already on the live site:

- Canonical, Open Graph, Twitter Card (`/assets/og.png`)
- JSON-LD: Organization + WebSite + WebPage + ProfessionalService + FAQPage
- `/sitemap.xml` and `/robots.txt` (draft shops under `/shops/` are `noindex`)
- Local-language landings (not English SEO pages):
  - [`/th/`](https://palmpages.com/th/) Thai: รับทำเว็บไซต์ร้านอาหาร, สั่งผ่าน LINE, สมุย / ภูเก็ต / กระบี่ / พัทยา / เชียงใหม่ / กรุงเทพ
  - [`/vi/`](https://palmpages.com/vi/) Vietnamese: thiết kế website nhà hàng, đặt món Zalo, Đà Nẵng / Hội An / Nha Trang / Phú Quốc / Đà Lạt / Sài Gòn
- `hreflang` en / th / vi / x-default on all three URLs

After deploy: resubmit `https://palmpages.com/sitemap.xml` in [Google Search Console](https://search.google.com/search-console). In GSC, set homepage targeting if asked; Thai/Vietnamese pages carry `lang` + `geo.region`.

## Traffic

Cloudflare Web Analytics is enabled site-wide (JS beacon). View pageviews, countries, and referrers in Cloudflare Dashboard → Analytics & Logs → Web Analytics → palmpages.com.

Tip: your own visits via US VPN show as United States; Thailand/Philippines hits are the real signal.
