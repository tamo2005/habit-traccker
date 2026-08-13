import { describe, expect, it } from "vitest";
import { MAX_PERSONAL_AUDIO_BYTES, validatePersonalAudio } from "./personalMusic";

describe("validatePersonalAudio", () => {
  it("accepts a normal audio file", () => {
    expect(validatePersonalAudio({ name: "my-focus-track.mp3", type: "audio/mpeg", size: 1024 })).toBeNull();
  });

  it("rejects non-audio, empty, and oversized selections", () => {
    expect(validatePersonalAudio({ name: "notes.txt", type: "text/plain", size: 40 })).toContain("audio");
    expect(validatePersonalAudio({ name: "empty.mp3", type: "audio/mpeg", size: 0 })).toContain("empty");
    expect(validatePersonalAudio({ name: "long.wav", type: "audio/wav", size: MAX_PERSONAL_AUDIO_BYTES + 1 })).toContain("50 MB");
  });
});
