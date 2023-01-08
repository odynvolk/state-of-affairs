import { Head } from "$fresh/runtime.ts";

import db from "../lib/db.ts";
import Counter from "../islands/Counter.tsx";
import { subjects, TweetSchema } from "../lib/twitter.ts";

export const handler: Handlers = {
  async GET(_, ctx) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);
    const endDate = new Date();

    const scores = await subjects.reduce(async (scoresAcc: any, subject) => {
      const tweets = await db.find(subject.subject, startDate, endDate) ?? [];
      const score = tweets.reduce((acc: number, tweet: TweetSchema) => {
        acc += tweet.score;
        return acc;
      }, 0) / tweets.length;

      if (tweets) {
        scoresAcc.push({
          subject: subject.subject,
          score,
          numberOfTweets: tweets.length,
        });
      }

      return scoresAcc;
    }, []);

    return ctx.render({ scores });
  },
};

export default function Home({ data }) {
  return (
    <>
      <Head>
        <title>State of affairs</title>
      </Head>
      <div class="p-4 mx-auto max-w-screen-md">
        <img
          src="/logo.svg"
          class="w-32 h-32"
          alt="the fresh logo: a sliced lemon dripping with juice"
        />
        <Counter start={3} />
        {data.scores.map(({ subject, score, numberOfTweets }) => (
          <div>
            <p className="flex-grow-1 text-l subject">
              Subject: {subject}
            </p>
            <p className="flex-grow-1 text-l">
              Score: {score}
            </p>
            <p className="flex-grow-1 text-l">
              Number of tweets: {numberOfTweets}
            </p>
          </div>
        ))}
      </div>
    </>
  );
}
