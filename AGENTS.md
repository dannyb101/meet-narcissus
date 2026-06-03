# Agent Instructions

## Project

This repo contains **Meet Narcissus**, a Chrome Manifest V3 extension for Google
Meet. It creates a draggable, camera-adjacent self-view overlay, hides the
original Google Meet self tile while active, and can be toggled from the
extension icon or `Alt+Shift+C`.

Use `CONTEXT.md` as the source of truth for product language and domain terms.
If the project positioning or naming changes, update `CONTEXT.md` first, then
adjust user-facing copy and code comments to match.

## Files

- `manifest.json`: Chrome extension manifest, permissions, content script, and
  web-accessible resource configuration.
- `content.js`: Main content script injected into Google Meet. It owns overlay
  creation, drag behavior, toggle state, original tile hiding/restoration, and
  local video attachment.
- `hook.js`: Page-context hook used to observe local media track IDs from
  `getUserMedia` and `HTMLMediaElement.srcObject`.
- `background.js`: Extension action handler and persisted enabled/disabled
  state.
- `README.md`: User-facing product description, installation, and usage notes.
- `CONTEXT.md`: Domain language and product intent.

## Development Rules

- Keep this dependency-free unless there is a clear extension-specific reason to
  add tooling.
- Prefer plain JavaScript that works in Chrome extension content scripts and the
  Google Meet page context.
- Keep extension storage keys stable unless there is a migration plan. The
  current enabled-state key is `meet_narcissus_enabled`; `msc_enabled` is only
  retained as a legacy migration key.
- Keep DOM selectors and Google Meet DOM assumptions defensive. Meet changes its
  structure frequently, so code should tolerate missing elements, replaced
  video nodes, and SPA navigation.
- Do not collect, store, or transmit user video, meeting data, participant data,
  or personal data.
- Avoid broad host permissions. The extension should remain scoped to
  `https://meet.google.com/*`.
- Preserve the user goal: a camera-adjacent self-view, not merely a centered
  tile. Top-center snapping is a convenience behavior, not the whole product.

## Copy And Naming

- Product name: `Meet Narcissus`.
- Preferred term: `self-view`.
- Preferred term: `camera-adjacent self-view`.
- Preferred term: `original self tile`.
- Avoid referring to the project as `Meet Self-View Center` except when
  describing the original fork/source.

## Verification

There is no automated test suite in this repo yet. For behavior changes, verify
manually by loading the repo as an unpacked Chrome extension:

1. Open `chrome://extensions/`.
2. Enable Developer mode.
3. Load this folder as an unpacked extension.
4. Join or start a Google Meet call with camera enabled.
5. Confirm the overlay appears, attaches to the local camera stream, can be
   dragged, double-click snaps to top-center, `+` and `-` resize it, and icon or
   `Alt+Shift+C` toggles it on and off.
6. Confirm the original self tile is restored when the extension is disabled.

For manifest or permission changes, also reload the extension from
`chrome://extensions/` before testing.
