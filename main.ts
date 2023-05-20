/// <reference no-default-lib="true" />
/// <reference lib="dom" />
/// <reference lib="deno.ns" />

import "https://deno.land/x/dotenv/load.ts";

import { start } from "$fresh/server.ts";
import manifest from "./fresh.gen.ts";

import twindPlugin from "$fresh/plugins/twind.ts";
import twindConfig from "./twind.config.ts";

import { dotEnv } from "./lib/config.ts";

import analyser from "./lib/analyser.ts";
import db from "./lib/db.ts";

await db.init();
await analyser.init();

if (dotEnv.TWITTER_PULL_CRON_SCHEDULE) {
  import("./lib/twitter.ts").then(async (t) => await t.default());
} else {
  console.log("No TWITTER_PULL_CRON_SCHEDULE set.");
}

if (dotEnv.NOSTR_ENABLE) {
  import("./lib/nostr.ts").then(async (n) => await n.default());
} else {
  console.log("NOSTR_ENABLE not set.");
}

await start(manifest, { plugins: [twindPlugin(twindConfig)] });
