import { Head } from "$fresh/runtime.ts";

import db from "../lib/db.ts";
import Counter from "../islands/Counter.tsx";
import { subjects, TweetSchema } from "../lib/twitter.ts";

import { Chart } from "$fresh_charts/mod.ts";
import { ChartColors, transparentize } from "$fresh_charts/utils.ts";
import { Handlers } from "$fresh/src/server/types.ts";

export const handler: Handlers = {
  GET: async function (_, ctx) {
    const startDate = new Date();
    const dates: Date[] = [];
    for (let i = 14; i > 0; i--) {
      const date = new Date();
      date.setDate(startDate.getDate() - i);
      dates.push(date);
    }

    const scores = await Promise.all(subjects.map(async (subject) => {
      const daysWithTweets = await db.find(subject.subject, dates) ?? [];

      const daysWithTweetsAggregated = daysWithTweets.reduce(
        (acc, dayWithTweets) => {
          if (!dayWithTweets.length) return acc;

          const day = {
            date: dayWithTweets[0].date,
            subject: dayWithTweets[0].subject,
            score: dayWithTweets.reduce(
              (intraDayAcc: number, tweet: TweetSchema) => {
                intraDayAcc += tweet.score;
                return intraDayAcc;
              },
              0,
            ) / dayWithTweets.length,
            numberOfTweets: dayWithTweets.length,
          };

          acc.push(day);

          return acc;
        },
        [],
      );

      return daysWithTweetsAggregated;
    }));

    return ctx.render({ scores: scores.flat() });
  },
};

export default function Home({ data }) {
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
      <div class="chart">
        <Chart
          type="line"
          options={{
            devicePixelRatio: 1,
          }}
          data={{
            labels: data.scores.map(({ date }: any) =>
              `${date.getDate()}/${date.getMonth() + 1}`
            ),
            datasets: [{
              label: `Subject: ${data.scores[0]?.subject} Tweets: ${
                data.scores?.reduce((acc: number, score: any) => {
                  acc += score.numberOfTweets;
                  return acc;
                }, 0)
              }`,
              data: data.scores?.map((score: any) => score.score),
              borderColor: ChartColors.Red,
              backgroundColor: transparentize(ChartColors.Red, 0.5),
              borderWidth: 2,
            }],
          }}
        />
      </div>
    </>
  );
}
