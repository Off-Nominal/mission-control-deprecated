import { ContentFeed, ContentFeedItem } from "src/rss/rss.types";
import Fuse from "fuse.js";
import { simpleCastFeedMapper, youtubeFeedMapper } from "src/rss/rss.utility";

export type ContentFeedConfig = {
  url: string;
  name: string;
  mapper: (item: any, showTitle: string) => ContentFeedItem;
  searchOptions: Fuse.IFuseOptions<ContentFeedItem>;
};

const defaultSearchOptions: Fuse.IFuseOptions<ContentFeedItem> = {
  distance: 350,
  threshold: 0.7,
  includeScore: true,
  keys: [
    { name: "title", weight: 2 },
    { name: "description", weight: 3 },
  ],
};

const youtubeSearchOptions: Fuse.IFuseOptions<ContentFeedItem> = {
  distance: 350,
  threshold: 0.7,
  includeScore: true,
  keys: [
    { name: "title", weight: 2 },
    { name: "summary", weight: 3 },
  ],
};

export const rssFeeds: Record<ContentFeed, ContentFeedConfig> = {
  [ContentFeed.WEMARTIANS]: {
    url: process.env.WMFEED,
    name: "WeMartians Podcast Feed Watcher",
    mapper: simpleCastFeedMapper,
    searchOptions: defaultSearchOptions,
  },
  [ContentFeed.RPR]: {
    url: process.env.RPRFEED,
    name: "Red Planet Review Feed Watcher",
    mapper: simpleCastFeedMapper,
    searchOptions: defaultSearchOptions,
  },
  [ContentFeed.MECO]: {
    url: process.env.MECOFEED,
    name: "MECO Podacst Feed Watcher",
    mapper: simpleCastFeedMapper,
    searchOptions: defaultSearchOptions,
  },
  [ContentFeed.HEADLINES]: {
    url: process.env.HLFEED,
    name: "MECO Headlines Feed Watcher",
    mapper: simpleCastFeedMapper,
    searchOptions: defaultSearchOptions,
  },
  [ContentFeed.OFFNOMINAL_PODCAST]: {
    url: process.env.OFNFEED,
    name: "Off-Nominal Podcast Feed Watcher",
    mapper: simpleCastFeedMapper,
    searchOptions: defaultSearchOptions,
  },
  [ContentFeed.OFFNOMINAL_HAPPY_HOUR]: {
    url: process.env.HHFEED,
    name: "Off-Nominal Happy Hour Youtube Feed Watcher",
    mapper: youtubeFeedMapper,
    searchOptions: youtubeSearchOptions,
  },
  [ContentFeed.OFFNOMINAL_YT]: {
    url: process.env.OFN_YT_FEED,
    name: "Off-Nominal Youtube Feed Watcher",
    mapper: youtubeFeedMapper,
    searchOptions: youtubeSearchOptions,
  },
};
