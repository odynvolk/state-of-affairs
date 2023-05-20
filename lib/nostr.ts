import { relayInit } from "../deps.ts";
import { SUBJECTS } from "./config.ts";

import analyser from "./analyser.ts";
import { clean } from "./text.ts";
import db from "./db.ts";
import { SentimentSchema, SentimentTypes } from "./interfaces.ts";

const mapTags = (tags) => {
  for (const t of tags) {
    const [_, tagName] = t;
    for (const s of SUBJECTS) {
      for (const keyword of s.keywords) {
        if (keyword === tagName) {
          return [s.subject, keyword];
        }
      }
    }
  }

  return ["N/A", "N/A"];
};

export default async () => {
  const relay = relayInit("wss://relay.damus.io");

  relay.on("connect", () => {
    console.log(`Connected to ${relay.url}`);
  });

  relay.on("error", () => {
    console.log(`Failed to connect to ${relay.url}`);
  });

  await relay.connect();

  const t = SUBJECTS.reduce((acc, subject) => {
    subject.keywords.forEach((keyword) => {
      acc.push(keyword);
    });

    return acc;
  }, []);

  const sub = relay.sub([
    {
      limit: 1,
      kinds: [0, 1],
      "#t": t,
    },
  ]);
  sub.on("event", (event) => {
    console.log("Got event", event);

    const {
      id,
      pubkey: author_id,
      content: text,
      tags,
    } = event ?? {};

    const [subject, keyword] = mapTags(tags);
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
          type: SentimentTypes.NOSTR,
        },
      };

      await db.insert(analysedSentiment);
    });
  });

  Deno.addSignalListener("SIGINT", () => {
    console.log("Closing stream to Nostr.");
    sub.unsub();
    relay.close();
  });
};
