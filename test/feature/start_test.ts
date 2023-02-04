import {
  afterAll,
  beforeAll,
  describe,
} from "https://deno.land/std@0.168.0/testing/bdd.ts";
import { assert } from "https://deno.land/std/testing/asserts.ts";
import puppeteer, {
  Browser,
  Page,
} from "https://deno.land/x/puppeteer@16.2.0/mod.ts";
import { delay } from "https://deno.land/std@0.168.0/async/delay.ts";

import db from "../../lib/db.ts";
import { TweetSchema } from "../../lib/twitter.ts";

await db.init();

beforeAll(async () => {
  // setup db
  await db.clearDb();

  const sixDaysAgo = new Date();
  sixDaysAgo.setDate(sixDaysAgo.getDate() - 6);

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  const tweet1: TweetSchema = {
    score: 0.2,
    text: "Tesla is quite good",
    subject: "tesla",
    keyword: "tesla",
    id: "id-1",
    author_id: "Blackie Lawless",
    date: sixDaysAgo,
  };

  const tweet2: TweetSchema = {
    score: 0.8,
    text: "Tesla is awesome",
    subject: "tesla",
    keyword: "$tsla",
    id: "id-2",
    author_id: "Billy Idol",
    date: yesterday,
  };

  const tweet3: TweetSchema = {
    score: -0.5,
    text: "Microsoft are awesome due to VS Studio Code",
    subject: "microsoft",
    keyword: "microsoft",
    id: "id-3",
    author_id: "Bruce Dickenson",
    date: new Date(),
  };

  await db.insert(tweet1);
  await db.insert(tweet2);
  await db.insert(tweet3);
});

afterAll(async () => {
  // teardown db
  await db.teardown();
});

describe("Start page", () => {
  Deno.test("Initial values", async (t) => {
    const process = Deno.run({
      cmd: [
        "deno",
        "run",
        "-A",
        "--unstable",
        "./test/fixture/main.ts",
      ],
      stderr: "inherit",
    });

    await delay(1000);

    const browser: Browser = await puppeteer.launch({
      args: ["--no-sandbox"],
      headless: true,
    });
    const page: Page = await browser.newPage();
    await t.step("Page loaded", async () => {
      await page.goto("http://localhost:8000", {
        waitUntil: "networkidle2",
      });
    });

    await t.step("Chart is displayed", async () => {
      await page.waitForSelector(".charts");
    });

    let text: string;
    await t.step("Subject 'tesla' is displayed", async () => {
      text = await page.$eval(".chart-tesla", (title) => title.innerText);
      assert(text.includes("Subject: tesla Tweets: 2"));
    });

    await t.step("Subject 'microsoft' is displayed", async () => {
      text = await page.$eval(".chart-microsoft", (title) => title.innerText);
      assert(text.includes("Subject: microsoft Tweets: 1"));
    });

    await browser?.close();

    process.close();
  });
});
