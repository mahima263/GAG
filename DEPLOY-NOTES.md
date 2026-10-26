# Annual Giving — clean build (deploy notes)

Rebuilt from `test page.zip` on 26 Oct 2026. Same design, content and behaviour; the code underneath is
consolidated and everything the pages don't use has been removed. The site is fully static — no PHP, no
build step, no external CSS/JS except Google Tag Manager and the YouTube embed.

## Folder layout

```
annualgiving/
├─ index.html                 Annual Giving page (hero + donation form, about/film, progress, pillars,
│                             stats, stories, rewards, voices, ways to contribute, closing, footer)
├─ wallofdonors.html          Wall of Donors
├─ DEPLOY-NOTES.md            this file
└─ assets/
   ├─ css/
   │  ├─ fonts.css            @font-face for Lato + Libre Baskerville (self-hosted)
   │  ├─ annual-giving.css    the whole site stylesheet (17 numbered sections, one per page block)
   │  └─ wall.css             Wall of Donors only
   ├─ js/
   │  ├─ site.js              shared header: scrolled shadow, mobile nav, hash scroll, scrollspy
   │  ├─ annual-giving.js     index page: animations, progress meter, film, accordion, sliders, donation form
   │  ├─ donors.js            donor names (edit this file to update the wall)
   │  └─ wall.js              Wall of Donors behaviour
   ├─ fonts/                  8 × .woff2
   ├─ img/
   │  ├─ brand/               GTU_IITK logos (1x/2x/3x), IITKLogo.png (favicon + voices seal)
   │  ├─ icons/               pillar icons (spiral / bicycle / flower)
   │  ├─ hero/                hero-banner-drone.jpg (desktop), hero-banner-mobile-drone.jpg (≤ 991px)
   │  ├─ stories/             the 5 story photos
   │  ├─ testimonials/        the 4 alumni photos
   │  ├─ backgrounds/         closing-bg, support-bg, rewards-bg-faded, rewards-photo, stories-sketch
   │  └─ flags/               7 country flags (SVG) for the donation form
   ├─ docs/                   Annual Giving Report 2024-Final Oct 2025.pdf
   └─ vendor/                 bootstrap 5.3.8 (css+js), aos, swiper 11, gsap 3.12 + ScrollTrigger, purecounter
```

Image **file names are unchanged** — only the folders moved. Every path in the HTML/CSS has been updated.

## Where to edit things

| What | Where |
|---|---|
| Amount raised / contributors / goal | `index.html` → `#uniquegoal-raised data-raised`, `#ag-contrib-number data-count`, `#uniquegoal-goal data-goal` (₹) |
| USD rate for the meter | `assets/js/annual-giving.js` → `USD_RATE` (currently 95) |
| Payment-partner links per country | `assets/js/annual-giving.js` → `paymentLinks` |
| Modal step text per country | `assets/js/annual-giving.js` → `stepsFor()` |
| Donor names | `assets/js/donors.js` |
| Stories / voices / ways to contribute copy | `index.html` (plain HTML, one block per section) |
| Colours / fonts | `assets/css/annual-giving.css` → `:root` tokens at the top |
| Campaign film | `assets/js/annual-giving.js` → `VIDEO_ID` + the poster `<img>` in `index.html` |

## What was removed (not used by either page)

- `contribute.html` — an older standalone "Ways to Contribute" page. Nothing links to it any more (the content
  now lives in the Ways to Contribute accordion on `index.html`). Keep a copy on the server only if it has
  been shared publicly as its own URL.
- `assets/css/main.css` (2,600-line restaurant template; only the header/footer/nav rules were in use — those
  are now in `annual-giving.css`) and `assets/css/gtu-theme.css` (20 stacked "rev" layers — flattened).
- ~1,300 lines of inline `<style>` and ~900 lines of inline `<script>` in `index.html` — moved to the CSS/JS files.
- Vendor libraries never referenced: Bootstrap Icons, Isotope, imagesLoaded, php-email-form, plus all
  non-minified / `.map` / RTL / grid / reboot variants of Bootstrap. A second copy of Bootstrap and
  Font Awesome were being loaded from CDNs — gone (the 2 FA icons are inline SVG now).
- Google Fonts request for Roboto + Poppins (never used). Libre Baskerville is now self-hosted like Lato.
- `flag-icon-css` CDN — replaced by 7 local SVGs.
- Images: `CL_logo.png`, `assets/hero-banner-mobile.jpg` (overridden by the drone mobile banner),
  `testimonials/guidebook-donating-iitkfoundation.pdf` (not linked), `__MACOSX/` resource forks.
- `main.css` referenced `assets/img/bg/abstract-bg-4.webp`, which never existed — this was a 404 on every page load.
- The hidden "campaign film modal" markup + CSS + JS: the film plays inside the poster box (rev 16); the modal
  was never opened.

Result: 235 files / 30 MB → 61 files / 20 MB (12 MB of that is the Impact Report PDF).

## Small things that changed on purpose

- Hero text on tablets (521–991px) is now centred over the photo. In the old build a leftover
  `max-width: 520px` kept it in a left-aligned box; phones and desktop were already correct.
- Rewards section fallback colour (behind the campus photo) is now the light cream, not brown.
  Only visible if the photo fails to load.
- The LinkedIn footer link now points straight at the profile instead of through LinkedIn's `authwall` redirect URL.
- `<i class="mobile-nav-toggle">` is a real `<button>` now (keyboard accessible); same look.
- Form validation runs on the **Pay Now** click exactly as before (alerts for affiliation / amount / PAN / phone).

## ⚠ The India "Pay Now" form needs a server endpoint

`#donationForm` still POSTs to `https://iitk.ac.in/dora/annualgiving/` (fields: name, email, phone, pannumber,
roll_no, anonymous, currency, country, select_category, program, department, Year_of_Graduation, amount,
display_method, purpose, donationtime, recurring-frequency, time_end). With the PHP removed from the page,
**something on the server must still receive that POST and hand off to the payment gateway**. If the old
`index.php` is being deleted, either keep a separate handler (e.g. `pay.php`) and change the form `action`,
or point the action at whatever gateway URL DoRA IT provides. Donors outside India are unaffected (they go
straight to the partner sites).

## Deploying to the IITK server

1. Upload the **contents** of this folder to `/dora/annualgiving/` (so `index.html` sits directly in it).
2. Make sure permissions are readable by Apache: directories `755`, files `644`
   (`find . -type d -exec chmod 755 {} \; ; find . -type f -exec chmod 644 {} \;`).
3. Open `https://iitk.ac.in/dora/annualgiving/` and `…/wallofdonors.html`. No build or PHP needed.
4. Hard-refresh (Ctrl/Cmd+Shift+R) — the old page used `?v=` cache-busters; the new file names are different so
   the browser will fetch them fresh anyway.

## Diagnosing the HTTP 500

A 500 on a folder that only contains static files is almost always one of these — check in this order:

1. **A leftover `.htaccess`** in `/dora/annualgiving/` (or a parent folder) with a directive the server doesn't
   allow (`php_value`, `php_flag`, `Options`, `AddHandler`, `RewriteEngine` without mod_rewrite…). This is the
   #1 cause of "iitk.ac.in is currently unable to handle this request". Rename it to `.htaccess.bak` and reload.
   The clean build **ships no `.htaccess`** on purpose.
2. **A leftover `index.php`** (the old form handler) with a fatal error. Apache serves `index.php` before
   `index.html` if both exist. Rename it (or fix it) — see the form-endpoint note above.
3. **Permissions / ownership** — files uploaded as `600`/`700`, or owned by a user Apache can't read, under
   suEXEC/suPHP can produce a 500 rather than a 403.
4. **Error log** — the exact reason is always in Apache's error log. Ask the server admin for the last lines
   around the time of the request, e.g.

   ```
   sudo tail -n 100 /var/log/apache2/error.log        # Debian/Ubuntu
   sudo tail -n 100 /var/log/httpd/error_log          # RHEL/CentOS
   sudo tail -n 100 /var/log/apache2/iitk.ac.in-error.log   # if per-vhost logs are used
   ```
   Typical lines: `.htaccess: Invalid command 'php_value'…`, `PHP Fatal error: … in index.php`,
   `Permission denied: … .htaccess pemission denied`, `Premature end of script headers`.
5. To isolate the folder vs. the page, drop a one-line `test.html` ("ok") into the folder: if that also 500s,
   the problem is the folder/config (steps 1 & 3), not the page.

If you can send me the error-log lines or the contents of the `.htaccess` / `index.php` that are currently on the
server, I can tell you the exact fix.
