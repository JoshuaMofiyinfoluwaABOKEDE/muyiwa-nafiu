# Muyiwa Nafiu — official site

Static site: plain HTML, CSS and JavaScript. There is no build step.

## Deploy on Vercel

1. In Vercel, choose **Add New → Project** and import `JoshuaMofiyinfoluwaABOKEDE/muyiwa-nafiu`.
2. Set **Framework Preset** to *Other*. Leave **Build Command** and **Output Directory** empty, and keep **Root Directory** as `./`.
3. Click **Deploy**.

Every push to `main` redeploys automatically. `vercel.json` turns on clean URLs (for example `/resources`) and caches the images.

## Files

- `index.html`: home page
- `resources.html`: the 50 teachings (each article can be linked as `/resources#article-slug`)
- `teenagers-worship-experience.html`: session videos and event photos
- `404.html`: page shown for broken links
- `styles.css`, `script.js`, `assets/`
