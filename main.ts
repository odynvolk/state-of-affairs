/// <reference no-default-lib="true" />
/// <reference lib="dom" />
/// <reference lib="deno.ns" />

import "https://deno.land/x/dotenv/load.ts";

import { start } from "$fresh/server.ts";
import manifest from "./fresh.gen.ts";

import twindPlugin from "$fresh/plugins/twind.ts";
import twindConfig from "./twind.config.ts";

if (Deno.env.get("TWITTER_PULL_CRON_SCHEDULE")) {
  import("./lib/twitter.ts").then(async (t) => await t.default());
} else {
  console.log("No TWITTER_PULL_CRON_SCHEDULE set...");
}

await start(manifest, { plugins: [twindPlugin(twindConfig)] });
