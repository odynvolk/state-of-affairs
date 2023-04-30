import { config } from "https://deno.land/x/dotenv/mod.ts";

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

export const SUBJECTS: SubjectSchema[] = Deno.env.get("IS_TEST")
  ? [{
    subject: "tesla",
    keywords: ["tesla"],
  }, { subject: "microsoft", keywords: ["microsoft"] }]
  : readSubjectsFromConfig();

interface ChartsColourSchema {
  [index: number]: string;
}

const readChartsColourSchema = (): ChartsColourSchema | undefined => {
  if (Deno.env.get("CHARTS_COLOUR")) {
    return Deno.env.get("CHARTS_COLOUR")?.split(",");
  }

  return Array(SUBJECTS.length).fill("Grey");
};

export const CHARTS_COLOUR: ChartsColourSchema | undefined =
  readChartsColourSchema();
