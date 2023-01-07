import {ETwitterStreamEvent, TwitterApi} from "npm:twitter-api-v2@^1.13.0";

import analyze from "./analyse.ts";
import db from "./db.ts";

await db.init();

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
  category: string;
  keywords: string[];
}

const subjects: SubjectSchema[] = [
  {
    category: "javascript",
    keywords: ["javascript", "nodejs"],
  },
];

export default async () => {
  const token = Deno.env.get("TWITTER_BEARER_TOKEN");
  if (!token) throw Error("Missing environment variable: TWITTER_BEARER_TOKEN");

  const client = new TwitterApi(
    token,
  );

  const rulesCurrent = await client.v2.streamRules();
  if (rulesCurrent.data?.length) {
    await client.v2.updateStreamRules({
      delete: {ids: rulesCurrent.data.map((rule) => rule.id)},
    });
  }

  const rulesNew = subjects.reduce((acc, subject) => {
    // add: [{ value: "JavaScript lang:en followers_count:500 tweets_count:100 listed_count:5" }, { value: "NodeJS lang:en followers_count:500 tweets_count:100 listed_count:5" }],
    subject.keywords.forEach((keyword) => {
      acc.push({value: `${keyword} lang:en -is:retweet`, tag: `${subject.category}:${keyword}`});
    });

    return acc;
  }, []);
  await client.v2.updateStreamRules({ add: rulesNew });

  const stream = await client.v2.searchStream({
    "tweet.fields": ["author_id"],
  });

  stream.autoReconnect = true;

  stream.on(
    ETwitterStreamEvent.Data,
    async (tweet: undefined) => {
      console.log("@@@ twitter.ts  26", JSON.stringify(tweet, null, 2));

      const {
        id,
        author_id,
        text,
      } = tweet?.data ?? {};

      const [subject, keyword] = tweet?.matching_rules[0].tag?.split(":");

      const score = analyze(text);
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
    },
  );
};
