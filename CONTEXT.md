# Meet Narcissus

Meet Narcissus is a browser-extension context for making Google Meet self-view usable without forcing the user to choose between hiding their image and losing camera-adjacent visual feedback.

## Language

**Self-view**:
The user's own live video tile in a video meeting.
_Avoid_: selfie tile, mirror tile

**Camera-adjacent self-view**:
A self-view positioned close enough to the camera that looking at it approximates audience-facing eye contact.
_Avoid_: centered self-view, top-center self-view

**Original self tile**:
The Google Meet-rendered self-view tile that Meet Narcissus replaces visually.
_Avoid_: native mirror, default preview

**Meet Narcissus**:
The product name for the extension, chosen as a playful reference to Narcissus looking at his reflection.
_Avoid_: Meet Self-View Center

## Relationships

- **Meet Narcissus** displays a **camera-adjacent self-view** based on the user's **self-view**.
- **Meet Narcissus** hides the **original self tile** while its replacement overlay is active.
- A **camera-adjacent self-view** is useful because video-call gaze is split between the screen, the camera, other participants, and the user's own image.

## Example Dialogue

> **Dev:** "Should the extension force the self-view to the center?"
> **Domain expert:** "No. The point is not centering; the point is making the self-view camera-adjacent so looking at yourself is closer to eye contact."

## Flagged Ambiguities

- "Center" previously implied a fixed top-center placement. Resolved: the product goal is **camera-adjacent self-view**, with top-center snap as one convenience position.
