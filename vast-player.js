/*
  VAST 3.0 player / SDK
  Tag URL → fetch XML → parse (Inline + Wrappers) → select MediaFile
  → render in a Sponsored card → fire impressions and tracking events.
*/
(function (root) {
  "use strict";

  var MAX_WRAPPERS = 5;
  var FETCH_TIMEOUT_MS = 8000;
  var PLAYABLE_TYPES = {
    "video/mp4": 4,
    "video/webm": 3,
    "video/ogg": 2,
    "application/vnd.apple.mpegurl": 1,
    "application/x-mpegURL": 1
  };

  function nodeText(node) {
    if (!node) return "";
    return (node.textContent || "").trim();
  }

  function childrenNamed(parent, name) {
    if (!parent) return [];
    return Array.prototype.filter.call(parent.childNodes, function (node) {
      return node.nodeType === 1 && node.localName === name;
    });
  }

  function firstNamed(parent, name) {
    var list = childrenNamed(parent, name);
    return list.length ? list[0] : null;
  }

  function deepNamed(parent, name) {
    if (!parent) return [];
    return Array.prototype.slice.call(parent.getElementsByTagName(name));
  }

  function attr(node, name) {
    return node && node.getAttribute ? (node.getAttribute(name) || "") : "";
  }

  function parseDuration(value) {
    if (!value) return 0;
    if (/^\d+(\.\d+)?$/.test(value)) return Number(value);
    var parts = value.split(":");
    if (parts.length < 3) return 0;
    return Number(parts[0]) * 3600 + Number(parts[1]) * 60 + Number(parts[2]);
  }

  function formatPlayhead(seconds) {
    var ms = Math.max(0, Math.round((seconds || 0) * 1000));
    var h = Math.floor(ms / 3600000);
    var m = Math.floor((ms % 3600000) / 60000);
    var s = Math.floor((ms % 60000) / 1000);
    var milli = ms % 1000;
    function pad(n, w) {
      return String(n).padStart(w, "0");
    }
    return pad(h, 2) + ":" + pad(m, 2) + ":" + pad(s, 2) + "." + pad(milli, 3);
  }

  function cacheBuster() {
    return String(Math.floor(10000000 + Math.random() * 90000000));
  }

  function replaceMacros(url, macros) {
    if (!url) return "";
    var resolved = url;
    Object.keys(macros).forEach(function (key) {
      var value = encodeURIComponent(macros[key]);
      resolved = resolved.replace(new RegExp("\\[" + key + "\\]", "gi"), value);
      resolved = resolved.replace(new RegExp("%%" + key + "%%", "gi"), value);
    });
    return resolved;
  }

  function withCacheBuster(url) {
    if (!url) return url;
    var join = url.indexOf("?") === -1 ? "?" : "&";
    return url + join + "cb=" + cacheBuster();
  }

  function resolveUrl(url, base) {
    if (!url) return "";
    try {
      return new URL(url, base || root.location.href).href;
    } catch (err) {
      return url;
    }
  }

  function firePixels(urls, macros) {
    (urls || []).forEach(function (url) {
      var resolved = replaceMacros(url, macros || {});
      if (!resolved) return;
      try {
        if (navigator.sendBeacon) {
          navigator.sendBeacon(resolved);
          return;
        }
      } catch (err) {}
      var img = new Image();
      img.referrerPolicy = "no-referrer-when-downgrade";
      img.src = resolved;
    });
  }

  function unique(list) {
    var seen = {};
    return (list || []).filter(function (item) {
      if (!item || seen[item]) return false;
      seen[item] = true;
      return true;
    });
  }

  function fetchXml(url) {
    var controller = typeof AbortController === "function" ? new AbortController() : null;
    var timer = window.setTimeout(function () {
      if (controller) controller.abort();
    }, FETCH_TIMEOUT_MS);

    return fetch(url, {
      method: "GET",
      mode: "cors",
      credentials: "omit",
      referrerPolicy: "no-referrer-when-downgrade",
      signal: controller ? controller.signal : undefined
    }).then(function (response) {
      window.clearTimeout(timer);
      if (!response.ok) {
        throw new Error("VAST HTTP " + response.status);
      }
      return response.text();
    }).then(function (text) {
      var doc = new DOMParser().parseFromString(text, "text/xml");
      if (doc.querySelector("parsererror")) {
        throw new Error("Invalid VAST XML");
      }
      return doc;
    }).catch(function (err) {
      window.clearTimeout(timer);
      throw err;
    });
  }

  function parseLinear(linearEl, baseUrl) {
    var mediaFiles = deepNamed(linearEl, "MediaFile").map(function (node) {
      return {
        url: resolveUrl(nodeText(node), baseUrl),
        type: attr(node, "type").toLowerCase(),
        delivery: (attr(node, "delivery") || "progressive").toLowerCase(),
        width: Number(attr(node, "width") || 0),
        height: Number(attr(node, "height") || 0),
        bitrate: Number(attr(node, "bitrate") || 0),
        apiFramework: attr(node, "apiFramework")
      };
    }).filter(function (file) {
      return file.url;
    });

    var tracking = {};
    deepNamed(linearEl, "Tracking").forEach(function (node) {
      var eventName = attr(node, "event");
      if (!eventName) return;
      if (!tracking[eventName]) tracking[eventName] = [];
      tracking[eventName].push(resolveUrl(nodeText(node), baseUrl));
    });

    var clickThrough = resolveUrl(
      nodeText(firstNamed(firstNamed(linearEl, "VideoClicks"), "ClickThrough")),
      baseUrl
    );
    var clickTracking = childrenNamed(firstNamed(linearEl, "VideoClicks"), "ClickTracking").map(function (node) {
      return resolveUrl(nodeText(node), baseUrl);
    });

    return {
      duration: parseDuration(nodeText(firstNamed(linearEl, "Duration"))),
      skipoffset: attr(linearEl, "skipoffset"),
      mediaFiles: mediaFiles,
      tracking: tracking,
      clickThrough: clickThrough,
      clickTracking: clickTracking
    };
  }

  function parseAdNode(adEl, baseUrl) {
    var inline = firstNamed(adEl, "InLine");
    var wrapper = firstNamed(adEl, "Wrapper");
    var root = inline || wrapper;
    if (!root) return null;

    var impressions = childrenNamed(root, "Impression").map(function (node) {
      return resolveUrl(nodeText(node), baseUrl);
    });
    var errors = childrenNamed(root, "Error").map(function (node) {
      return resolveUrl(nodeText(node), baseUrl);
    });
    var linearEl = deepNamed(root, "Linear")[0] || null;
    var linear = linearEl ? parseLinear(linearEl, baseUrl) : {
      duration: 0,
      skipoffset: "",
      mediaFiles: [],
      tracking: {},
      clickThrough: "",
      clickTracking: []
    };

    return {
      id: attr(adEl, "id"),
      isWrapper: !!wrapper,
      wrapperUrl: wrapper ? resolveUrl(nodeText(firstNamed(wrapper, "VASTAdTagURI")), baseUrl) : "",
      impressions: impressions,
      errors: errors,
      linear: linear
    };
  }

  function mergeAds(wrapper, inner) {
    if (!inner) return wrapper;
    inner.impressions = unique((wrapper.impressions || []).concat(inner.impressions || []));
    inner.errors = unique((wrapper.errors || []).concat(inner.errors || []));
    inner.linear.clickTracking = unique(
      (wrapper.linear.clickTracking || []).concat(inner.linear.clickTracking || [])
    );
    if (!inner.linear.clickThrough) inner.linear.clickThrough = wrapper.linear.clickThrough;
    Object.keys(wrapper.linear.tracking || {}).forEach(function (eventName) {
      inner.linear.tracking[eventName] = unique(
        (wrapper.linear.tracking[eventName] || []).concat(inner.linear.tracking[eventName] || [])
      );
    });
    if (!inner.linear.mediaFiles.length) inner.linear.mediaFiles = wrapper.linear.mediaFiles;
    return inner;
  }

  function parseVastDocument(doc, baseUrl) {
    var vast = doc.documentElement;
    var errors = childrenNamed(vast, "Error").map(function (node) {
      return resolveUrl(nodeText(node), baseUrl);
    });
    var ads = childrenNamed(vast, "Ad").map(function (adEl) {
      return parseAdNode(adEl, baseUrl);
    }).filter(Boolean);
    return {
      version: attr(vast, "version") || "3.0",
      errors: errors,
      ads: ads
    };
  }

  function resolveVast(url, depth, chain) {
    depth = depth || 0;
    chain = chain || [];
    if (depth > MAX_WRAPPERS) {
      return Promise.reject(new Error("VAST wrapper limit"));
    }

    var requestUrl = withCacheBuster(url);
    return fetchXml(requestUrl).then(function (doc) {
      var parsed = parseVastDocument(doc, requestUrl);
      if (!parsed.ads.length) {
        firePixels(parsed.errors, {
          ERRORCODE: "303",
          CACHEBUSTING: cacheBuster(),
          TIMESTAMP: new Date().toISOString()
        });
        throw new Error("VAST no ad");
      }

      var ad = parsed.ads[0];
      chain.push(ad);
      if (ad.isWrapper && ad.wrapperUrl) {
        return resolveVast(ad.wrapperUrl, depth + 1, chain);
      }

      var merged = chain.reduce(function (acc, item) {
        return acc ? mergeAds(acc, item) : item;
      }, null);

      merged.vastVersion = parsed.version;
      merged.tagUrl = url;
      return merged;
    });
  }

  function selectMediaFile(mediaFiles, videoEl) {
    var candidates = (mediaFiles || []).filter(function (file) {
      if (file.apiFramework && file.apiFramework.toLowerCase() === "vpaid") return false;
      if (file.delivery && file.delivery !== "progressive" && file.delivery !== "streaming") return false;
      if (!PLAYABLE_TYPES[file.type]) {
        if (/\.mp4(\?|$)/i.test(file.url)) file.type = "video/mp4";
        else if (/\.webm(\?|$)/i.test(file.url)) file.type = "video/webm";
        else return false;
      }
      if (videoEl && videoEl.canPlayType) {
        var support = videoEl.canPlayType(file.type);
        if (!support) return false;
      }
      return true;
    });

    if (!candidates.length) return null;

    var targetWidth = (videoEl && videoEl.clientWidth) || 640;
    candidates.sort(function (a, b) {
      var typeDelta = (PLAYABLE_TYPES[b.type] || 0) - (PLAYABLE_TYPES[a.type] || 0);
      if (typeDelta) return typeDelta;
      var aDiff = Math.abs((a.width || targetWidth) - targetWidth);
      var bDiff = Math.abs((b.width || targetWidth) - targetWidth);
      if (aDiff !== bDiff) return aDiff - bDiff;
      return (b.bitrate || 0) - (a.bitrate || 0);
    });

    return candidates[0];
  }

  function skipSeconds(skipoffset, duration) {
    if (!skipoffset) return null;
    if (skipoffset.indexOf("%") !== -1) {
      return duration * (parseFloat(skipoffset) / 100);
    }
    var parsed = parseDuration(skipoffset);
    return parsed > 0 ? parsed : null;
  }

  function defaultMacros(extra) {
    var macros = {
      CACHEBUSTING: cacheBuster(),
      TIMESTAMP: new Date().toISOString(),
      CONTENTPLAYHEAD: "00:00:00.000",
      ADPLAYHEAD: "00:00:00.000"
    };
    Object.keys(extra || {}).forEach(function (key) {
      macros[key] = extra[key];
    });
    return macros;
  }

  function createTracker(ad) {
    var fired = {};
    function once(name, urls, macros) {
      if (fired[name] || !urls || !urls.length) return;
      fired[name] = true;
      firePixels(urls, macros);
    }

    return {
      impression: function (macros) {
        once("impression", ad.impressions, macros);
        once("creativeView", (ad.linear.tracking || {}).creativeView, macros);
      },
      event: function (name, macros) {
        once(name, (ad.linear.tracking || {})[name], macros);
      },
      click: function (macros) {
        firePixels(ad.linear.clickTracking, macros);
      },
      error: function (code) {
        firePixels(ad.errors, defaultMacros({ ERRORCODE: String(code || 900) }));
      }
    };
  }

  function mount(card, tagUrl, slotId) {
    var video = card.querySelector("video");
    var gate = card.querySelector(".play-gate");
    var status = card.querySelector(".vast-status");
    var skipBtn = card.querySelector(".vast-skip");
    var moreBtn = card.querySelector(".vast-more");
    var progress = card.querySelector(".vast-progress span");
    var loaded = null;
    var tracker = null;
    var started = false;
    var skipAt = null;

    function setStatus(text) {
      if (status) status.textContent = text || "";
    }

    function macrosAt(time) {
      var playhead = formatPlayhead(time || 0);
      return defaultMacros({
        CONTENTPLAYHEAD: playhead,
        ADPLAYHEAD: playhead
      });
    }

    function fail(code, message) {
      if (tracker) tracker.error(code);
      setStatus(message || "Sponsored ad unavailable");
      card.classList.add("vast-empty");
    }

    function loadAd() {
      if (loaded) return loaded;
      setStatus("Loading sponsored ad…");
      loaded = resolveVast(tagUrl).then(function (ad) {
        var media = selectMediaFile(ad.linear.mediaFiles, video);
        if (!media) {
          throw new Error("No compatible MediaFile");
        }
        tracker = createTracker(ad);
        skipAt = skipSeconds(ad.linear.skipoffset, ad.linear.duration);
        video.src = media.url;
        if (moreBtn && ad.linear.clickThrough) {
          moreBtn.hidden = false;
          moreBtn.href = ad.linear.clickThrough;
        }
        setStatus("Sponsored");
        return ad;
      }).catch(function (err) {
        var code = /wrapper/i.test(err.message) ? 302 : /no ad/i.test(err.message) ? 303 : 900;
        fail(code, "Sponsored ad unavailable");
        throw err;
      });
      return loaded;
    }

    function playAd() {
      loadAd().then(function () {
        gate.classList.add("hidden");
        video.controls = true;
        video.muted = false;
        return video.play();
      }).catch(function () {
        if (video.src) {
          video.muted = true;
          video.play().catch(function () {});
        }
      });
    }

    video.addEventListener("playing", function () {
      if (started) return;
      started = true;
      var now = macrosAt(video.currentTime);
      tracker.impression(now);
      tracker.event("start", now);
    });

    video.addEventListener("timeupdate", function () {
      if (!tracker || !video.duration) return;
      var ratio = video.currentTime / video.duration;
      var now = macrosAt(video.currentTime);
      if (ratio >= 0.25) tracker.event("firstQuartile", now);
      if (ratio >= 0.5) tracker.event("midpoint", now);
      if (ratio >= 0.75) tracker.event("thirdQuartile", now);
      if (progress) progress.style.width = Math.min(100, ratio * 100) + "%";
      if (skipBtn && skipAt != null) {
        var remain = Math.ceil(skipAt - video.currentTime);
        skipBtn.hidden = false;
        if (remain > 0) {
          skipBtn.disabled = true;
          skipBtn.textContent = "Skip in " + remain;
        } else {
          skipBtn.disabled = false;
          skipBtn.textContent = "Skip";
        }
      }
    });

    video.addEventListener("ended", function () {
      if (tracker) tracker.event("complete", macrosAt(video.duration));
      gate.classList.remove("hidden");
      setStatus("Sponsored");
    });

    video.addEventListener("pause", function () {
      if (!video.ended && tracker && started) tracker.event("pause", macrosAt(video.currentTime));
    });

    video.addEventListener("play", function () {
      if (started && tracker) tracker.event("resume", macrosAt(video.currentTime));
    });

    video.addEventListener("volumechange", function () {
      if (!tracker || !started) return;
      tracker.event(video.muted || video.volume === 0 ? "mute" : "unmute", macrosAt(video.currentTime));
    });

    video.addEventListener("error", function () {
      fail(405, "Sponsored ad unavailable");
    });

    if (skipBtn) {
      skipBtn.addEventListener("click", function () {
        if (skipBtn.disabled) return;
        if (tracker) tracker.event("skip", macrosAt(video.currentTime));
        video.pause();
        gate.classList.remove("hidden");
      });
    }

    function handleClickThrough(event) {
      if (!loaded || !loaded.then) return;
      loaded.then(function (ad) {
        if (!ad || !ad.linear.clickThrough) return;
        if (tracker) tracker.click(macrosAt(video.currentTime));
        window.open(ad.linear.clickThrough, "_blank", "noopener");
      });
      if (event) event.preventDefault();
    }

    if (moreBtn) moreBtn.addEventListener("click", handleClickThrough);
    video.addEventListener("click", function () {
      if (started && !video.paused) handleClickThrough();
    });

    gate.querySelector(".gate-button").addEventListener("click", function () {
      playAd();
    });

    if ("IntersectionObserver" in window) {
      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            loadAd().catch(function () {});
            observer.disconnect();
          }
        });
      }, { rootMargin: "400px 0px", threshold: 0.01 });
      observer.observe(card);
    } else {
      loadAd().catch(function () {});
    }

    card.dataset.vastSlot = String(slotId);
  }

  root.VastPlayer = {
    resolve: resolveVast,
    selectMediaFile: selectMediaFile,
    mount: mount
  };
})(window);
