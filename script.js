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
 Odd:  1,3,5,7,9,...
 Even: 2,4,6,8,10,...

 Play gate:
 - Runs once per video per browser session.
 - Opens the configured destination from a user click
   via a real <a href> so the advertiser can count it.
 - Videos 3, 6, 9, 12, 15, 18 play with no SmartLink.
 - Unlocks the original video immediately.
*/
const smartLinks = {
  odd: "https://throbexhaust.com/vgusrr8nh?key=445ee6281e211e301ffe67b67cbf8d68",
  even: "https://omg10.com/4/9288526"
};

const ads = {
  nativeSrc: "ads/native.html",
  bannerSrc: "ads/banner-300x250.html",
  bannerKey: "2449fe80e47d997db552"
};

const ungatedVideos = new Set([3, 6, 9, 12, 15, 18]);

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
  return !ungatedVideos.has(videoNumber);
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

  const normalized = (extra && extra.type) || eventName;
  if (normalized === "impression" || normalized === "ad_iframe" || normalized === "vast") {
    incrementMetric("impression");
  }
  if (normalized === "click" || normalized === "smartlink_click" || normalized === "featured" || normalized === "play" || normalized === "sophon" || normalized === "terabox") {
    incrementMetric("click");
  }
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
  frame.referrerPolicy = "no-referrer-when-downgrade";
  frame.setAttribute("referrerpolicy", "no-referrer-when-downgrade");
  frame.setAttribute("allow", "attribution-reporting; fullscreen");
  frame.loading = "eager";

  if (type === "banner") {
    frame.width = "300";
    frame.height = "250";
    frame.src = ads.bannerSrc;
  } else {
    frame.width = "100%";
    frame.height = "400";
    frame.src = ads.nativeSrc;
  }

  frame.addEventListener("load", () => {
    try {
      const doc = frame.contentDocument;
      track("impression", { type: "ad_iframe", slot: type });
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
      // Cross-origin nested ad frames are expected; parent document is same-origin.
    }
  });

  section.appendChild(frame);
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
  link.rel = "noopener noreferrer";
  link.textContent = label;
  return link;
}

function openSmartLink(url) {
  if (!url) return false;

  const popup = window.open(url, "_blank");
  if (popup) {
    try {
      popup.opener = null;
    } catch (err) {
      // Some browsers expose the new tab as read-only.
    }
    return true;
  }

  const link = document.createElement("a");
  link.href = url;
  link.target = "_blank";
  link.rel = "noopener";
  link.style.display = "none";
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
  const gate = document.createElement("div");
  gate.className = "play-gate";

  const playButton = gated ? document.createElement("a") : document.createElement("button");
  playButton.className = "gate-button";
  playButton.setAttribute("aria-label", "Play video " + videoNumber);
  playButton.textContent = "▶";
  if (gated) {
    playButton.href = getSmartLink(videoNumber);
    playButton.target = "_blank";
    playButton.rel = "noopener";
  } else {
    playButton.type = "button";
  }
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

  playButton.addEventListener("click", (event) => {
    const alreadyUnlocked = !!sessionStorage.getItem(storageKey);

    if (gated && !alreadyUnlocked) {
      sessionStorage.setItem(storageKey, "true");
      track("engagement", { type: "smartlink_click", video: videoNumber });
      track("click", { type: "smartlink_click", video: videoNumber });
      if (playButton.tagName !== "A") {
        openSmartLink(getSmartLink(videoNumber));
      }
    } else if (playButton.tagName === "A") {
      event.preventDefault();
    }

    gate.classList.add("hidden");
    video.controls = true;
    video.play().then(() => {
      track("engagement", { type: "play", video: videoNumber });
      track("click", { type: "play", video: videoNumber });
    }).catch(() => {
      gate.classList.remove("hidden");
      track("engagement", { type: "play_error", video: videoNumber });
    });
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

  container.append(video, gate, skip, bar);

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
    if (player && player.parentElement !== slot) slot.appendChild(player);
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
