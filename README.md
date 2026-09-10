# PalmPages

Live domain: **https://palmpages.com**

Static one-page site for restaurant websites (draft-first, WhatsApp orders).

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

After deploy: submit `https://palmpages.com/sitemap.xml` in [Google Search Console](https://search.google.com/search-console) and Bing Webmaster Tools.

## Shop hit counts

Preview pages under `/shops/` ping a lightweight counter (once per browser session). Check totals at:

**https://palmpages.com/stats.html**

(Not linked from the homepage; `noindex`.)
