export type ContentFeedItem = {
  author: string;
  title: string;
  date: Date;
  url: string;
  thumbnail: string;
  description?: string;
  summary: string;
  id?: string;
  source: string;
  albumArt?: string;
};
