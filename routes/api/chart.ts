import { HandlerContext } from "$fresh/server.ts";
import { TweetSchema } from "../../lib/twitter.ts";
import db from "../../lib/db.ts";
import { renderChart } from "$fresh_charts/mod.ts";
import { ChartColors, transparentize } from "$fresh_charts/utils.ts";

const ONE_DAY_IN_MILLISECONDS = 86400000;

await db.init();

export const handler = async (req: Request, ctx: HandlerContext) => {
  const url = new URL(req.url);
  const subject = url.searchParams.get("subject");
  const timeline = parseInt(url.searchParams.get("timeline") ?? "7");
  if (!subject || !timeline) {
    return ctx.render("");
  }

  const startDate = new Date();
  startDate.setDate(startDate.getDate() + 1);

  const dates: Date[] = [];
  for (let i = timeline; i > 0; i--) {
    const date = new Date(
      startDate.getTime() - (i * ONE_DAY_IN_MILLISECONDS),
    );
    dates.push(date);
  }

  const results = await db.find(subject, dates) ?? [];

  const tweetScores = results.reduce((acc, dayWithTweets) => {
    const score = dayWithTweets?.length
      ? dayWithTweets.reduce(
        (intraDayAcc: number, tweet: TweetSchema) => {
          acc.numberOfTweets += 1;
          intraDayAcc += tweet.score;
          return intraDayAcc;
        },
        0,
      ) / dayWithTweets.length
      : 0;

    acc.scores.push(score);

    return acc;
  }, { numberOfTweets: 0, scores: [] });

  const datasets = [
    {
      label: `Subject: ${subject} Tweets: ${tweetScores.numberOfTweets}`,
      data: tweetScores.scores,
      borderColor: ChartColors.Red,
      backgroundColor: transparentize(ChartColors.Red, 0.5),
      borderWidth: 2,
    },
  ];

  return renderChart({
    type: "line",
    data: {
      labels: dates.map((date) =>
        `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
      ),
      datasets,
    },
    options: {
      devicePixelRatio: 1,
    },
  });
};
