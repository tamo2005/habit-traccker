export const SUPABASE_ASSET_BASE_URL =
  "https://dsglpcmxnbbixsmevzsh.supabase.co/storage/v1/object/public/habit-assets";

export const habitAssets = {
  logo: `${SUPABASE_ASSET_BASE_URL}/signal-flag-logo.png`,
  paperField: `${SUPABASE_ASSET_BASE_URL}/signal-paper-field.png`,
  weekIllustration: `${SUPABASE_ASSET_BASE_URL}/signal-week-illustration.png`,
  focusCard: `${SUPABASE_ASSET_BASE_URL}/signal-focus-card.png`,
  focusSound: `${SUPABASE_ASSET_BASE_URL}/habit-signal-loop.mp3`,
} as const;
