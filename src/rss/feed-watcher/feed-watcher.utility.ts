import { EventEmitter } from "events";
import axios from "axios";
import {
  FeedParserEntry,
  FeedParserEvents,
  FeedWatcherEvent,
  FeedWatcherOptions,
} from "./feed-watcher.types";
import { CronExpression, SchedulerRegistry } from "@nestjs/schedule";
import { CronJob } from "cron";
const FeedParser = require("feedparser");

const DEFAULT_RETRY_ATTEMPTS = 3;
const DEFAULT_RETRY_WAIT_TIME_IN_SECONDS = 1;

export class FeedWatcher extends EventEmitter {
  // Typed events
  private _untypedOn = this.on;
  private _untypedEmit = this.emit;
  public on = <K extends keyof FeedWatcherEvent>(
    event: K,
    listener: FeedWatcherEvent[K]
  ): this => this._untypedOn(event, listener);
  public emit = <K extends keyof FeedWatcherEvent>(
    event: K,
    ...args: Parameters<FeedWatcherEvent[K]>
  ): boolean => this._untypedEmit(event, ...args);

  private loadAttempts: number = 0;
  private options: FeedWatcherOptions;
  private lastEntry: {
    date?: Date;
    permalink?: string;
  };

  constructor(
    private schedulerRegistry: SchedulerRegistry,
    private feedurl: string,
    options: FeedWatcherOptions = {}
  ) {
    super();
    this.options = options;
    this.lastEntry = {};
  }

  private fetchEntries(): Promise<FeedParserEntry[]> {
    return new Promise((resolve, reject) => {
      const entries: FeedParserEntry[] = [];

      const feedParser = new FeedParser()
        .on(FeedParserEvents.ERROR, (err) => reject(err))
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

  public start(): void {
    const attempts = this.options.attempts || DEFAULT_RETRY_ATTEMPTS;
    const retryTime =
      (this.options.retryTime || DEFAULT_RETRY_WAIT_TIME_IN_SECONDS) * 1000;

    const fetcher = () => {
      this.loadAttempts++;
      this.fetchEntries()
        .then((entries) => {
          this.lastEntry.date = entries[0].pubDate;
          this.lastEntry.permalink = entries[0].link;

          const job = new CronJob(CronExpression.EVERY_30_SECONDS, () => {
            this.updateEntries();
          });
          this.schedulerRegistry.addCronJob(`updateFeed[${this.feedurl}]`, job);
          job.start();

          this.emit("ready", entries);
        })
        .catch((err) => {
          if (attempts <= this.loadAttempts) {
            this.emit("init_error", {
              error: err,
              url: this.feedurl,
              attempts: this.options.attempts,
            });
          } else {
            setTimeout(() => {
              fetcher();
            }, retryTime);
          }
        });
    };

    fetcher();
  }

  public updateEntries(): void {
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
          this.emit("new", newEntries);
        }
      })
      .catch((err) => {
        this.emit("read_error", {
          error: err,
          url: this.feedurl,
        });
      });
  }

  public stop() {
    const job = this.schedulerRegistry.getCronJob(
      `updateFeed[${this.feedurl}]`
    );
    job.stop();
  }
}
