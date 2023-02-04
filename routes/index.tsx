import { Head } from "$fresh/runtime.ts";

import db from "../lib/db.ts";
import { subjects, TweetSchema } from "../lib/twitter.ts";

import { Chart } from "$fresh_charts/mod.ts";
import { ChartColors, transparentize } from "$fresh_charts/utils.ts";
import { Handlers } from "$fresh/src/server/types.ts";

const ONE_DAY_IN_MILLISECONDS = 86400000;

export const handler: Handlers = {
  GET: async function (_, ctx) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + 1);

    const dates: Date[] = [];
    for (let i = 14; i > 0; i--) {
      const date = new Date(
        startDate.getTime() - (i * ONE_DAY_IN_MILLISECONDS),
      );
      dates.push(date);
    }

    const response = await Promise.all(
      subjects.map((subject) => db.find(subject.subject, dates) ?? []),
    );

    const subjectScores = response.flat().reduce((acc, dayWithTweets) => {
      if (!dayWithTweets?.length) return acc;

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

      if (!acc[dayWithTweets[0].subject]) {
        acc[dayWithTweets[0].subject] = [];
      }

      acc[dayWithTweets[0].subject].push(day);

      return acc;
    }, {});

    return ctx.render({ subjectScores: Object.entries(subjectScores) });
  },
};

export default function Home({
  data: {
    subjectScores,
  },
}: any) {
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
      <div class="charts">
        {subjectScores.map(([subject, scores]: [string, any]) => {
          return (
            <div className={`p-4 mx-auto max-w-screen-md chart-${subject}`}>
              <Chart
                type="line"
                options={{
                  devicePixelRatio: 1,
                }}
                data={{
                  labels: scores.map(({ date }: any) =>
                    `${date.getDate()}/${date.getMonth() + 1}`
                  ),
                  datasets: [{
                    label: `Subject: ${subject} Tweets: ${
                      scores?.reduce((acc: number, score: any) => {
                        acc += score.numberOfTweets;
                        return acc;
                      }, 0)
                    }`,
                    data: scores?.map((score: any) =>
                      score.score
                    ),
                    borderColor: ChartColors.Red,
                    backgroundColor: transparentize(ChartColors.Red, 0.5),
                    borderWidth: 2,
                  }],
                }}
              />
            </div>
          );
        })}
      </div>
    </>
  );
}
