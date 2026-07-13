/**
 * Map a language code from the backend to a BCP-47 locale for speech
 * recognition (STT) and synthesis (TTS). Both use the -IN variants per the
 * app's Indian-language corpus.
 */

export function sttLocale(languageCode: string): string {
  return languageCode === "en" ? "en-IN" : "hi-IN";
}

export function ttsLocale(languageCode: string): string {
  return languageCode === "en" ? "en-IN" : "hi-IN";
}
