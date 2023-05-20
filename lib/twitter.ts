import { cron, ETwitterStreamEvent, TwitterApi } from "../deps.ts";
import { dotEnv, SUBJECTS } from "./config.ts";

import analyser from "./analyser.ts";
import { clean } from "./text.ts";
import db from "./db.ts";
import { SentimentSchema, SentimentTypes } from "./interfaces.ts";

const rulesNew = SUBJECTS.reduce((acc, subject) => {
  subject.keywords.forEach((keyword) => {
    acc.push({
      value: `${keyword} ${dotEnv.TWITTER_FILTER}`,
      tag: `${subject.subject}:${keyword}`,
    });
  });

  return acc;
}, []);

const addNewRules = async (client: TwitterApi) => {
  await client.v2.updateStreamRules({ add: rulesNew });
};

const deleteCurrentRules = async (client: TwitterApi) => {
  const rules = await client.v2.streamRules();
  if (rules.data?.length) {
    await client.v2.updateStreamRules({
      delete: { ids: rules.data.map((rule) => rule.id) },
    });
  }
};

export default async () => {
  const token = dotEnv.TWITTER_BEARER_TOKEN;
  if (!token) throw Error("Missing environment variable: TWITTER_BEARER_TOKEN");

  let numberOfDataPoints = 0;

  const client = new TwitterApi(
    token,
  );

  const TWITTER_PULL_LIMIT = Number(dotEnv.TWITTER_PULL_LIMIT ?? "1");

  const stream = await client.v2.searchStream({
    "tweet.fields": ["author_id", "context_annotations"],
  });

  stream.autoReconnect = true;

  stream.on(
    ETwitterStreamEvent.Data,
    async (tweet: any) => {
      console.log("Got tweet", JSON.stringify(tweet, null, 2));

      const {
        id,
        author_id,
        text,
      } = tweet?.data ?? {};

      const [subject, keyword] = tweet?.matching_rules[0].tag?.split(":");
      const cleanedText = clean(text);

      analyser.analyse(cleanedText, async (sentiment: number) => {
        const analysedSentiment: SentimentSchema = {
          text: cleanedText,
          keyword,
          id,
          author_id,
          sentiment,
          metadata: {
            subject,
            type: SentimentTypes.TWITTER,
          },
        };

        await db.insert(analysedSentiment);
      });

      numberOfDataPoints++;

      if (numberOfDataPoints === TWITTER_PULL_LIMIT) {
        console.log("Tweet limit reached for period.");
        await deleteCurrentRules(client);
      }
    },
  );

  cron(dotEnv.TWITTER_PULL_CRON_SCHEDULE, async () => {
    numberOfDataPoints = 0;
    await deleteCurrentRules(client);
    await addNewRules(client);
  });

  Deno.addSignalListener("SIGINT", () => {
    console.log("Closing stream to Twitter.");
    stream.destroy();
  });
};
