import { Head } from "$fresh/runtime.ts";
import { Handlers } from "$fresh/src/server/types.ts";
import Panel from "../islands/Panel.tsx";

import { CHARTS_COLOUR, SUBJECTS } from "../lib/config.ts";

export const handler: Handlers = {
  GET: async function (_, ctx) {
    return ctx.render({ charts_colour: CHARTS_COLOUR, subjects: SUBJECTS });
  },
};

export default function Home({ data: { charts_colour, subjects } }: any) {
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
      <Panel charts_colour={charts_colour} subjects={subjects}></Panel>
    </>
  );
}
