export const MAX_PERSONAL_AUDIO_BYTES = 50 * 1024 * 1024;

export type PersonalAudioFile = Pick<File, "name" | "size" | "type">;

export function validatePersonalAudio(file: PersonalAudioFile): string | null {
  if (!file.size) return "That audio file is empty.";
  if (file.size > MAX_PERSONAL_AUDIO_BYTES) return "Choose an audio file smaller than 50 MB.";
  if (file.type && !file.type.startsWith("audio/")) return "Choose an audio file such as MP3, WAV, M4A, or OGG.";
  return null;
}
