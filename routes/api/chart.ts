import { HandlerContext } from "$fresh/server.ts";
import { SentimentSchema } from "../../lib/twitter.ts";
import db from "../../lib/db.ts";
import { renderChart } from "$fresh_charts/mod.ts";
import { ChartColors, transparentize } from "$fresh_charts/utils.ts";
import { getDateTimeline } from "../../lib/dates.ts";

const capitalizeFirstLetter = (str: string) => `${str[0].toUpperCase()}${str.slice(1)}`;

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

  const dates = getDateTimeline(timeline);

  const allDays = await db.find(subject, dates) ?? [];
  const timeSeries = allDays.reduce((acc, day) => {
    const sentiment = day?.length
      ? day.reduce(
        (intraDayAcc: number, sentiment: SentimentSchema) => {
          acc.numberOfDataPoints += 1;
          intraDayAcc += sentiment.sentiment;
          return intraDayAcc;
        },
        0,
      ) / day.length
      : 0;

    acc.sentiments.push(sentiment);

    return acc;
  }, { numberOfDataPoints: 0, sentiments: [] });

  const color = ChartColors[url.searchParams.get("colour") ?? "Grey"];
  if (colors_index < COLORS.length) colors_index++;
  else colors_index = 0;

  const datasets = [
    {
      label: capitalizeFirstLetter(subject),
      data: timeSeries.sentiments,
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
      labels: dates.map((date) => `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`),
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
          text: `Subject: ${capitalizeFirstLetter(subject)} Data points: ${timeSeries.numberOfDataPoints}`,
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
