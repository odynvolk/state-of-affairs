import {
  Collection,
  MongoClient,
} from "https://deno.land/x/mongo@v0.31.1/mod.ts";
import { TweetSchema } from "./twitter.ts";

let client: MongoClient;
let collection: Collection<TweetSchema>;

const nameOfCollection = Deno.env.get("IS_TEST") ? "tweets_test" : "tweets";

const clearDb = async () => {
  if (!collection) await init();

  await collection.deleteMany({});
};

const find = async (
  subject: string,
  dates: Date[],
): Promise<any[]> => {
  if (!collection) await init();

  const daysWithTweets = await Promise.all(dates.map((date) => {
    const beginningOfDay = new Date(date.getTime());
    beginningOfDay.setUTCHours(0, 0, 0, 0);

    const endOfDay = new Date(date.getTime());
    endOfDay.setUTCHours(23, 59, 59, 999);

    const filter: any = {
      subject,
      date: {
        "$gte": beginningOfDay,
        "$lt": endOfDay,
      },
    };

    return collection.find(filter).map((tweet) => tweet);
  }));

  return daysWithTweets;
};

const insert = async (tweet: TweetSchema): Promise<void> => {
  if (!collection) await init();
  const result = await collection.insertOne(tweet);
  console.log("Inserted documents =>", result);
};

const init = async (): Promise<void> => {
  client = new MongoClient();
  await client.connect("mongodb://localhost:27017");
  console.log("Connected to database");
  const db = client.database("stateOfAffairsDB");
  collection = db.collection(nameOfCollection);
};

const teardown = async () => {
  await client.close();
  console.log("Connection to database closed");
};

export default {
  clearDb,
  find,
  insert,
  teardown,
};
