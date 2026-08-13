# Focus Clock

The workspace includes an accessible, browser-resident focus clock. It begins with a **25-minute focus interval** and a **5-minute break interval**; either duration can be set from 1 to 120 minutes. The clock exposes start/pause, reset, and explicit interval-switch controls.

During local browser validation, the focus state rendered with the expected 25:00 countdown and focus copy. The explicit switch control then entered the break state at 05:00, changed the panel to its muted green reset treatment, and exposed the orbit animation. Decorative break motion is disabled for users who request reduced motion. When an interval naturally completes, the clock uses a short Web Audio chime where browser policy permits, changes to the next mode, and announces the new state through the interface.

The break timer was started and changed from 05:00 to 04:59 with its control relabelled to **Pause**. Selecting Pause left the clock at 04:50 and returned the primary action to **Start focus**, confirming that user pause resumes the correct interval without resetting it.

The paused action labels now describe the active interval rather than the interval that would follow: the initial focus state shows **Start focus**, and the explicit break state shows **Start break**. After progress has elapsed, the same controls become **Resume focus** or **Resume break**. Rendered component tests cover start, pause, reset, mode switching, duration changes, and natural focus-to-break completion, while the standard suite now runs both TypeScript and TSX test files.
