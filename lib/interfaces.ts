export enum SentimentTypes {
  TWITTER = "twitter",
}

export interface SentimentMetadataSchema {
  subject: string;
  type: SentimentTypes;
}

export interface SentimentSchema {
  text: string;
  keyword: string;
  id: string;
  author_id: string;
  sentiment: number;
  metadata: SentimentMetadataSchema;
}
