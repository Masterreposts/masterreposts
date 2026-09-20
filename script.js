/*
 MASTER REPOSTS CONFIGURATION
 Put videos inside /videos and edit this list.
*/

const videos = [
  "videos/video1.mp4",
  "videos/video2.mp4",
  "videos/video3.mp4",
  "videos/video4.mp4",
  "videos/video5.mp4",
  "videos/video6.mp4",
  "videos/video7.mp4",
  "videos/video8.mp4",
  "videos/video9.mp4",
  "videos/video10.mp4",
  "videos/video11.mp4",
  "videos/video12.mp4",
  "videos/video13.mp4",
  "videos/video14.mp4",
  "videos/video15.mp4",
  "videos/video16.mp4",
  "videos/video17.mp4",
  "videos/video18.mp4",
  "videos/video19.mp4",
  "videos/video20.mp4",
  "videos/video21.mp4",
  "videos/video22.mp4",
  "videos/video23.mp4",
  "videos/video24.mp4",
  "videos/video25.mp4",
  "videos/video26.mp4"
];

const sophonLink = "https://link.newsophon.com/l/MaBdE";
const teraboxLink = "https://www.teraboxpage.com/myknow/toponlyfans";

/*
 SMART LINK CONFIGURATION

 Video numbering:
 Odd:  1,5,9,13,...  → Adsterra Direct Link
 Even: 2,6,10,14,... → Monetag Direct Link

 Play gate:
 - Runs once per video per browser session.
 - The whole overlay is a real <a target="_blank"> so Monetag and
   Adsterra count a user-initiated navigation (not window.open).
 - Pattern 3,4,7,8,11,12,15,16,19,20,... plays with no SmartLink
   (videoNumber % 4 === 0 or === 3).
 - First gated tap opens the SmartLink and unlocks; playback is not
   requested in the same gesture so the new tab is not treated as a popup.
*/
const smartLinks = {
  odd: "https://throbexhaust.com/vgusrr8nh?key=445ee6281e211e301ffe67b67cbf8d68",
  even: "https://omg10.com/4/9313314"
};

const ads = {
  nativeSrc: "ads/native.html",
  bannerSrc: "ads/banner-300x250.html",
  bannerKey: "2449fe80e47d997db552",
  nativeId: "e02a3877d8ff4a051ec557717047de62"
};

const vastTagUrl = "https://direct-league.com/dWmLF.z/dTGmNLvHZZGqUB/vepmJ9wuRZfUllxkhP/T/crzZOwDJE/0mMUDJUet/NYzMM/4/MlTfQnw/OWSNZGsOaBW_1Yp-dCDl0FxJ";

const featuredCount = 10;
const feed = document.getElementById("video-feed");
const analyticsKey = "masterreposts_daily_metrics";

function getSmartLink(videoNumber) {
  return videoNumber % 2 === 1
    ? smartLinks.odd
    : smartLinks.even;
}

function usesSmartLink(videoNumber) {
  const bucket = videoNumber % 4;
  return bucket === 1 || bucket === 2;
}

/* Repeating 10-video ad schedule:
   native (page top) → 3 videos → 300x250 → 2 videos → native → 3 videos → 300x250 → 2 videos
*/
function adAfterVideo(videoNumber) {
  const position = ((videoNumber - 1) % 10) + 1;
  if (position === 3 || position === 8) return "banner";
  if (position === 5) return "native";
  return null;
}

function buildFeedItems() {
  const items = [];
  videos.forEach((src, index) => {
    const number = index + 1;
    items.push({ type: "video", src: src, number: number });
    if (number % 6 === 0) items.push({ type: "vast-ad" });
    const slot = adAfterVideo(number);
    if (slot) items.push({ type: slot });
  });
  return items;
}

function collectContext() {
  const mobile = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);
  return {
    ts: Date.now(),
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    language: navigator.language,
    device: mobile ? "mobile" : "desktop",
    referrer: document.referrer || "direct",
    viewport: `${window.innerWidth}x${window.innerHeight}`,
    path: location.pathname
  };
}

function readStoredMetrics() {
  try {
    const raw = localStorage.getItem(analyticsKey);
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch (err) {
    return {};
  }
}

function writeStoredMetrics(metrics) {
  try {
    localStorage.setItem(analyticsKey, JSON.stringify(metrics));
  } catch (err) {
    // Analytics must never affect playback or ad loading.
  }
}

function formatMetricDate(dateValue) {
  if (!dateValue) return "";
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  });
}

function aggregateRevenue(impressions, clicks) {
  return Number((impressions * 0.0008 + clicks * 0.004).toFixed(4));
}

function renderMetricsTable() {
  const table = document.getElementById("daily-metrics");
  if (!table) return;

  const rows = Object.entries(readStoredMetrics())
    .map(([dateKey, values]) => {
      const impressions = Number(values && values.impressions ? values.impressions : 0);
      const clicks = Number(values && values.clicks ? values.clicks : 0);
      const revenue = Number(values && values.revenue ? values.revenue : aggregateRevenue(impressions, clicks));
      return { dateKey, impressions, clicks, revenue };
    })
    .sort((a, b) => new Date(b.dateKey) - new Date(a.dateKey))
    .slice(0, 7);

  const body = table.querySelector("tbody");
  if (!body) return;

  body.innerHTML = rows.length
    ? rows.map((row) => `
        <tr>
          <td>${formatMetricDate(row.dateKey)}</td>
          <td>${row.impressions}</td>
          <td>${row.clicks}</td>
          <td>$${row.revenue.toFixed(4)}</td>
        </tr>
      `).join("")
    : '<tr><td colspan="4">No metric data yet.</td></tr>';
}

function incrementMetric(kind) {
  if (!window.localStorage) return;
  try {
    const metrics = readStoredMetrics();
    const dateKey = new Date().toISOString().slice(0, 10);
    const current = metrics[dateKey] || { impressions: 0, clicks: 0, revenue: 0 };

    if (kind === "impression") current.impressions = Number(current.impressions || 0) + 1;
    if (kind === "click") current.clicks = Number(current.clicks || 0) + 1;
    current.revenue = aggregateRevenue(current.impressions, current.clicks);
    metrics[dateKey] = current;
    writeStoredMetrics(metrics);
    renderMetricsTable();
  } catch (err) {
    // Analytics must never affect playback or ad loading.
  }
}

function track(eventName, extra) {
  const entry = Object.assign({ event: eventName }, collectContext(), extra || {});
  try {
    const key = "masterreposts_analytics";
    const existing = JSON.parse(sessionStorage.getItem(key) || "[]");
    existing.push(entry);
    sessionStorage.setItem(key, JSON.stringify(existing.slice(-80)));
  } catch (err) {
    // Analytics must never affect playback or ad loading.
  }

  // Count each user click once. "engagement" events are behavioral only and
  // must not increment the clicks metric (previously this line made every
  // smartlink/sophon/terabox click count twice and counted play/featured as clicks).
  const normalized = (extra && extra.type) || eventName;
  if (normalized === "impression" || normalized === "ad_iframe" || normalized === "vast") {
    incrementMetric("impression");
  }
  if (normalized === "click" || normalized === "smartlink_click" || normalized === "vast_click" || normalized === "sophon" || normalized === "terabox") {
    incrementMetric("click");
  }
}

window.track = track;

/*
  Impression counting for the in-feed iframe ad slots.

  The wrapper iframe fires "load" before the ad network renders anything, so
  counting on load recorded impressions for blank slots. Instead, poll the
  inner document for real ad content and count exactly once per slot.
*/
function hasRenderedAdContent(win, type) {
  try {
    const doc = win.document;
    if (!doc || !doc.body) return false;
    // Only the ad network's invoke.js ever puts iframes/anchors/images inside
    // these wrapper documents, so any of them means an ad is rendering.
    return !!doc.querySelector("iframe, img[src], a[href]");
  } catch (err) {
    // Cross-origin inner frames: the ad network replaced our wrapper document,
    // which only happens once a real ad is rendering.
    return err instanceof DOMException || err.name === "SecurityError";
  }
}

function trackAdImpression(win, slotType, timeoutMs) {
  let sent = false;
  const startedAt = Date.now();
  const timer = window.setInterval(() => {
    if (!sent && hasRenderedAdContent(win, slotType)) {
      sent = true;
      window.clearInterval(timer);
      countAdImpression(win, slotType);
      return;
    }
    if (Date.now() - startedAt > (timeoutMs || 30000)) window.clearInterval(timer);
  }, 500);
}

// One impression per frame window, no matter which detector saw it first
// (parent-side polling, the load event, or the fallback page's postMessage).
const countedAdWindows = new WeakSet();

function countAdImpression(win, slotType) {
  try {
    if (!win || countedAdWindows.has(win)) return;
    countedAdWindows.add(win);
    track("impression", { type: "ad_iframe", slot: slotType, rendered: true });
  } catch (err) {
    // Analytics must never affect playback or ad loading.
  }
}

// Static fallback pages (ads/native.html, ads/banner-300x250.html) post an
// "impression" message once their container really renders ad content.
window.addEventListener("message", (event) => {
  const data = event.data;
  if (!data || data.source !== "masterreposts-ad" || data.event !== "impression") return;
  countAdImpression(event.source, data.slot || "unknown");
});

// Page-top native slot (static markup in index.html): count an impression
// when the Adsterra container actually renders content in the viewport.
(function trackTopNativeImpression() {
  const section = document.querySelector("section.ad-slot.native-ad");
  const container = document.getElementById("container-" + ads.nativeId);
  if (!section || !container) return;

  let sent = false;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting || sent) return;
      if (container.querySelector("a[href], iframe, img")) {
        sent = true;
        observer.disconnect();
        track("impression", { type: "ad_iframe", slot: "native-top", rendered: true });
      }
    });
  }, { threshold: 0.5 });
  observer.observe(section);
  // Fill may land before the observer callback runs; re-check on DOM changes.
  new MutationObserver(() => {
    if (sent) return;
    if (container.querySelector("a[href], iframe, img")) {
      const rect = section.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        sent = true;
        observer.disconnect();
        track("impression", { type: "ad_iframe", slot: "native-top", rendered: true });
      }
    }
  }).observe(container, { childList: true, subtree: true });
})();

function adFrameHtml(type) {
  const origin = (window.location.origin || "") + "/";
  const css =
    "html,body{margin:0;background:#000;display:flex;align-items:center;justify-content:center;width:100%;height:100%;overflow:hidden}" +
    "iframe,a,div{pointer-events:auto}";

  if (type === "banner") {
    return (
      "<!DOCTYPE html><html lang=\"en\"><head><meta charset=\"UTF-8\">" +
      "<meta name=\"referrer\" content=\"origin\">" +
      "<base href=\"" + origin + "\" target=\"_blank\">" +
      "<style>" + css + "html,body{width:300px;height:250px}</style></head><body>" +
      "<script>atOptions={key:\"" + ads.bannerKey + "\",format:\"iframe\",height:250,width:300,params:{}};<\/script>" +
      "<script data-cfasync=\"false\" src=\"https://throbexhaust.com/" + ads.bannerKey + "/invoke.js\"><\/script>" +
      "</body></html>"
    );
  }

  return (
    "<!DOCTYPE html><html lang=\"en\"><head><meta charset=\"UTF-8\">" +
    "<meta name=\"referrer\" content=\"origin\">" +
    "<base href=\"" + origin + "\" target=\"_blank\">" +
    "<style>" + css + "#container-" + ads.nativeId + "{width:100%;min-height:250px}</style></head><body>" +
    "<script async data-cfasync=\"false\" src=\"https://throbexhaust.com/" + ads.nativeId + "/invoke.js\"><\/script>" +
    "<div id=\"container-" + ads.nativeId + "\"></div>" +
    "</body></html>"
  );
}

function createAdSlot(type) {
  const section = document.createElement("section");
  section.className = "ad-slot " + (type === "banner" ? "banner-ad" : "native-ad");
  section.setAttribute("aria-label", "Advertisement");

  const label = document.createElement("p");
  label.className = "ad-label";
  label.textContent = "Advertisement";
  section.appendChild(label);

  const frame = document.createElement("iframe");
  frame.className = type === "banner" ? "banner-frame" : "native-frame";
  frame.title = "Advertisement";
  frame.setAttribute("scrolling", "no");
  frame.setAttribute("frameborder", "0");
  // origin (not the /ads/*.html path) is what Adsterra/Monetag approve.
  frame.referrerPolicy = "origin";
  frame.setAttribute("referrerpolicy", "origin");
  frame.setAttribute("allow", "attribution-reporting; fullscreen; autoplay");
  frame.loading = "eager";
  frame.style.pointerEvents = "auto";

  if (type === "banner") {
    frame.width = "300";
    frame.height = "250";
  } else {
    frame.width = "100%";
    frame.height = "400";
  }

  trackAdImpression(frame.contentWindow, type);

  frame.addEventListener("load", () => {
    try {
      trackAdImpression(frame.contentWindow, type);
      const doc = frame.contentDocument;
      if (!doc) return;
      const resize = () => {
        const body = doc.body;
        const rootEl = doc.documentElement;
        const height = Math.max(
          body ? body.scrollHeight : 0,
          rootEl ? rootEl.scrollHeight : 0,
          type === "banner" ? 250 : 280
        );
        if (height > 0) frame.style.height = height + "px";
      };
      resize();
      if (doc.body) {
        new MutationObserver(resize).observe(doc.body, {
          childList: true,
          subtree: true,
          attributes: true
        });
      }
    } catch (err) {
      // Cross-origin nested ad frames are expected; wrapper document is same-origin.
    }
  });

  section.appendChild(frame);

  // Write the tag into a same-origin about:blank frame so document.write
  // cannot clobber the page and script requests send this page as referrer.
  try {
    const doc = frame.contentDocument;
    if (doc) {
      doc.open();
      doc.write(adFrameHtml(type));
      doc.close();
    } else {
      frame.src = type === "banner" ? ads.bannerSrc : ads.nativeSrc;
    }
  } catch (err) {
    frame.src = type === "banner" ? ads.bannerSrc : ads.nativeSrc;
  }

  // Blank-slot hygiene: if nothing renders, hide the empty dashed box so the
  // feed does not show dead ad placeholders.
  window.setTimeout(() => {
    if (!hasRenderedAdContent(frame.contentWindow, type)) {
      section.classList.add("ad-empty");
    }
  }, 30000);

  return section;
}

function posterSrc(videoNumber) {
  return "posters/video" + videoNumber + ".jpg";
}

function createFeaturedSlider() {
  const featuredTrack = document.getElementById("featured-track");
  const prev = document.getElementById("featured-prev");
  const next = document.getElementById("featured-next");
  if (!featuredTrack || !prev || !next) return;

  videos.slice(0, featuredCount).forEach((videoSrc, index) => {
    const videoNumber = index + 1;
    const item = document.createElement("button");
    item.type = "button";
    item.className = "featured-item";
    item.setAttribute("aria-label", "Go to video " + videoNumber);

    const thumb = document.createElement("img");
    thumb.src = posterSrc(videoNumber);
    thumb.alt = "Video " + videoNumber;
    thumb.decoding = "async";
    thumb.addEventListener("error", () => {
      thumb.remove();
      item.classList.add("no-poster");
    });

    const play = document.createElement("span");
    play.className = "featured-play";
    play.textContent = "▶";

    const caption = document.createElement("span");
    caption.className = "featured-caption";
    caption.textContent = "Video " + videoNumber;

    item.append(thumb, play, caption);
    item.addEventListener("click", () => {
      const target = document.getElementById("reel-" + videoNumber);
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
        target.classList.add("reel-highlight");
        window.setTimeout(() => target.classList.remove("reel-highlight"), 1400);
      }
      track("engagement", { type: "featured", video: videoNumber });
    });

    featuredTrack.appendChild(item);
  });

  function scrollStep() {
    return Math.max(featuredTrack.clientWidth * 0.75, 140);
  }

  prev.addEventListener("click", () => {
    featuredTrack.scrollBy({ left: -scrollStep(), behavior: "smooth" });
  });

  next.addEventListener("click", () => {
    featuredTrack.scrollBy({ left: scrollStep(), behavior: "smooth" });
  });
}

function createActionLink(className, href, label) {
  const link = document.createElement("a");
  link.className = className;
  link.href = href;
  link.target = "_blank";
  link.rel = "noopener";
  link.referrerPolicy = "no-referrer-when-downgrade";
  link.textContent = label;
  return link;
}

function openSmartLink(url) {
  if (!url) return false;

  // Programmatic window.open is filtered as a popup by Monetag/Adsterra.
  // A real <a> click inside the user-gesture handler is what they count.
  const link = document.createElement("a");
  link.href = url;
  link.target = "_blank";
  link.rel = "noopener";
  link.referrerPolicy = "no-referrer-when-downgrade";
  link.style.position = "absolute";
  link.style.left = "-9999px";
  document.body.appendChild(link);
  link.click();
  link.remove();
  return true;
}

function createVideoCard(item) {
  const videoNumber = item.number;
  const card = document.createElement("article");
  card.className = "video-card";
  card.id = "reel-" + videoNumber;

  const container = document.createElement("div");
  container.className = "video-container";

  const video = document.createElement("video");
  video.preload = "auto";
  video.playsInline = true;
  video.controls = false;

  const source = document.createElement("source");
  source.src = item.src;
  source.type = "video/mp4";
  video.appendChild(source);

  const gated = usesSmartLink(videoNumber);
  const gate = gated ? document.createElement("a") : document.createElement("div");
  gate.className = "play-gate";
  gate.setAttribute("aria-label", "Play video " + videoNumber);
  if (gated) {
    gate.href = getSmartLink(videoNumber);
    gate.target = "_blank";
    gate.rel = "noopener";
    gate.referrerPolicy = "no-referrer-when-downgrade";
  }

  const playButton = document.createElement("span");
  playButton.className = "gate-button";
  playButton.setAttribute("aria-hidden", "true");
  playButton.textContent = "▶";
  gate.appendChild(playButton);

  const actions = document.createElement("div");
  actions.className = "video-actions";

  const sophon = createActionLink("action-btn", sophonLink, "Watch on Sophon");
  const terabox = createActionLink("action-btn", teraboxLink, "Watch on Terabox");
  actions.append(sophon, terabox);

  container.append(video, gate);
  card.append(container, actions);

  const storageKey = "masterreposts_unlocked_" + videoNumber;

  if (sessionStorage.getItem(storageKey)) {
    gate.classList.add("hidden");
    video.controls = true;
  }

  function startPlayback() {
    gate.classList.add("hidden");
    video.controls = true;
    video.play().then(() => {
      track("engagement", { type: "play", video: videoNumber });
    }).catch(() => {
      gate.classList.remove("hidden");
      track("engagement", { type: "play_error", video: videoNumber });
    });
  }

  gate.addEventListener("click", (event) => {
    const alreadyUnlocked = !!sessionStorage.getItem(storageKey);

    if (gated && !alreadyUnlocked) {
      sessionStorage.setItem(storageKey, "true");
      track("engagement", { type: "smartlink_click", video: videoNumber });
      track("click", { type: "smartlink_click", video: videoNumber });
      if (gate.tagName !== "A") {
        openSmartLink(getSmartLink(videoNumber));
      }
      // Let the native <a target="_blank"> navigation count for the
      // advertiser. Do not consume the same gesture with video.play().
      gate.classList.add("hidden");
      video.controls = true;
      return;
    }

    if (gate.tagName === "A") event.preventDefault();
    startPlayback();
  });

  sophon.addEventListener("click", () => {
    track("engagement", { type: "sophon", video: videoNumber });
    track("click", { type: "sophon", video: videoNumber });
  });

  terabox.addEventListener("click", () => {
    track("engagement", { type: "terabox", video: videoNumber });
    track("click", { type: "terabox", video: videoNumber });
  });

  return card;
}

function createVastCard(slotId) {
  const card = document.createElement("article");
  card.className = "video-card vast-card";
  card.setAttribute("aria-label", "Sponsored video");

  const badge = document.createElement("p");
  badge.className = "vast-badge";
  badge.textContent = "Sponsored";

  const container = document.createElement("div");
  container.className = "video-container";

  const video = document.createElement("video");
  video.preload = "none";
  video.playsInline = true;
  video.controls = false;
  video.setAttribute("playsinline", "");

  const gate = document.createElement("div");
  gate.className = "play-gate";

  const playButton = document.createElement("button");
  playButton.className = "gate-button";
  playButton.type = "button";
  playButton.setAttribute("aria-label", "Play sponsored video");
  playButton.textContent = "▶";
  gate.appendChild(playButton);

  const skip = document.createElement("button");
  skip.className = "vast-skip";
  skip.type = "button";
  skip.hidden = true;
  skip.textContent = "Skip";

  const bar = document.createElement("div");
  bar.className = "vast-progress";
  bar.appendChild(document.createElement("span"));

  const clickLayer = document.createElement("a");
  clickLayer.className = "vast-clickthrough";
  clickLayer.target = "_blank";
  clickLayer.rel = "noopener sponsored";
  clickLayer.referrerPolicy = "no-referrer-when-downgrade";
  clickLayer.hidden = true;
  clickLayer.setAttribute("aria-label", "Open advertisement");

  container.append(video, gate, clickLayer, skip, bar);

  const meta = document.createElement("div");
  meta.className = "vast-meta";

  const status = document.createElement("span");
  status.className = "vast-status";
  status.textContent = "VAST Video";

  const more = document.createElement("a");
  more.className = "vast-more";
  more.href = "#";
  more.target = "_blank";
  more.rel = "noopener sponsored";
  more.hidden = true;
  more.textContent = "Learn more";

  meta.append(status, more);
  card.append(badge, container, meta);

  if (window.VastPlayer && typeof window.VastPlayer.mount === "function") {
    window.VastPlayer.mount(card, vastTagUrl, slotId);
  }

  return card;
}

const feedItems = buildFeedItems();
let vastSlot = 0;

feedItems.forEach((item) => {
  if (item.type === "video") {
    feed.appendChild(createVideoCard(item));
    return;
  }
  if (item.type === "vast-ad") {
    vastSlot += 1;
    feed.appendChild(createVastCard(vastSlot));
    return;
  }
  if (item.type === "banner" || item.type === "native") {
    feed.appendChild(createAdSlot(item.type));
  }
});

createFeaturedSlider();

(function placeFeaturedVideoSlider() {
  const slot = document.getElementById("featured-video-slider");
  if (!slot) return;

  function relocate() {
    const player = document.querySelector(".rmp-container");
    if (player && player.parentElement !== slot) {
      slot.appendChild(player);
      window.dispatchEvent(new Event("resize"));
    }
    slot.querySelectorAll("iframe").forEach((iframe) => {
      iframe.style.pointerEvents = "auto";
      iframe.setAttribute("referrerpolicy", "origin");
    });
  }

  relocate();
  new MutationObserver(relocate).observe(document.documentElement, {
    childList: true,
    subtree: true
  });
})();

document.addEventListener("play", (event) => {
  if (event.target.tagName !== "VIDEO") return;

  document.querySelectorAll("video").forEach((other) => {
    if (other !== event.target) other.pause();
  });
}, true);

document.getElementById("year").textContent = new Date().getFullYear();
track("pageview");
