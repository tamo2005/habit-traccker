import { describe, expect, it } from "vitest";
import { habitAssets, SUPABASE_ASSET_BASE_URL } from "./assets";

describe("habitAssets", () => {
  it("maps each branded file to the public habit-assets bucket", () => {
    expect(Object.values(habitAssets)).toHaveLength(5);
    expect(Object.values(habitAssets)).toEqual(
      expect.arrayContaining([
        `${SUPABASE_ASSET_BASE_URL}/signal-flag-logo.png`,
        `${SUPABASE_ASSET_BASE_URL}/signal-paper-field.png`,
        `${SUPABASE_ASSET_BASE_URL}/signal-week-illustration.png`,
        `${SUPABASE_ASSET_BASE_URL}/signal-focus-card.png`,
        `${SUPABASE_ASSET_BASE_URL}/habit-signal-loop.mp3`,
      ]),
    );
  });
});
