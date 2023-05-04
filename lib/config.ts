import { config } from "../deps.ts";

export const IS_TEST = !!Deno.env.get("IS_TEST");
export const dotEnv = IS_TEST ? config({ path: "./.env.test" }) : config();

interface SubjectSchema {
  subject: string;
  keywords: string[];
}

const readSubjectsFromConfig = () => {
  return Object.entries(dotEnv).reduce((acc: SubjectSchema[], entry) => {
    if (entry.length < 2) return acc;

    if (entry[0].startsWith("SUBJECT_")) {
      const [key, values] = entry[1].split(":");
      acc.push({
        subject: key,
        keywords: values.split(","),
      });
    }

    return acc;
  }, []);
};

export const SUBJECTS: SubjectSchema[] = readSubjectsFromConfig();

interface ChartsColourSchema {
  [index: number]: string;
}

const readChartsColourSchema = (): ChartsColourSchema | undefined => {
  if (dotEnv.CHARTS_COLOUR) return dotEnv.CHARTS_COLOUR?.split(",");

  return Array(SUBJECTS.length).fill("Grey");
};

export const CHARTS_COLOUR: ChartsColourSchema | undefined = readChartsColourSchema();
