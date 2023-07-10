import { EventEmitter } from "events";
import axios from "axios";
import {
  FeedParserEntry,
  FeedParserEvents,
  FeedWatcherEvents,
  RobustWatcherOptions,
} from "./feed-watcher.types";
const FeedParser = require("feedparser");

const DEFAULT_FEED_CHECK_TIME_IN_SECONDS = 60;
const DEFAULT_RETRY_ATTEMPTS = 3;
const DEFAULT_RETRY_WAIT_TIME_IN_SECONDS = 5;

export class FeedWatcher extends EventEmitter {
  private feedurl: string;
  private interval: number;
  private timer: null | NodeJS.Timer;
  private loadAttempts: number = 0;
  private options: RobustWatcherOptions;
  private lastEntry: {
    date?: Date;
    permalink?: string;
  };

  constructor(feedurl: string, options: RobustWatcherOptions = {}) {
    super();

    if (!feedurl || typeof feedurl !== "string") {
      throw new Error("Feed url must be defined.");
    }

    this.feedurl = feedurl;
    this.interval = options.interval || DEFAULT_FEED_CHECK_TIME_IN_SECONDS;
    this.options = options;
    this.timer = null;
    this.lastEntry = {};
  }

  private fetchEntries(): Promise<FeedParserEntry[]> {
    return new Promise((resolve, reject) => {
      const entries: FeedParserEntry[] = [];

      const feedParser = new FeedParser()
        .on(FeedParserEvents.ERROR, (err) => console.error(err))
        .on(FeedParserEvents.READABLE, () => {
          let item: FeedParserEntry;
          while ((item = feedParser.read())) {
            entries.push(item);
          }
        })
        .on(FeedParserEvents.END, () => {
          if (!entries.length) {
            reject(new Error("No entries in the feed"));
          }
          resolve(
            entries.sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime())
          );
        });

      axios
        .get(this.feedurl, {
          responseType: "stream",
          headers: {
            Accept:
              "application/rss+xml, application/rdf+xml;q=0.8, application/atom+xml;q=0.6, application/xml;q=0.4, text/xml;q=0.4",
          },
        })
        .then(({ data }) => data.pipe(feedParser))
        .catch((err) => reject(err));
    });
  }

  public start(): Promise<FeedParserEntry[]> {
    const attempts = this.options.attempts || DEFAULT_RETRY_ATTEMPTS;
    const retryTime =
      (this.options.retryTime || DEFAULT_RETRY_WAIT_TIME_IN_SECONDS) * 1000;

    return new Promise((resolve, reject) => {
      const fetcher = (resolver) => {
        this.loadAttempts++;
        this.fetchEntries()
          .then((entries) => {
            this.lastEntry.date = entries[0].pubDate;
            this.lastEntry.permalink = entries[0].link;
            this.timer = this.watch();
            resolver(entries);
          })
          .catch((err) => {
            if (attempts <= this.loadAttempts) {
              console.error(`Tried loading ${this.feedurl} ${attempts} times`);
              return reject(err);
            }

            setTimeout(() => {
              fetcher(resolver);
            }, retryTime);
          });
      };
      fetcher(resolve);
    });
  }

  public stop() {
    clearInterval(this.timer);
    this.emit(FeedWatcherEvents.STOP);
  }

  private watch() {
    const fetch = () => {
      this.fetchEntries()
        .then((entries) => {
          const newEntries = entries.filter(
            (entry) =>
              entry.pubDate > this.lastEntry.date &&
              entry.link !== this.lastEntry.permalink
          );

          if (newEntries.length > 0) {
            this.lastEntry.date = newEntries[0].pubDate;
            this.lastEntry.permalink = newEntries[0].link;
            this.emit(FeedWatcherEvents.NEW, newEntries);
          }
        })
        .catch((err) => this.emit(err));
    };

    return setInterval(() => {
      fetch();
    }, this.interval * 1000);
  }
}
