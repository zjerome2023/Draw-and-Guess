import Word from '../models/Word.js';
import { DEFAULT_WORDS } from '../data/defaultWords.js';

let dbAvailable = false;

export function setDbAvailable(available) {
  dbAvailable = available;
}

export async function getRandomWords(count = 3, categories = []) {
  if (dbAvailable) {
    try {
      const filter = categories.length ? { category: { $in: categories } } : {};
      const words = await Word.aggregate([
        { $match: filter },
        { $sample: { size: count } },
      ]);
      if (words.length >= count) {
        return words.map((w) => w.text);
      }
    } catch {
      // fall through to defaults
    }
  }

  const pool = categories.length
    ? DEFAULT_WORDS.filter((w) => categories.includes(w.category))
    : DEFAULT_WORDS;

  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count).map((w) => w.text);
}

export async function seedWords() {
  if (!dbAvailable) return;
  for (const word of DEFAULT_WORDS) {
    await Word.updateOne({ text: word.text }, word, { upsert: true });
  }
}
