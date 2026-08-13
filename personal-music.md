# Personal Music

Signal / Streak now offers a **Use your music** control in the focus-sound panel. The browser file control accepts `audio/*` media and explains that a chosen track remains local to the browser; it is not uploaded to Supabase, included in cloud sync, or shared with any other user.

The selector validates empty files, non-audio MIME types, and files larger than 50 MB before creating a temporary in-browser object URL. The temporary URL is revoked when the user replaces or removes the selection, and choosing **Remove personal music** returns playback to the built-in Signal loop.

Local workspace inspection confirmed that the visible control and privacy guidance render beside the focus-sound play, mute, and volume controls. Its native picker is constrained to the `audio/*` MIME family before parser-level validation runs.

Browser-level validation selected `habit-signal-loop.mp3` through the native file field. The workspace immediately displayed the local filename, changed the action to **Change track**, exposed the remove control, and confirmed that the selected track is never uploaded or synced.
