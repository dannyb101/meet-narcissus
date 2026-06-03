(() => {
  const TAG = "[MeetNarcissus]";
  const STORAGE_KEY = "msc_enabled";
  const HOTKEY = { altKey: true, shiftKey: true, code: "KeyC" }; // Alt+Shift+C

  const TOP_OFFSET_PX = 12;

  const DEFAULT_WIDTH = 320;
  const DEFAULT_HEIGHT = 180;

  const APPLY_INTERVAL_MS = 400;
  const HIDE_GRACE_MS = 1500;

  const HIDE_ORIGINAL = true;
  const OVERLAY_ID = "msc-overlay";

  let enabled = true;
  let localTrackIds = new Set();

  let overlay = null;
  let overlayVideo = null;
  let controls = null;
  let btnPlus = null;
  let btnMinus = null;
  let tip = null;

  let lastAttachedStream = null;
  let lastSeenLiveAt = 0;
  let streamListenersBound = new WeakSet();

  let lastUrl = location.href;
  let currentScale = 1.0; // 1.0 = 100%, 0.5 = 50%

  function injectHookScript() {
    const s = document.createElement("script");
    s.src = chrome.runtime.getURL("hook.js");
    s.async = false;
    s.onload = () => s.remove();
    (document.head || document.documentElement).appendChild(s);
  }

  function hideOriginal(videoEl) {
    if (!HIDE_ORIGINAL || !videoEl) return;

    // never hide our overlay
    if (videoEl.closest && videoEl.closest(`#${OVERLAY_ID}`)) return;

    const el = getOriginalContainer(videoEl);
    if (!el || el === document.documentElement || el === document.body) return;

    restoreAllOriginalExcept(el);

    if (el.dataset.mscHidden === "1") return;

    el.dataset.mscPrevOpacity = el.style.opacity || "";
    el.dataset.mscPrevPointerEvents = el.style.pointerEvents || "";
    el.dataset.mscPrevFilter = el.style.filter || "";
    el.dataset.mscPrevVisibility = el.style.visibility || "";
    el.dataset.mscHidden = "1";

    el.style.setProperty("opacity", "0", "important");
    el.style.setProperty("pointer-events", "none", "important");
    el.style.setProperty("filter", "opacity(0)", "important");
    el.style.setProperty("visibility", "hidden", "important");
  }

  function getOriginalContainer(videoEl) {
    let el = videoEl;
    let candidate = videoEl;
    const videoRect = videoEl.getBoundingClientRect();

    for (let i = 0; i < 10 && el.parentElement; i++) {
      const p = el.parentElement;

      // never hide roots
      if (p === document.documentElement || p === document.body) break;

      const r = p.getBoundingClientRect();
      const hasTileSize = r.width >= 120 && r.height >= 90;
      const hasSingleVideo = p.querySelectorAll("video").length === 1;
      const roughlySameTile =
        Math.abs(r.width - videoRect.width) <= Math.max(8, videoRect.width * 0.08) &&
        Math.abs(r.height - videoRect.height) <= Math.max(8, videoRect.height * 0.08);

      if (hasTileSize && hasSingleVideo && roughlySameTile) {
        candidate = p;
      }
      el = p;
    }

    return candidate;
  }

  function restoreOriginalElement(el) {
    if (!el || el === document.documentElement || el === document.body) return;

    const prevOpacity = el.dataset.mscPrevOpacity ?? "";
    const prevPE = el.dataset.mscPrevPointerEvents ?? "";
    const prevFilter = el.dataset.mscPrevFilter ?? "";
    const prevVisibility = el.dataset.mscPrevVisibility ?? "";

    if (prevOpacity) el.style.opacity = prevOpacity; else el.style.removeProperty("opacity");
    if (prevPE) el.style.pointerEvents = prevPE; else el.style.removeProperty("pointer-events");
    if (prevFilter) el.style.filter = prevFilter; else el.style.removeProperty("filter");
    if (prevVisibility) el.style.visibility = prevVisibility; else el.style.removeProperty("visibility");

    delete el.dataset.mscPrevOpacity;
    delete el.dataset.mscPrevPointerEvents;
    delete el.dataset.mscPrevFilter;
    delete el.dataset.mscPrevVisibility;
    delete el.dataset.mscHidden;
  }

  function restoreAllOriginalExcept(currentEl) {
    const hidden = document.querySelectorAll('[data-msc-hidden="1"]');
    hidden.forEach((el) => {
      if (el !== currentEl) restoreOriginalElement(el);
    });
  }

  function restoreAllOriginal() {
    const hidden = document.querySelectorAll('[data-msc-hidden="1"]');
    hidden.forEach(restoreOriginalElement);
  }

  function snapTopCenter() {
    if (!overlay) return;
    overlay.style.transform = "translateX(-50%)";
    overlay.style.left = "50%";
    overlay.style.top = `${TOP_OFFSET_PX}px`;
  }

  function refreshVideoRendering() {
    if (!overlayVideo) return;
    const s = overlayVideo.srcObject;
    if (!s) return;

    requestAnimationFrame(() => {
      if (!overlayVideo) return;
      try {
        overlayVideo.srcObject = s;
        overlayVideo.play?.().catch(() => {});
      } catch (_) {}
    });
  }

  function updateScaleButtons() {
    if (!btnPlus || !btnMinus) return;
    btnPlus.style.display = (currentScale >= 1.0) ? "none" : "inline-block";
    btnMinus.style.display = (currentScale <= 0.5) ? "none" : "inline-block";
  }

  function setScale(scale) {
    ensureOverlay();
    if (!overlay) return;

    currentScale = scale;

    const w = Math.round(DEFAULT_WIDTH * scale);
    const h = Math.round(DEFAULT_HEIGHT * scale);

    overlay.style.width = `${w}px`;
    overlay.style.height = `${h}px`;

    updateScaleButtons();
    refreshVideoRendering();
  }

  function styleTinyButton(btn) {
    btn.type = "button";
    btn.style.width = "18px";
    btn.style.height = "18px";
    btn.style.padding = "0";
    btn.style.border = "none";
    btn.style.borderRadius = "0";
    btn.style.background = "transparent";
    btn.style.color = "rgba(255,255,255,0.95)";
    btn.style.font = "18px/18px system-ui, -apple-system, Segoe UI, Roboto";
    btn.style.cursor = "pointer";
    btn.style.pointerEvents = "auto";

    btn.style.outline = "none";
    btn.style.boxShadow = "none";
    btn.style.webkitAppearance = "none";
    btn.style.webkitTapHighlightColor = "transparent";
    btn.style.textShadow = "0 1px 2px rgba(0,0,0,0.7)";
  }

  function ensureOverlay() {
    if (overlay) return;

    overlay = document.createElement("div");
    overlay.id = OVERLAY_ID;
    overlay.style.position = "fixed";
    overlay.style.left = "50%";
    overlay.style.top = `${TOP_OFFSET_PX}px`;
    overlay.style.transform = "translateX(-50%)";
    overlay.style.zIndex = "2147483647";
    overlay.style.width = `${DEFAULT_WIDTH}px`;
    overlay.style.height = `${DEFAULT_HEIGHT}px`;
    overlay.style.borderRadius = "14px";
    overlay.style.overflow = "hidden";
    overlay.style.boxShadow = "0 12px 40px rgba(0,0,0,0.35)";
    overlay.style.background = "black";
    overlay.style.display = "none";
    overlay.style.cursor = "move";

    overlayVideo = document.createElement("video");
    overlayVideo.autoplay = true;
    overlayVideo.playsInline = true;
    overlayVideo.muted = true;
    overlayVideo.style.position = "absolute";
    overlayVideo.style.left = "0";
    overlayVideo.style.top = "0";
    overlayVideo.style.right = "0";
    overlayVideo.style.bottom = "0";
    overlayVideo.style.width = "100%";
    overlayVideo.style.height = "100%";
    overlayVideo.style.objectFit = "cover";
    overlayVideo.style.display = "block";
    overlayVideo.style.zIndex = "1";
    overlayVideo.style.background = "black";
    overlayVideo.style.transform = "scaleX(-1) translateZ(0)";
    overlay.appendChild(overlayVideo);

    tip = document.createElement("div");
    tip.textContent = "Double-click to snap";
    tip.style.position = "absolute";
    tip.style.left = "8px";
    tip.style.top = "8px";
    tip.style.zIndex = "2";
    tip.style.pointerEvents = "none";
    tip.style.padding = "4px 8px";
    tip.style.borderRadius = "10px";
    tip.style.background = "rgba(0,0,0,0.0)";
    tip.style.color = "rgba(255,255,255,0.75)";
    tip.style.font = "11px/14px system-ui, -apple-system, Segoe UI, Roboto";
    tip.style.textShadow = "0 1px 2px rgba(0,0,0,0.6)";
    overlay.appendChild(tip);

    controls = document.createElement("div");
    controls.style.position = "absolute";
    controls.style.right = "8px";
    controls.style.top = "8px";
    controls.style.height = "22px";
    controls.style.display = "flex";
    controls.style.alignItems = "center";
    controls.style.gap = "10px";
    controls.style.zIndex = "3";
    controls.style.pointerEvents = "none";
    overlay.appendChild(controls);

    btnMinus = document.createElement("button");
    btnMinus.textContent = "-";
    btnMinus.title = "50%";
    styleTinyButton(btnMinus);
    btnMinus.style.pointerEvents = "auto";
    controls.appendChild(btnMinus);

    btnPlus = document.createElement("button");
    btnPlus.textContent = "+";
    btnPlus.title = "100%";
    styleTinyButton(btnPlus);
    btnPlus.style.pointerEvents = "auto";
    controls.appendChild(btnPlus);

    updateScaleButtons();

    // prevent focus ring on mouse click
    btnMinus.addEventListener("mousedown", (e) => e.preventDefault());
    btnPlus.addEventListener("mousedown", (e) => e.preventDefault());

    btnMinus.addEventListener("click", (e) => {
      setScale(0.5);
      e.preventDefault();
      e.stopPropagation();
    });

    btnPlus.addEventListener("click", (e) => {
      setScale(1.0);
      e.preventDefault();
      e.stopPropagation();
    });

    document.documentElement.appendChild(overlay);

    let dragging = false;
    let startX = 0, startY = 0;
    let startLeft = 0, startTop = 0;

    function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }

    overlay.addEventListener("dblclick", (e) => {
      if (e.target && e.target.closest("button")) return;
      snapTopCenter();
      e.preventDefault();
      e.stopPropagation();
    });

    overlay.addEventListener("pointerdown", (e) => {
      if (e.target && e.target.closest("button")) return;

      dragging = true;
      overlay.setPointerCapture(e.pointerId);

      const r = overlay.getBoundingClientRect();
      startX = e.clientX;
      startY = e.clientY;
      startLeft = r.left;
      startTop = r.top;

      overlay.style.transform = "none";
      overlay.style.left = `${r.left}px`;
      overlay.style.top = `${r.top}px`;

      e.preventDefault();
      e.stopPropagation();
    });

    overlay.addEventListener("pointermove", (e) => {
      if (!dragging) return;

      const dx = e.clientX - startX;
      const dy = e.clientY - startY;

      const r = overlay.getBoundingClientRect();
      const newLeft = clamp(startLeft + dx, 0, window.innerWidth - r.width);
      const newTop = clamp(startTop + dy, 0, window.innerHeight - r.height);

      overlay.style.left = `${newLeft}px`;
      overlay.style.top = `${newTop}px`;

      e.preventDefault();
      e.stopPropagation();
    });

    overlay.addEventListener("pointerup", (e) => {
      dragging = false;
      e.preventDefault();
      e.stopPropagation();
    });

    console.log(TAG, "overlay created");
  }

  function showOverlay() {
    if (overlay) overlay.style.display = "block";
  }

  function hideOverlayHard() {
    if (overlay) overlay.style.display = "none";
    if (overlayVideo) overlayVideo.srcObject = null;
    lastAttachedStream = null;
  }

  function destroyOverlayAndRestore() {
    if (overlay) overlay.remove();
    overlay = null;
    overlayVideo = null;
    controls = null;
    btnPlus = null;
    btnMinus = null;
    tip = null;
    lastAttachedStream = null;
    restoreAllOriginal();
  }

  function findSelfStream() {
    if (localTrackIds.size) {
      for (const v of document.querySelectorAll("video")) {
        if (v.closest && v.closest(`#${OVERLAY_ID}`)) continue;

        const so = v.srcObject;
        if (!so || typeof so.getVideoTracks !== "function") continue;

        for (const t of so.getVideoTracks()) {
          if (t && localTrackIds.has(t.id)) return { stream: so, videoEl: v };
        }
      }
    }

    const candidates = Array.from(document.querySelectorAll("video"))
      .filter(v => !(v.closest && v.closest(`#${OVERLAY_ID}`)))
      .filter(v => v.srcObject && typeof v.srcObject.getVideoTracks === "function");

    if (!candidates.length) return null;

    let best = null;
    let bestScore = Infinity;

    for (const v of candidates) {
      const r = v.getBoundingClientRect();
      const area = Math.max(1, r.width * r.height);
      const mutedBonus = (v.muted || v.volume === 0) ? 0.5 : 1.0;
      const visiblePenalty = (r.width > 0 && r.height > 0) ? 1 : 10;
      const score = area * mutedBonus * visiblePenalty;

      if (score < bestScore) {
        bestScore = score;
        best = v;
      }
    }

    return best ? { stream: best.srcObject, videoEl: best } : null;
  }

  function isStreamLive(stream) {
    try {
      const vts = stream.getVideoTracks?.() || [];
      return vts.some(t => t.readyState === "live");
    } catch (_) {
      return false;
    }
  }

  function bindStreamLifecycle(stream) {
    if (!stream || streamListenersBound.has(stream)) return;
    streamListenersBound.add(stream);

    const onDead = () => {};

    try { stream.addEventListener?.("inactive", onDead); } catch (_) {}
    try {
      for (const t of stream.getTracks?.() || []) t.addEventListener?.("ended", onDead);
    } catch (_) {}
  }

  function attachStream(stream) {
    ensureOverlay();
    if (!overlayVideo) return;

    if (lastAttachedStream === stream && overlayVideo.srcObject === stream) {
      showOverlay();
      return;
    }

    lastAttachedStream = stream;
    overlayVideo.srcObject = stream;
    showOverlay();
    overlayVideo.play?.().catch(() => {});

    bindStreamLifecycle(stream);
    console.log(TAG, "overlay stream attached");
  }

  function apply() {
    if (!enabled) return;

    if (location.href !== lastUrl) {
      lastUrl = location.href;
      lastSeenLiveAt = 0;
      console.log(TAG, "URL changed:", lastUrl);
    }

    const found = findSelfStream();

    if ((!found || !found.stream) && lastAttachedStream && isStreamLive(lastAttachedStream)) {
      showOverlay();
      return;
    }

    if (!found || !found.stream) {
      const now = Date.now();
      if (now - lastSeenLiveAt > HIDE_GRACE_MS) {
        hideOverlayHard();
        restoreAllOriginal();
      }
      return;
    }

    const live = isStreamLive(found.stream);
    if (live) lastSeenLiveAt = Date.now();

    if (!live) {
      const now = Date.now();
      if (now - lastSeenLiveAt > HIDE_GRACE_MS) {
        hideOverlayHard();
        restoreAllOriginal();
      }
      return;
    }

    attachStream(found.stream);
    hideOriginal(found.videoEl);
  }

  function setupTrackListener() {
    window.addEventListener("message", (event) => {
      if (!event?.data) return;
      if (event.data.type !== "MEET_SELF_VIEW_CENTER_LOCAL_TRACKS") return;
      if (event.data.source !== "getUserMedia") return;

      const ids = Array.isArray(event.data.trackIds) ? event.data.trackIds : [];
      if (!ids.length) return;

      localTrackIds = new Set(ids);
      console.log(TAG, "received trackIds:", ids, "source:", event.data.source);

      apply();
    });
  }

  function setupHotkey() {
    window.addEventListener("keydown", (e) => {
      const ok = e.altKey === HOTKEY.altKey && e.shiftKey === HOTKEY.shiftKey && e.code === HOTKEY.code;
      if (!ok) return;

      enabled = !enabled;
      chrome.storage.local.set({ [STORAGE_KEY]: enabled });
      console.log(TAG, "toggle enabled:", enabled);

      if (!enabled) destroyOverlayAndRestore();
      if (enabled) apply();
    });
  }

  function setupExtensionMessages() {
    chrome.runtime.onMessage.addListener((msg) => {
      if (!msg || msg.type !== "MSC_SET_ENABLED") return;

      enabled = !!msg.enabled;
      console.log(TAG, "set enabled from action:", enabled);

      if (!enabled) destroyOverlayAndRestore();
      else apply();
    });
  }

  function loadEnabledFlag() {
    chrome.storage.local.get([STORAGE_KEY], (res) => {
      if (typeof res[STORAGE_KEY] === "boolean") enabled = res[STORAGE_KEY];
      console.log(TAG, "enabled:", enabled);
      if (!enabled) destroyOverlayAndRestore();
    });
  }

  injectHookScript();
  loadEnabledFlag();
  setupTrackListener();
  setupHotkey();
  setupExtensionMessages();

  setInterval(() => apply(), APPLY_INTERVAL_MS);
})();
