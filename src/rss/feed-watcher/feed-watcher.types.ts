export enum FeedParserEvents {
  ERROR = "error",
  READABLE = "readable",
  END = "end",
}

export type FeedWatcherOptions = {
  interval?: number;
  attempts?: number;
  retryTime?: number;
};

export type RssNameSpaceItem = {
  "@"?: {};
  "#"?: string;
};

export type Meta = {
  "#ns": {}[];
  "@": {}[];
  "#xml": {
    version?: string;
    encoding?: string;
  };
  "#type": "atom" | "rss" | "rdf";
  "#version": string | null;
  title: string | null;
  description: string | null;
  date: Date | null;
  pubdate: Date | null;
  pubDate: Date | null;
  link: string | null;
  xmlurl: string | null;
  xmlUrl: string | null;
  author: string | null;
  language: string | null;
  image: {
    url?: string;
    title?: string;
  };
  favicon: string | null;
  copyright: string | null;
  generator: string | null;
  cloud?: {
    type?: string;
    href?: string;
  };
  categories: string[];
  "rss:@"?: {};
  "atom:link"?: {}[];
  "rss:guid"?: {
    "@"?: {
      ispermalink?: boolean;
    };
    "#"?: string;
  };
  "rss:title"?: RssNameSpaceItem;
  "rss:description"?: RssNameSpaceItem;
  "rss:pubdate"?: RssNameSpaceItem;
  "rss:author"?: {
    "@"?: {};
    "#"?: string;
    name?: string;
    email?: string;
  };
  "rss:link"?: RssNameSpaceItem;
  "content:encoded"?: RssNameSpaceItem;
  "rss:enclosure"?: {
    "@"?: {
      length?: string;
      type?: string;
      url?: string;
    };
  };
  "rss:generator"?: RssNameSpaceItem;
  "rss:lastbuilddate"?: RssNameSpaceItem;
  "rss:copyright"?: RssNameSpaceItem;
  "rss:ttl"?: RssNameSpaceItem;
};

export type FeedParserEntry = {
  title: string | null;
  description: string | null;
  summary: string | null;
  date: Date | null;
  pubdate: Date | null;
  pubDate: Date | null;
  link: string | null;
  origlink: string | null;
  permalink: string | null;
  author: string | null;
  guid: string | null;
  comments: string | null;
  image: {
    url?: string;
    title?: string;
  };
  categories: string[];
  source: {
    url?: string;
    title?: string;
  };
  enclosures: { url: string; type: string; length: string }[];
  meta: Meta;
};

type FeedWatcherError = {
  error: any;
  url: string;
  attempts?: number;
};

export interface FeedWatcherEvent {
  ready: (entries: FeedParserEntry[]) => void;
  new: (entries: FeedParserEntry[]) => void;
  init_error: (error: FeedWatcherError) => void;
  read_error: (error: FeedWatcherError) => void;
}
