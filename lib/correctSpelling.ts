import natural from "npm:natural@^6.1.2";

const init = async () => {
  const corpus = await Deno.readTextFile("./data/corpus.txt");

  const words = corpus.split("\n").reduce((acc: Set<string>, line: string) => {
    line.split(" ").forEach((word) => {
      const cleaned = word.trim().replace(/[^a-zA-Z\s]+/g, "");
      if (cleaned.length > 0) {
        acc.add(cleaned.toLowerCase());
      }
    });

    return acc;
  }, new Set());

  return new natural.Spellcheck(Array.from(words));
};

const spellcheck = await init();

export default (word: string): string => {
  if (spellcheck.isCorrect(word)) return word;

  const corrections = spellcheck.getCorrections(word, 1);
  return corrections.length > 0 ? corrections[0] : word;
};
