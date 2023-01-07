import aposToLexForm from "npm:apos-to-lex-form@^1.0.5";
import natural from "npm:natural@^6";
import sw from "npm:stopword@^2.0.5";

import correctSpelling from "./correctSpelling.ts";

const { SentimentAnalyzer, PorterStemmer, WordTokenizer } = natural;

const analyser = new SentimentAnalyzer("English", PorterStemmer, "afinn");
const tokenizer = new WordTokenizer();

export default (text: string): number => {
  if (!text) return NaN;

  try {
    const lexedReview = aposToLexForm(text).toLowerCase();
    const alphaOnlyReview = lexedReview.replace(/[^a-zA-Z\s]+/g, "");
    const tokenizedReview = tokenizer.tokenize(alphaOnlyReview).map(
      correctSpelling,
    )
      .filter(Boolean);

    const filteredReview = sw.removeStopwords(tokenizedReview);

    return analyser.getSentiment(filteredReview);
  } catch (_) {
    return NaN;
  }
};
