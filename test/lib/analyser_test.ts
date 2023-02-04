import { assertEquals } from "https://deno.land/std@0.171.0/testing/asserts.ts";
import { delay } from "https://deno.land/std@0.109.0/async/delay.ts";

import analyser from "../../lib/analyser.ts";

await analyser.init();

Deno.test("A valid positive text about Tesla", async () => {
  const text =
    "Tesla dominates the 🇬🇧UK Market in December 2022 and has the largest new car market share";
  analyser.analyse(text, (score: number) => {
    assertEquals(score, 1);
  });
  await delay(100);
});

Deno.test("A valid negative text about Tesla", async () => {
  const text = "Tesla is going downhill and nothing can stop it";
  analyser.analyse(text, (score: number) => {
    assertEquals(score, -1);
  });
  await delay(100);
});

Deno.test("An empty text", async () => {
  const text = "";
  analyser.analyse(text, (score: number) => {
    assertEquals(score, NaN);
  });
  await delay(100);
});

Deno.test("A short text with just a letter", async () => {
  const text = "A";
  analyser.analyse(text, (score: number) => {
    assertEquals(score, NaN);
  });
  await delay(100);
});
