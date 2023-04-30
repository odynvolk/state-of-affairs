import { config } from "https://deno.land/x/dotenv/mod.ts";
import { cron } from "https://deno.land/x/deno_cron/cron.ts";
import { ETwitterStreamEvent, TwitterApi } from "npm:twitter-api-v2@^1.13.0";

import analyser from "./analyser.ts";
import db from "./db.ts";

await db.init();
await analyser.init();

export interface TweetSchema {
  score: number;
  text: string;
  subject: string;
  keyword: string;
  id: string;
  author_id: string;
  date: Date;
}

interface SubjectSchema {
  subject: string;
  keywords: string[];
}

const readSubjectsFromConfig = () => {
  return Object.entries(config()).reduce((acc: SubjectSchema[], entry) => {
    if (entry.length < 2) return acc;

    if (entry[0].startsWith("TWITTER_SUBJECT_")) {
      const [key, values] = entry[1].split(":");
      acc.push({
        subject: key,
        keywords: values.split(";"),
      });
    }

    return acc;
  }, []);
};

export const subjects: SubjectSchema[] = Deno.env.get("IS_TEST")
  ? [{
    subject: "tesla",
    keywords: ["tesla"],
  }, { subject: "microsoft", keywords: ["microsoft"] }]
  : readSubjectsFromConfig();

const rulesNew = subjects.reduce((acc: any[], subject) => {
  subject.keywords.forEach((keyword) => {
    acc.push({
      value: `${keyword} lang:en ${Deno.env.get("TWITTER_FILTER")}`,
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
  const token = Deno.env.get("TWITTER_BEARER_TOKEN");
  if (!token) throw Error("Missing environment variable: TWITTER_BEARER_TOKEN");

  let numberOfTweets = 0;

  const client = new TwitterApi(
    token,
  );

  const TWITTER_PULL_LIMIT = Number(Deno.env.get("TWITTER_PULL_LIMIT") ?? "1");

  const stream = await client.v2.searchStream({
    "tweet.fields": ["author_id"],
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

      analyser.analyse(text, async (score: number) => {
        const tweetScored: TweetSchema = {
          score,
          text,
          subject,
          keyword,
          id,
          author_id,
          date: new Date(),
        };

        await db.insert(tweetScored);
      });

      numberOfTweets += 1;

      if (numberOfTweets === TWITTER_PULL_LIMIT) {
        console.log("Tweet limit reached for period.");
        await deleteCurrentRules(client);
      }
    },
  );

  cron(Deno.env.get("TWITTER_PULL_CRON_SCHEDULE"), async () => {
    numberOfTweets = 0;
    await deleteCurrentRules(client);
    await addNewRules(client);
  });

  Deno.addSignalListener("SIGINT", () => {
    console.log("Closing stream to Twitter");
    stream.destroy();
  });
};
