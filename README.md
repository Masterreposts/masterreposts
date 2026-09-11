# MASTER REPOSTS

A lightweight black Reel-style video website designed for deployment on GitHub Pages or other static hosting.

## Features

- Black full-page design
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
3. For gated videos, the play control is a real link so the advertiser records the click, then the destination opens in a new tab.
4. The video is unlocked.
5. The video attempts to start playing.
6. The unlock is remembered for the current browser session.

SmartLinks are not auto-opened on page load, scroll, autoplay, or timers. They open only from the play click, once per video per session. Videos 3, 6, 9, 12, 15 and 18 skip the SmartLink and play immediately from the overlay.

## Ad schedule

Display slots repeat every 10 videos:

| After video | Slot |
|---|---|
| Page top | Native banner |
| 3, 13, 23 | 300×250 banner |
| 5, 15, 25 | Native banner |
| 8, 18 | 300×250 banner |

In-feed ads load inside isolated iframes (`ads/native.html`, `ads/banner-300x250.html`) so Adsterra `document.write` tags cannot replace the page.

VAST sponsored cards are inserted after every sixth video and request their VAST tag only when the card is near the viewport. VAST impressions and quartile events are sent as image-pixel GET requests after real playback events.

The masterreposts.xyz **300×250_1** zone is configured in `ads/banner-300x250.html`.

## Ad Placements

- Native banner: Adsterra container `e02a3877d8ff4a051ec557717047de62`
- 300×250: isolated iframe, labelled Advertisement
- Social Bar: official script immediately before `</body>`
- SmartLink: odd/even destinations from the play button, once per video per session (skipped on videos 3, 6, 9, 12, 15, 18)
- VAST: lazy request near the viewport, user-initiated playback, GET image-pixel impressions and clicks

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
