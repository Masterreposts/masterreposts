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

 IMPORTANT:
 Only use a play gate if your advertising providers explicitly permit
 this implementation and user flow.
*/
const smartLinks = {
  odd: "https://throbexhaust.com/vgusrr8nh?key=445ee6281e211e301ffe67b67cbf8d68",
  even: "https://omg10.com/4/9288526"
};

const feed = document.getElementById("video-feed");

function getSmartLink(videoNumber) {
  return videoNumber % 2 === 1
    ? smartLinks.odd
    : smartLinks.even;
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

  const sophon = document.createElement("a");
  sophon.className = "action-btn";
  sophon.href = sophonLink;
  sophon.target = "_blank";
  sophon.rel = "noopener noreferrer";
  sophon.textContent = "Watch on Sophon";

  const terabox = document.createElement("a");
  terabox.className = "action-btn";
  terabox.href = teraboxLink;
  terabox.target = "_blank";
  terabox.rel = "noopener noreferrer";
  terabox.textContent = "Watch on Terabox";

  actions.append(sophon, terabox);
  container.append(video, gate);
  card.append(container, actions);
  feed.appendChild(card);

  /*
   Play gate:
   - Runs once per video per browser session.
   - Opens the configured destination from a user click.
   - Unlocks the original video immediately.
   - User can return to the original tab and play/watch.
  */
  const storageKey = `masterreposts_unlocked_${videoNumber}`;

  if (sessionStorage.getItem(storageKey)) {
    gate.classList.add("hidden");
    video.controls = true;
  }

  playButton.addEventListener("click", () => {
    if (!sessionStorage.getItem(storageKey)) {
      const destination = getSmartLink(videoNumber);

      // User-initiated window opening. May be blocked by browser settings.
      window.open(destination, "_blank", "noopener");

      sessionStorage.setItem(storageKey, "true");
    }

    gate.classList.add("hidden");
    video.controls = true;

    video.play().catch(() => {
      // Browser may require another direct interaction before playback.
    });
  });
});

/* Pause other videos when one starts */
document.addEventListener("play", (event) => {
  if (event.target.tagName !== "VIDEO") return;

  document.querySelectorAll("video").forEach(video => {
    if (video !== event.target) video.pause();
  });
}, true);

document.getElementById("year").textContent = new Date().getFullYear();
