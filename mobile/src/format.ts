import type { QAPair } from "./api";
import type { Message } from "./types";

/**
 * Prettify a raw book id from the index (e.g. "008_Amrit_Ki_Disha") into a
 * human-friendly title ("Amrit Ki Disha") for display under an answer.
 */
export function formatBookTitle(book: string): string {
  return book
    .replace(/^\d+[_\-\s]*/, "") // drop leading catalog number
    .replace(/[_]+/g, " ") // underscores -> spaces
    .replace(/\s+/g, " ")
    .trim();
}

let counter = 0;
/** Simple unique id for chat messages. */
export function makeId(): string {
  counter += 1;
  return `${Date.now().toString(36)}-${counter}`;
}

/** Pair up the chat thread into {question, answer} turns (skipping error
 * bubbles) for sending as conversation history. */
export function messagesToHistory(messages: Message[]): QAPair[] {
  const pairs: QAPair[] = [];
  for (let i = 0; i < messages.length - 1; i += 1) {
    const a = messages[i];
    const b = messages[i + 1];
    if (a.role === "user" && b.role === "assistant" && !b.error) {
      pairs.push({ question: a.text, answer: b.text });
    }
  }
  return pairs;
}
