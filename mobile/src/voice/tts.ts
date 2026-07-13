import * as Speech from "expo-speech";

import { ttsLocale } from "./locales";

// A slightly lowered pitch and slower rate for a calm, meditative delivery.
const PITCH = 0.95;
const RATE = 0.85;

/**
 * Speak an answer aloud in the locale for the given language. Any speech already
 * in progress is stopped first, so a new answer replaces the previous one.
 */
export function speakAnswer(text: string, languageCode: string): void {
  const trimmed = text.trim();
  if (!trimmed) return;

  Speech.stop();
  Speech.speak(trimmed, {
    language: ttsLocale(languageCode),
    pitch: PITCH,
    rate: RATE,
  });
}

/** Stop any speech currently playing. */
export function stopSpeaking(): void {
  Speech.stop();
}
