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
- Play control plays the video only
- Clearly labelled Advertisement slots (native banner and 300×250)
- Optional labelled Sponsored / Discover link, separate from play and watch buttons
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

## Traffic protection

Built-in rules:

1. Never auto-open SmartLinks. There is no `window.open` on page load, scroll, autoplay, timers, or random clicks.
2. The play button plays the video. It does not open an advertisement.
3. Ads sit in labelled slots, separated from content.
4. SmartLinks are only used on a clearly labelled **Sponsored · Discover** control.

Visitor flow:

Visitor arrives → native banner → video plays normally → labelled ad slot → optional labelled sponsored link → next video

## Ad schedule

Repeats every 10 videos:

| After video | Slot |
|---|---|
| Page top | Native banner |
| 3, 13, 23 | 300×250 banner |
| 5, 15, 25 | Native banner |
| 8, 18 | 300×250 banner |

In-feed ads load inside isolated iframes (`ads/native.html`, `ads/banner-300x250.html`) so Adsterra `document.write` tags cannot replace the page.

Paste the masterreposts.xyz **300×250_1 Get Code** key into `ads/banner-300x250.html` if the current key placeholder still needs replacing.

## Ad Placements

- Native banner: Adsterra container `e02a3877d8ff4a051ec557717047de62`
- 300×250: isolated iframe, labelled Advertisement
- SmartLink: labelled Sponsored / Discover only

Do not:

- Automatically trigger redirects
- Disguise advertisements as browser or video controls
- Count play clicks as ad clicks

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
