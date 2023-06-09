import { Collection, MongoClient } from "../deps.ts";
import { dotEnv, IS_TEST } from "./config.ts";
import { getBeginningOfDay, getEndOfDay } from "./dates.ts";
import { SentimentSchema } from "./interfaces.ts";

let client: MongoClient;
let collection: Collection<SentimentSchema>;

const nameOfCollection = IS_TEST ? "sentiments_test" : "sentiments";

const clearDb = async () => {
  await collection.deleteMany({});
};

const find = async (
  subject: string,
  dates: Date[],
): Promise<any[]> => {
  return await Promise.all(dates.map((date) => {
    const filter: any = {
      ts: {
        "$gte": getBeginningOfDay(date),
        "$lt": getEndOfDay(date),
      },
      "metadata.subject": subject,
    };

    return collection.find(filter).toArray();
  }));
};

const insert = async (sentiment: SentimentSchema): Promise<void> => {
  const result = await collection.insertOne(
    Object.assign({}, sentiment, { ts: new Date() }),
  );
  console.log("Inserted document =>", result);
};

const init = async (): Promise<void> => {
  client = new MongoClient();
  await client.connect(
    dotEnv.MONGODB_URI ?? "mongodb://127.0.0.1:27017",
  );
  console.log("Connected to database.");
  const db = client.database("stateOfAffairsDB");
  collection = db.collection(nameOfCollection);

  if (!IS_TEST) {
    Deno.addSignalListener("SIGINT", () => teardown());
  }
};

const teardown = async () => {
  console.log("Closing connection to database.");
  await client.close();
};

export default {
  clearDb,
  find,
  init,
  insert,
  teardown,
};
