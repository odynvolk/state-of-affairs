/// <reference no-default-lib="true" />
/// <reference lib="dom" />
/// <reference lib="dom.iterable" />
/// <reference lib="dom.asynciterable" />
/// <reference lib="deno.ns" />

Deno.env.set("IS_TEST", "true");

import "https://deno.land/x/dotenv/load.ts";
import { start } from "$fresh/server.ts";
import twindPlugin from "$fresh/plugins/twind.ts";

import manifest from "../../fresh.gen.ts";
import twindConfig from "../../twind.config.ts";

await start(manifest, { plugins: [twindPlugin(twindConfig)] });