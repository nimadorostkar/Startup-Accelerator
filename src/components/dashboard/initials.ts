const LETTER = /^\p{L}/u;

/** The first character of a word that is a letter, as a whole grapheme
    (an accented letter stays in one piece), or "" if the word has none. */
function firstLetter(word: string) {
  const chars =
    typeof Intl.Segmenter === "function"
      ? Array.from(new Intl.Segmenter("en", { granularity: "grapheme" }).segment(word), (s) => s.segment)
      : Array.from(word);
  return chars.find((c) => LETTER.test(c)) ?? "";
}

/** "Ada Lovelace" → "AL". Words without a letter ("🚀", "&") are skipped, so
    "Acme 🚀" → "A". Falls back to "?" when no word has a letter. */
export function initials(name: string) {
  const letters = name.trim().split(/\s+/).map(firstLetter).filter(Boolean);
  if (!letters.length) return "?";
  return (letters[0] + (letters.length > 1 ? letters[letters.length - 1] : "")).toUpperCase();
}
