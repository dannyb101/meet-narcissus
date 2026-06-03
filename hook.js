(() => {
  const TAG = "[Meet Narcissus hook]";
  const LOCAL_TRACKS_MESSAGE = "MEET_NARCISSUS_LOCAL_TRACKS";
  const HOOKED_FLAG = "__meetNarcissusHooked";

  function postTrackIds(trackIds, source) {
    try {
      window.postMessage(
        { type: LOCAL_TRACKS_MESSAGE, trackIds, source },
        "*"
      );
    } catch (e) {
      console.warn(TAG, "postMessage failed", e);
    }
  }

  // 1) Hook getUserMedia
  const md = navigator.mediaDevices;
  const ORIGINAL = md && md.getUserMedia;

  if (ORIGINAL && !ORIGINAL[HOOKED_FLAG]) {
    const wrapped = async function (constraints) {
      const stream = await ORIGINAL.call(md, constraints);

      try {
        const ids = (stream.getVideoTracks?.() || [])
          .map(t => t?.id)
          .filter(Boolean);

        if (ids.length) {
          console.log(TAG, "Captured trackIds via getUserMedia:", ids);
          postTrackIds(ids, "getUserMedia");
        }
      } catch (e) {
        console.warn(TAG, "Failed to read tracks from stream", e);
      }

      return stream;
    };

    wrapped[HOOKED_FLAG] = true;
    md.getUserMedia = wrapped;
    console.log(TAG, "Hook installed (getUserMedia)");
  } else {
    console.log(TAG, "getUserMedia not found or already hooked");
  }

  // 2) Hook video.srcObject setter (ловит stream даже если getUserMedia уже был)
  try {
    const desc = Object.getOwnPropertyDescriptor(HTMLMediaElement.prototype, "srcObject");
    if (desc && desc.set && !desc.set[HOOKED_FLAG]) {
      const originalSet = desc.set;

      const wrappedSet = function (value) {
        try {
          if (value && typeof value.getVideoTracks === "function") {
            const ids = (value.getVideoTracks() || [])
              .map(t => t?.id)
              .filter(Boolean);

            if (ids.length) {
              console.log(TAG, "Captured trackIds via srcObject:", ids);
              postTrackIds(ids, "srcObject");
            }
          }
        } catch (e) {
          // ignore
        }

        return originalSet.call(this, value);
      };

      wrappedSet[HOOKED_FLAG] = true;

      Object.defineProperty(HTMLMediaElement.prototype, "srcObject", {
        get: desc.get,
        set: wrappedSet,
        configurable: true,
        enumerable: desc.enumerable
      });

      console.log(TAG, "Hook installed (srcObject)");
    } else {
      console.log(TAG, "srcObject descriptor not hookable or already hooked");
    }
  } catch (e) {
    console.warn(TAG, "Failed to hook srcObject", e);
  }
})();
