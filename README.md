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
- Session-based unlock state
- Only one video plays at a time
- Mobile responsive

## Folder Structure

```
masterreposts_package/
├── index.html
├── style.css
├── script.js
├── README.md
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
| Odd-numbered videos (1, 3, 5, ...) | Odd |
| Even-numbered videos (2, 4, 6, ...) | Even |

Flow:

1. Visitor sees a play overlay.
2. Visitor clicks the play button.
3. The configured destination is opened from that user interaction.
4. The video is unlocked.
5. The video attempts to start playing.
6. The unlock is remembered for the current browser session.

IMPORTANT: Confirm with your advertising providers that this traffic and content-gating flow is permitted under their current policies before deploying it.

## Ad Placements

`index.html` includes a placeholder for a native banner.

For third-party advertising code:

- Follow the provider's official implementation instructions.
- Avoid automatically triggering redirects.
- Avoid disguising advertisements as browser/video controls.
- Test desktop and mobile behavior.
- Check that scripts do not violate your hosting provider's policies.

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
