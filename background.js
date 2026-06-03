const STORAGE_KEY = "meet_narcissus_enabled";
const LEGACY_STORAGE_KEY = "msc_enabled";
const SET_ENABLED_MESSAGE = "MEET_NARCISSUS_SET_ENABLED";

chrome.action.onClicked.addListener(async (tab) => {
  try {
    const res = await chrome.storage.local.get([STORAGE_KEY, LEGACY_STORAGE_KEY]);
    const current =
      typeof res[STORAGE_KEY] === "boolean"
        ? res[STORAGE_KEY]
        : typeof res[LEGACY_STORAGE_KEY] === "boolean"
          ? res[LEGACY_STORAGE_KEY]
          : true;
    const next = !current;

    await chrome.storage.local.set({ [STORAGE_KEY]: next });
    await chrome.storage.local.remove(LEGACY_STORAGE_KEY);

    // Tell the content script so the current Meet tab updates immediately.
    if (tab?.id) {
      chrome.tabs.sendMessage(tab.id, { type: SET_ENABLED_MESSAGE, enabled: next }).catch(() => {});
    }

    chrome.action.setBadgeText({ tabId: tab.id, text: next ? "ON" : "OFF" }).catch(() => {});
  } catch (_) {
    // ignore
  }
});
