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

## Local preview

```bash
python3 -m http.server 8877
```

Open http://127.0.0.1:8877/
