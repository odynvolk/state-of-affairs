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
  startDate: Date | undefined,
  endDate: Date | undefined,
): Promise<TweetSchema[]> => {
  if (!collection) await init();

  const filter: any = { subject };
  if (startDate || endDate) {
    filter.date = {};
    if (startDate) {
      filter.date["$gte"] = startDate;
    }
    if (endDate) {
      filter.date["$lt"] = endDate;
    }
  }

  const result = await collection.find(filter).map((tweet) => {
    return tweet;
  });
  console.log("Found documents =>", result);
  return result;
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
  await clearDb();
  await client.close();
  console.log("Connection to database closed");
};

export default {
  clearDb,
  find,
  insert,
  teardown,
};
