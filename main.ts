/// <reference no-default-lib="true" />
/// <reference lib="dom" />
/// <reference lib="deno.ns" />

import "https://deno.land/x/dotenv/load.ts";

import { start } from "$fresh/server.ts";
import manifest from "./fresh.gen.ts";

import twindPlugin from "$fresh/plugins/twind.ts";
import twindConfig from "./twind.config.ts";

import twitter from "./lib/twitter.ts";

// await twitter();

await start(manifest, { plugins: [twindPlugin(twindConfig)] });
