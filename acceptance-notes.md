# Acceptance notes

- The production-style development preview loads in signed-out device-only mode with the existing four starter habits.
- The focus-sound control successfully changes from **Play** to **Pause** and displays the confirmation message, confirming playback starts only after an explicit user action.
- While playback is active, the mute control changes its accessible label to **Unmute focus sound**, and the volume range accepts a reduced value of `0.15`.
- The branded favicon is wired in `client/index.html` to the Signal / Streak flag mark and the page title is `Habit. — Signal / Streak`.
- The hosted development preview recorded successful protected `auth.me` and `habits.list` responses for a signed-in session, including the automatically created four-habit cloud board.
- A direct sandbox-browser attempt to open the OAuth portal reached an external 403 response before authentication. The server-side auth wiring and protected procedures are validated, but the final public OAuth callback must be tested from the configured production host.
