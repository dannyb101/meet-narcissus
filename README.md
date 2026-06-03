# Meet Narcissus&nbsp;&nbsp;&nbsp;<img src="icons/icon48.png" width="28" height="28" align="bottom" alt="icon" />

Meet Narcissus is a Chrome extension for Google Meet that admits the quiet part:
on video calls, many of us look at ourselves.

Instead of pretending we are all above this deeply human habit, Meet Narcissus
turns your Google Meet self-view into a draggable overlay. Put it where it
actually helps, including just below your camera, so checking your own face
keeps your gaze closer to the people you are speaking to.

## Why Narcissus?

In Greek mythology, Narcissus became transfixed by his own reflection. The name
is tongue-in-cheek, but the problem is real: video calls give us a live mirror
while asking us to look engaged, present, and camera-aware.

YouGov found that among people who use video on work conference calls, 25% said
they spend more time looking at themselves than at colleagues. Jeremy
Bailenson's Stanford work on Zoom fatigue describes self-view as "An All Day
Mirror" and argues that a constant real-time view of ourselves can drive
self-evaluation. Eye-tracking work reported by Iowa State also found that
participants' gaze patterns on video calls are not as simple as "look at the
speaker", and that women looked at their own videos more than men in that study.

The gaze problem matters because eye contact is part of how audiences read
attention and engagement. Research on perceived direct gaze in video conferences
notes that gaze direction is a common problem: camera position, screen position,
tile size, and participant layout all get in the way.

So Meet Narcissus does not shame the mirror. It moves the mirror.

## The Origin Story

I first noticed the problem in stand-ups and regular meetings: I was mostly
looking at myself. At first I hid my video completely. Then I used Google Meet's
floating self-view and pinned it to corners. Eventually I wanted the self-view
directly below the camera so I could keep an eye on myself while maintaining
better eye contact.

There was a workaround: right-click, drag, right-click again, then click outside
the screen to coax the tile into place. It worked just enough to be annoying.
Meet Narcissus is the actual fix.

## What It Does

- Creates a floating Google Meet self-view overlay
- Lets you drag your self-view anywhere on the screen
- Snaps to top-center on double-click
- Supports quick size toggle: `+` for 100%, `-` for 50%
- Hides the original Google Meet self tile so you do not get duplicate mirrors
- Toggles on/off from the extension icon or `Alt+Shift+C`

## Useful Reading And Examples

- [YouGov: A quarter of the people on your work Zoom call are watching themselves](https://yougov.com/en-us/articles/33801-work-video-chats-watching-self-poll)
- [Stanford/APA: Nonverbal Overload: A Theoretical Argument for the Causes of Zoom Fatigue](https://tmb.apaopen.org/pub/nonverbal-overload)
- [Iowa State: Eye tracking reveals where people look during Zoom, Webex](https://research.iastate.edu/2022/02/10/eye-tracking-reveals-where-people-look-during-zoom-webex/)
- [Cognitive Research: Perception of direct gaze in a video-conference setting](https://link.springer.com/article/10.1186/s41235-022-00418-1)
- [The Guardian: Zoom's worst side-effect? Staring at yourself](https://www.theguardian.com/commentisfree/2021/mar/15/zoom-video-calling)
- [Regier Education: One Way to Combat Zoom Fatigue](https://www.regiereducation.com/zoom-fatigue/) and its [video tutorial](https://www.youtube.com/watch?v=jq88BBvttVY)
- [Cloud Adoption Solutions: Hide Self View in Zoom](https://cloudadoption.solutions/hide-self-view-in-zoom-cas-come-and-see-video/) and its [video tutorial](https://www.youtube.com/watch?v=15rfsZNdA5g)

## Install (Unpacked)

1. Download this repo as ZIP, or clone it.
2. Open Chrome: `chrome://extensions/`
3. Enable **Developer mode**.
4. Click **Load unpacked**.
5. Select the folder that contains `manifest.json`.

## Usage

1. Open Google Meet: `https://meet.google.com/`
2. Start or join a meeting with your camera enabled.
3. Drag the Meet Narcissus overlay near your camera or wherever it helps.
4. Double-click the overlay to snap it to top-center.
5. Use `-` for 50% size and `+` for 100% size.
6. Click the extension icon, or press `Alt+Shift+C`, to toggle it on or off.

## Notes

Google Meet is frequently updated, so selectors may break over time. If
something stops working, open an issue.

Tested on Chrome (macOS) on 2026-01-30.

## Privacy

Meet Narcissus does not collect, store, or transmit any personal data. All
processing happens locally in your browser.

## License

MIT
