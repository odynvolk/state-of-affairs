import { Collection, config, MongoClient } from "../deps.ts";
import { SentimentSchema } from "./interfaces.ts";

const dotEnv = config();

let client: MongoClient;
let collection: Collection<SentimentSchema>;

const nameOfCollection = Deno.env.get("IS_TEST") ? "sentiments_test" : "sentiments";

const clearDb = async () => {
  await collection.deleteMany({});
};

const find = async (
  subject: string,
  dates: Date[],
): Promise<any[]> => {
  return await Promise.all(dates.map((date) => {
    const beginningOfDay = new Date(date.getTime());
    beginningOfDay.setUTCHours(0, 0, 0, 0);

    const endOfDay = new Date(date.getTime());
    endOfDay.setUTCHours(23, 59, 59, 999);

    const filter: any = {
      ts: {
        "$gte": beginningOfDay,
        "$lt": endOfDay,
      },
      "metadata.subject": subject,
    };

    return collection.find(filter).map((sentiment) => sentiment);
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

  if (!Deno.env.get("IS_TEST")) {
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
