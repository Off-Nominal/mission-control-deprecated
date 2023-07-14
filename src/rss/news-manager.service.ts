import { Injectable } from "@nestjs/common";
import { DiscordLoggerService } from "src/discord-logger/discord-logger.service";
import { CmsNewsFeed, NewsFeedDocument } from "./news-manager.types";
import { FeedParserEntry } from "./feed-watcher/feed-watcher.types";
import { FeedWatcher } from "./feed-watcher/feed-watcher.utility";
import { newsFeedMapper, shouldFilter } from "./news-manager.utility";
import { isAfter, sub } from "date-fns";
import { ContentFeedItem } from "./rss.types";
import { SanityService } from "src/sanity/sanity.service";
import { ContentBot } from "src/discord-clients/content-bot-service";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { ChannelType, NewsChannel } from "discord.js";
import { ConfigService } from "@nestjs/config";
import { createUniqueResultEmbed } from "./rss.utility";
import { SchedulerRegistry } from "@nestjs/schedule";

@Injectable()
export class NewsManagerService {
  private feeds = new Map<string, CmsNewsFeed>();
  private channel: NewsChannel;
  private entryUrls: { [key: string]: boolean } = {};
  private query: string =
    '*[_type == "newsFeed"]{name, filter, _id, diagnostic, thumbnail, url}';

  constructor(
    private schedulerRegistry: SchedulerRegistry,
    private loggerService: DiscordLoggerService,
    private sanityService: SanityService,
    private client: ContentBot,
    private eventEmitter: EventEmitter2,
    private configService: ConfigService
  ) {
    this.loggerService.setContext(NewsManagerService.name);

    this.subscribeToCms(this.query);

    this.getFeeds(this.query).then((feeds) => {
      for (const feed of feeds) {
        this.subscribe(feed);
      }
    });

    Promise.all([this.fetchChannel(), this.initialize()])
      .then(([channel, feedInitMessage]) => {
        this.channel = channel;

        this.eventEmitter.emit("boot", {
          key: "newsManager",
          status: true,
          message: feedInitMessage,
        });
      })
      .catch((err) => {
        this.eventEmitter.emit("boot", {
          key: "newsManager",
          status: false,
          message: err.message,
        });
      });
  }

  private subscribe(feed: NewsFeedDocument) {
    const thumbnail = feed.thumbnail
      ? this.sanityService.imageBuilder.image(feed.thumbnail).url()
      : "";

    this.feeds.set(feed._id, {
      data: { ...feed, thumbnail },
      watcher: this.createWatcher(feed),
      status: "starting",
    });
  }

  private fetchChannel() {
    console.log(this.client.channels);
    return this.client.channels
      .fetch(this.configService.get<string>("guildChannels.news"))
      .then((channel) => {
        console.log(this.client.channels);
        if (channel.type !== ChannelType.GuildAnnouncement) {
          throw new Error(
            `News Manager target channel is not type Announcements.`
          );
        }
        return channel;
      });
  }

  private initialize() {
    return new Promise((resolve, reject) => {
      const checker = () => {
        let successes = 0;
        let isReady = true;

        for (const _id in this.feeds) {
          if (this.feeds.get(_id).status === "starting") {
            isReady = false;
            break;
          }

          if (this.feeds.get(_id).status === "ready") {
            successes++;
          }
        }

        if (!isReady) {
          setTimeout(() => {
            checker();
          }, 1200);
          return;
        }

        if (successes === 0) {
          return reject(`Failure to subscribe to any News Feeds.`);
        }

        resolve(
          `Successfully subscribed to ${successes}/${this.feeds.size} news feeds.`
        );
      };

      checker();
    });
  }

  private getFeeds(query: string) {
    return this.sanityService.client.fetch<NewsFeedDocument[]>(query);
  }

  private handleReady(entries: FeedParserEntry[]) {
    const thresholdDate: Date = sub(new Date(), { days: 3 });

    const recentEntries = entries.filter((entry) =>
      isAfter(entry.pubDate, thresholdDate)
    );
    recentEntries.forEach((entry) => (this.entryUrls[entry.link] = true));
  }

  private createWatcher(feed: NewsFeedDocument) {
    const watcher = new FeedWatcher(this.schedulerRegistry, feed.url);

    watcher.on("ready", (entries) => {
      this.feeds.get(feed._id).status = "ready";
      this.handleReady(entries);
    });

    watcher.on("init_error", (err) => {
      this.feeds.get(feed._id).status = "error";
    });

    watcher.on("new", (entries) => {
      for (const entry of entries) {
        this.handleNew(entry, feed);
      }
    });

    watcher.start();

    return watcher;
  }

  private handleNew(entry: FeedParserEntry, feed: NewsFeedDocument) {
    if (shouldFilter(entry, feed) || this.entryUrls[entry.link]) {
      return;
    }

    this.entryUrls[entry.link] = true;
    feed.diagnostic && console.log(entry);
    this.notifyNew(newsFeedMapper(entry, feed.name, feed.thumbnail));
  }

  private unsubscribe(feedId: string) {
    this.feeds[feedId].watcher.stop();
    this.feeds.delete(feedId);
  }

  public subscribeToCms(query: string) {
    this.sanityService.client
      .listen<NewsFeedDocument>(query)
      .subscribe((update) => {
        update.mutations.forEach((mutation) => {
          const id = update.documentId;

          if ("createOrReplace" in mutation) {
            this.unsubscribe(id);
            this.subscribe(update.result);
          }
          if ("create" in mutation) {
            this.subscribe(update.result);
          }
          if ("delete" in mutation) {
            this.unsubscribe(id);
          }
        });
      });
  }

  public async notifyNew(content: ContentFeedItem, text?: string) {
    const { source } = content;

    this.channel
      .send({
        embeds: [createUniqueResultEmbed(content)],
        content: text,
      })
      .catch((err) => {
        console.error(
          `Error sending message to Discord for update to ${source}`
        );
        console.error(err);
      })
      .then((msg) => {
        msg && msg.crosspost();
      })
      .catch((err) => {
        console.error("Unable to publish content");
        console.error(err);
      });
  }
}
