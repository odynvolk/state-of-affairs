import {
  Collection,
  MongoClient,
} from "https://deno.land/x/mongo@v0.31.1/mod.ts";
import { TweetSchema } from "./twitter.ts";

let collection: Collection<TweetSchema>;

export const insert = async (tweet: TweetSchema): Promise<void> => {
  const insertResult = await collection.insertOne(tweet);
  console.log("Inserted documents =>", insertResult);
};

export const init = async (): Promise<void> => {
  const client = new MongoClient();
  await client.connect("mongodb://localhost:27017");
  console.log("Connected successfully to server");
  const db = client.database("stateOfAffairsDB");
  collection = db.collection("tweet");
};

export default {
  insert,
  init,
};
