import { HandlerContext } from "$fresh/server.ts";
import { TweetSchema } from "../../lib/twitter.ts";
import db from "../../lib/db.ts";
import { renderChart } from "$fresh_charts/mod.ts";
import { ChartColors, transparentize } from "$fresh_charts/utils.ts";

const ONE_DAY_IN_MILLISECONDS = 86400000;

await db.init();

const capitalizeFirstLetter = (str) => `${str[0].toUpperCase()}${str.slice(1)}`;

let colors_index = 0;
const COLORS = [
  ChartColors.Red,
  ChartColors.Orange,
  ChartColors.Green,
  ChartColors.Blue,
  ChartColors.Purple,
  ChartColors.Grey,
];

const CHART_AREA_BORDER = {
  id: "chartAreaBorder",
  beforeDraw(chart, args, options) {
    const { ctx, chartArea: { left, top, width, height } } = chart;
    ctx.save();
    ctx.strokeStyle = options.borderColor;
    ctx.lineWidth = options.borderWidth;
    ctx.setLineDash(options.borderDash || []);
    ctx.lineDashOffset = options.borderDashOffset;
    ctx.strokeRect(left, top, width, height);
    ctx.restore();
  },
};

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
    const sentiment = dayWithTweets?.length
      ? dayWithTweets.reduce(
        (intraDayAcc: number, tweet: TweetSchema) => {
          acc.numberOfTweets += 1;
          intraDayAcc += tweet.sentiment ?? tweet.score;
          return intraDayAcc;
        },
        0,
      ) / dayWithTweets.length
      : 0;

    acc.sentiments.push(sentiment);

    return acc;
  }, { numberOfTweets: 0, sentiments: [] });

  const color = ChartColors[url.searchParams.get("colour") ?? "Grey"];
  if (colors_index < COLORS.length) colors_index++;
  else colors_index = 0;

  const datasets = [
    {
      label: capitalizeFirstLetter(subject),
      data: tweetScores.sentiments,
      borderColor: color,
      // backgroundColor: transparentize(ChartColors.Purple, 0.5),
      backgroundColor: transparentize(color),
      borderWidth: 2,
      fill: true,
      cubicInterpolationMode: "monotone",
      tension: 0.4,
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
      plugins: {
        chartAreaBorder: {
          borderColor: color,
          borderWidth: 2,
          borderDash: [5, 5],
          borderDashOffset: 2,
        },
        legend: {
          position: "top",
        },
        title: {
          display: true,
          text: `Subject: ${
            capitalizeFirstLetter(subject)
          } Tweets: ${tweetScores.numberOfTweets}`,
        },
      },
      scales: {
        x: {
          display: true,
          title: {
            display: true,
            text: "Dates",
          },
        },
        y: {
          display: true,
          title: {
            display: true,
            text: "Sentiment",
          },
          suggestedMin: -1,
          suggestedMax: 1,
        },
      },
    },
    plugins: [CHART_AREA_BORDER],
  });
};
