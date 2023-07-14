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

export enum ContentFeed {
  WEMARTIANS = "wemartians",
  RPR = "rpr",
  MECO = "meco",
  HEADLINES = "headlines",
  OFFNOMINAL_PODCAST = "ofn_podcast",
  OFFNOMINAL_YT = "ofn_youtube",
  OFFNOMINAL_HAPPY_HOUR = "ofn_hh",
}
