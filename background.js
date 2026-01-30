const STORAGE_KEY = "msc_enabled";

chrome.action.onClicked.addListener(async (tab) => {
  try {
    const res = await chrome.storage.local.get([STORAGE_KEY]);
    const current = typeof res[STORAGE_KEY] === "boolean" ? res[STORAGE_KEY] : true;
    const next = !current;

    await chrome.storage.local.set({ [STORAGE_KEY]: next });

    // Пытаемся сообщить content script-у, чтобы он сразу применил
    if (tab?.id) {
      chrome.tabs.sendMessage(tab.id, { type: "MSC_SET_ENABLED", enabled: next }).catch(() => {});
    }

    // (опционально) бейдж: ON/OFF
    chrome.action.setBadgeText({ tabId: tab.id, text: next ? "ON" : "OFF" }).catch(() => {});
  } catch (_) {
    // ignore
  }
});