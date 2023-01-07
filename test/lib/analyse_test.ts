import { assertEquals } from "https://deno.land/std@0.171.0/testing/asserts.ts";

import analyse from "../../lib/analyse.ts";

Deno.test("A valid positive text about Tesla", () => {
  const text =
    "Tesla dominates the 🇬🇧UK Market in December 2022 and has the largest new car market share";
  const result = analyse(text);
  assertEquals(result, 0.1);
});

Deno.test("A valid negative text about Tesla", () => {
  const text = "Tesla is going downhill and nothing can stop it";
  const result = analyse(text);
  assertEquals(result, -0.2);
});

Deno.test("An empty text", () => {
  const text = "";
  const result = analyse(text);
  assertEquals(result, NaN);
});

Deno.test("A short text with just a letter", () => {
  const text = "A";
  const result = analyse(text);
  assertEquals(result, NaN);
});
