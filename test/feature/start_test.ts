import puppeteer from "https://deno.land/x/puppeteer@16.2.0/mod.ts";

import { afterAll, assertExists, beforeAll, Browser, delay, describe, Page } from "../../deps.ts";
import db from "../../lib/db.ts";
import { SentimentSchema, SentimentTypes } from "../../lib/interfaces.ts";

beforeAll(async () => {
  await db.init();
  // setup db
  await db.clearDb();

  const sixDaysAgo = new Date();
  sixDaysAgo.setDate(sixDaysAgo.getDate() - 6);

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  const sentiment1: SentimentSchema = {
    text: "Tesla is quite good",
    keyword: "tesla",
    id: "id-1",
    author_id: "Blackie Lawless",
    sentiment: 1,
    metadata: {
      subject: "tesla",
      type: SentimentTypes.TWITTER,
    },
  };

  const sentiment2: SentimentSchema = {
    text: "Tesla is awesome",
    keyword: "$tsla",
    id: "id-2",
    author_id: "Billy Idol",
    sentiment: 1,
    metadata: {
      subject: "tesla",
      type: SentimentTypes.TWITTER,
    },
  };

  const sentiment3: SentimentSchema = {
    text: "Microsoft are crap due to VS Studio Code",
    keyword: "microsoft",
    id: "id-3",
    author_id: "Bruce Dickenson",
    sentiment: -1,
    metadata: {
      subject: "microsoft",
      type: SentimentTypes.TWITTER,
    },
  };

  await db.insert(sentiment1);
  await db.insert(sentiment2);
  await db.insert(sentiment3);
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

    await t.step("Panel with timeline is displayed", async () => {
      await page.waitForSelector(".panel-timeline");
    });

    await t.step("Panel with subjects is displayed", async () => {
      await page.waitForSelector(".panel-subjects");
    });

    await t.step("User clicks on button for 'tesla'", async () => {
      await page.click(".button-tesla");
    });

    await t.step("Chart for 'tesla' is displayed", async () => {
      const chart = await page.$eval(".chart-tesla", (el) => el);
      assertExists(chart);
    });

    await t.step("User clicks on button for 'microsoft'", async () => {
      await page.click(".button-microsoft");
    });

    await t.step("Chart for 'microsoft' is displayed", async () => {
      const chart = await page.$eval(".chart-microsoft", (el) => el);
      assertExists(chart);
    });

    await browser?.close();

    process.close();
  });
});
