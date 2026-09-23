# MASTER REPOSTS

A lightweight black Reel-style video website designed for deployment on GitHub Pages or other static hosting.

## Features

- Black full-page design
- Paginated feed: 2 videos per page (13 pages) with Previous Page / Next Page buttons at the foot of every page, deep-linkable via `#page=N`
- 9:16 Reel-style video containers
- 16:9 videos display using `object-fit: contain`
- No cropping of landscape videos
- 26 video slots (all source clips from the Masterreposts folder)
- Two blue buttons below every video
  - Watch on Sophon
  - Watch on Terabox
- Alternating play-gate configuration
- Odd-numbered videos use SmartLink A
- Even-numbered videos use SmartLink B
- Videos 3, 6, 9, 12, 15, 18 play with no SmartLink gate
- Session-based unlock state
- Clearly labelled Advertisement slots (native banner and 300×250)
- Adsterra Social Bar loaded once, before `</body>`
- First-party analytics: timezone/country proxy, device, referrer, engagement
- Impressions and clicks counted for every surface: SmartLink offer gates (impression when the gate is seen, click on tap), in-feed native and 300×250 iframes, the page-top native slot, the featured video slider (JS video ad), and VAST sponsored cards
- Only one video plays at a time
- Mobile responsive

## Folder Structure

```
masterreposts_package/
├── index.html
├── style.css
├── script.js
├── README.md
├── ads/
│   ├── native.html
│   └── banner-300x250.html
└── videos/
    ├── video1.mp4
    ├── video2.mp4
    ├── ...
    └── video26.mp4
```

## Adding Videos

Put your MP4 files inside the `videos` folder.

The JavaScript expects:

- videos/video1.mp4
- videos/video2.mp4
- ...
- videos/video26.mp4

You can rename or change the list inside `script.js`.

## Play-Gate Logic

The configured logic is:

| Video | SmartLink Group |
|---|---|
| Odd-numbered videos (1, 5, 7, 11, ...) | Odd |
| Even-numbered videos (2, 4, 8, 10, ...) | Even |
| 3, 6, 9, 12, 15, 18 | None (play overlay only) |

Flow:

1. Visitor sees a play overlay.
2. Visitor clicks the play button.
3. On gated videos, the overlay itself is a real link so the advertiser records the click, then the destination opens in a new tab.
4. The video is unlocked.
5. The video attempts to start playing.
6. The unlock is remembered for the current browser session.

The SmartLink offer is also counted as an impression the moment its play gate is at least 50% visible, once per video per session — before any click happens.

SmartLinks are not auto-opened on page load, scroll, autoplay, or timers. They open only from the play click, once per video per session. Videos 3, 4, 7, 8, 11, 12, ... (videoNumber % 4 is 0 or 3) skip the SmartLink and play immediately from the overlay.

## Ad schedule

Display slots repeat every 10 videos:

| After video | Slot |
|---|---|
| Page top | Native banner |
| 3, 13, 23 | 300×250 banner |
| 5, 15, 25 | Native banner |
| 8, 18 | 300×250 banner |

In-feed ads load inside isolated iframes (`ads/native.html`, `ads/banner-300x250.html`) so Adsterra `document.write` tags cannot replace the page. Impressions are counted only after the ad network actually renders content in the slot (never on mere iframe load), and slots that stay empty are hidden from the feed.

Clicks on the native and 300×250 slots are counted too: a capture-phase listener records same-origin anchor clicks inside the wrapper document, and cross-origin ad iframes (which swallow clicks) are detected via the window-blur/iframe-focus fallback. The fallback pages in `ads/` also post a `click` message to the parent.

With the paginated feed the schedule re-evaluates per page render; pages whose two videos trigger no scheduled slot get a 300×250 banner so every page stays monetized.

VAST sponsored cards are inserted after every sixth video and request their VAST tag only when the card is near the viewport. A failed tag request is retried on the next play intent (up to three attempts). VAST impressions and quartile events are sent as image-pixel GET requests after real playback events.

The masterreposts.xyz **300×250_1** zone is configured in `ads/banner-300x250.html`.

## Ad Placements

- Native banner: Adsterra container `e02a3877d8ff4a051ec557717047de62`
- 300×250: isolated iframe, labelled Advertisement
- Social Bar: official script immediately before `</body>`
- SmartLink: odd/even destinations from the play button, once per video per session (skipped on videos where videoNumber % 4 is 0 or 3: 3, 4, 7, 8, 11, 12, ...); impressions counted when the gate is seen, clicks on tap
- Featured video slider (Adsterra JS video ad): impression when the mounted player is ≥50% visible, clicks via capture listener + iframe-focus fallback
- VAST: lazy request near the viewport, user-initiated playback, GET image-pixel impressions and clicks

## Privacy / Crawler Blocking

The site is configured to stay out of search engines and link-preview platforms:

- `robots.txt` blocks all crawlers plus explicit Google/Bing/Yandex/DuckDuckGo/social crawler user agents.
- Every page carries `noindex, nofollow, noarchive, nosnippet, noimageindex` (page-top slot in `index.html`, both `ads/*.html` fallback pages, and `404.html`).
- No Open Graph or Twitter card tags are emitted, so messaging apps and social platforms have no title/description/thumbnail to preview — link shares show a bare URL only.

Notes and limits:

- GitHub Pages cannot send custom `X-Robots-Tag` HTTP headers; the meta tags above are the strongest signal available on static hosting.
- `robots.txt` is voluntary. Well-behaved crawlers obey it, but a non-conforming bot can still fetch pages directly. It also cannot hide content from anyone who already has the URL.
- The ad networks' own verification crawlers must be able to read the pages or placements risk being flagged; keep `index.html` reachable for them.
- If the repository is public, the repo itself (including everything in `videos/`, `posters/`, and `site thumbnail/`) is browsable and clonable regardless of robots rules. The `site thumbnail/` image is no longer referenced anywhere and can be deleted from the repo if it should not be public.

## Pagination

The feed shows 2 videos per page (13 pages for 26 videos). Previous Page / Next Page buttons plus numbered page buttons (1–13, current page highlighted) sit at the foot of every page with a "Page N of 13" status underneath. The current page is stored in the URL hash (`#page=3`) so the browser back/forward buttons work and a page can be linked or bookmarked. A featured-slider tap for a video on another page navigates there and highlights the reel; page changes scroll back to the top and pause any playing video.

## Deploying to GitHub Pages

1. Create a new GitHub repository.
2. Upload all files while preserving the folder structure.
3. Go to repository Settings.
4. Open Pages.
5. Deploy from the main branch.
6. Connect your custom domain through your DNS provider.

Your intended domain:

`masterreposts.xyz`

## Technical Notes

### Why object-fit: contain?

The site uses:

```css
object-fit: contain;
```

This means:

- Vertical 9:16 videos fit naturally.
- Landscape 16:9 videos remain fully visible.
- Videos are not cropped.

Landscape videos will have unused black space above/below or around them inside the vertical container when necessary.

## Before Production

Test:

- All 26 video URLs
- Mobile layout
- Desktop layout
- Custom domain HTTPS
- GitHub Pages deployment
- Ad provider policy compliance
- Browser popup blocking behavior
- Page loading speed
