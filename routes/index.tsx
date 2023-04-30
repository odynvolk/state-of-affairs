import { Head } from "$fresh/runtime.ts";
import { Handlers } from "$fresh/src/server/types.ts";
import Panel from "../islands/Panel.tsx";

import { subjects } from "../lib/twitter.ts";

export const handler: Handlers = {
  GET: async function (_, ctx) {
    return ctx.render({ subjects });
  },
};

export default function Home({ data: { subjects } }: any) {
  return (
    <>
      <Head>
        <title>State of affairs</title>
      </Head>
      <div class="p-4 mx-auto max-w-screen-md">
        <h1 class="${tw`font-bold text(center 5xl sm:gray-800)`}">
          State of affairs
        </h1>
      </div>
      <Panel subjects={subjects}></Panel>
    </>
  );
}
