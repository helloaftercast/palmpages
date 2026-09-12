# PalmPages

Live domain: **https://palmpages.com**

Static one-page site for restaurant and outdoor-operator websites (draft-first, WhatsApp orders/bookings).

Draft shop (noindex): [`/shops/jump2adventure-benagil/`](https://palmpages.com/shops/jump2adventure-benagil/) — Benagil kayak, EN/PT, WhatsApp booking.

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
