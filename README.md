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
- `robots.txt`, `sitemap.xml`: crawler instructions and the list of pages for search engines
- `styles.css`, `script.js`, `assets/`

## Search (SEO) upkeep

- The main address is `https://www.muyiwanafiu.com`. Every page has a `<link rel="canonical">` to its clean address (`/`, `/resources`, `/teenagers-worship-experience`), and `vercel.json` sends visitors from `muyiwa-nafiu.vercel.app` to the custom domain.
- Link between pages with clean paths such as `/resources` or `/#book`, not `resources.html` or `index.html#book`. The `.html` versions only redirect.
- When you add a page, add its address to `sitemap.xml` and give it its own `<title>`, meta description, canonical and `og:url`. Update `<lastmod>` when a page changes a lot.
- Structured data (JSON-LD) sits at the end of each `<head>`. When Muyiwa opens a new profile (Audiomack, Boomplay, LinkedIn), add it to the Person `sameAs` list in `index.html`. Add a `MusicAlbum` entry for each new album.
- `assets/og-image.jpg` (1200 × 630) is the picture shown when the site is shared on WhatsApp, Facebook or X.
- Video tiles carry the real YouTube title in `data-title`, `aria-label` and the thumbnail `alt`. Copy that pattern for new videos.
