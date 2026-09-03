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
 - Opens the configured destination from a user click.
 - Unlocks the original video immediately.
*/
const smartLinks = {
  odd: "https://throbexhaust.com/vgusrr8nh?key=445ee6281e211e301ffe67b67cbf8d68",
  even: "https://omg10.com/4/9288526"
};

const ads = {
  nativeSrc: "ads/native.html",
  bannerSrc: "ads/banner-300x250.html",
  bannerKey: "REPLACE_MASTERREPOSTS_300x250_KEY"
};

const feed = document.getElementById("video-feed");

function getSmartLink(videoNumber) {
  return videoNumber % 2 === 1
    ? smartLinks.odd
    : smartLinks.even;
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
  frame.loading = "lazy";
  frame.setAttribute("scrolling", "no");
  frame.setAttribute("referrerpolicy", "no-referrer-when-downgrade");

  if (type === "banner") {
    frame.width = "300";
    frame.height = "250";
    frame.src = ads.bannerSrc;
  } else {
    frame.src = ads.nativeSrc;
  }

  section.appendChild(frame);
  return section;
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

videos.forEach((videoSrc, index) => {
  const videoNumber = index + 1;

  const card = document.createElement("article");
  card.className = "video-card";

  const container = document.createElement("div");
  container.className = "video-container";

  const video = document.createElement("video");
  video.preload = "metadata";
  video.playsInline = true;
  video.controls = false;

  const source = document.createElement("source");
  source.src = videoSrc;
  source.type = "video/mp4";
  video.appendChild(source);

  const gate = document.createElement("div");
  gate.className = "play-gate";

  const playButton = document.createElement("button");
  playButton.className = "gate-button";
  playButton.type = "button";
  playButton.setAttribute("aria-label", `Play video ${videoNumber}`);
  playButton.textContent = "▶";
  gate.appendChild(playButton);

  const actions = document.createElement("div");
  actions.className = "video-actions";

  const sophon = createActionLink("action-btn", sophonLink, "Watch on Sophon");
  const terabox = createActionLink("action-btn", teraboxLink, "Watch on Terabox");
  actions.append(sophon, terabox);

  container.append(video, gate);
  card.append(container, actions);
  feed.appendChild(card);

  const storageKey = `masterreposts_unlocked_${videoNumber}`;

  if (sessionStorage.getItem(storageKey)) {
    gate.classList.add("hidden");
    video.controls = true;
  }

  playButton.addEventListener("click", () => {
    if (!sessionStorage.getItem(storageKey)) {
      const destination = getSmartLink(videoNumber);
      window.open(destination, "_blank", "noopener");
      sessionStorage.setItem(storageKey, "true");
      track("engagement", { type: "smartlink", video: videoNumber });
    }

    gate.classList.add("hidden");
    video.controls = true;
    video.play().catch(() => {});
    track("engagement", { type: "play", video: videoNumber });
  });

  sophon.addEventListener("click", () => {
    track("engagement", { type: "sophon", video: videoNumber });
  });

  terabox.addEventListener("click", () => {
    track("engagement", { type: "terabox", video: videoNumber });
  });

  const adType = adAfterVideo(videoNumber);
  if (adType) feed.appendChild(createAdSlot(adType));
});

document.addEventListener("play", (event) => {
  if (event.target.tagName !== "VIDEO") return;

  document.querySelectorAll("video").forEach((other) => {
    if (other !== event.target) other.pause();
  });
}, true);

document.getElementById("year").textContent = new Date().getFullYear();
track("pageview");
