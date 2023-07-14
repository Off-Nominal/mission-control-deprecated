import { Injectable } from "@nestjs/common";
import { DiscordLoggerService } from "src/discord-logger/discord-logger.service";
import { CmsNewsFeed, NewsFeedDocument } from "./news-manager.types";
import {
  FeedParserEntry,
  FeedWatcherEvents,
} from "./feed-watcher/feed-watcher.types";
import { FeedWatcher } from "./feed-watcher/feed-watcher.utility";
import { newsFeedMapper, shouldFilter } from "./news-manager.utility";
import { sub } from "date-fns";
import { isFulfilled } from "src/types/typeguards";
import { ContentFeedItem } from "./rss.types";
import { SanityService } from "src/sanity/sanity.service";
import { ContentBot } from "src/discord-clients/content-bot-service";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { ChannelType, NewsChannel } from "discord.js";
import { ConfigService } from "@nestjs/config";
import { createUniqueResultEmbed } from "./rss.utility";

const FEED_INTERVAL = 60; // five minutes interval for checking news sources

@Injectable()
export class NewsManagerService {
  private feeds: CmsNewsFeed[] = [];
  private channel: NewsChannel;
  private entryUrls: { [key: string]: boolean } = {};
  private query: string =
    '*[_type == "newsFeed"]{name, filter, _id, diagnostic, thumbnail, url}';

  constructor(
    private loggerService: DiscordLoggerService,
    private sanityService: SanityService,
    private client: ContentBot,
    private eventEmitter: EventEmitter2,
    private configService: ConfigService
  ) {
    this.loggerService.setContext(NewsManagerService.name);

    const channelFetch = this.client.channels
      .fetch(this.configService.get<string>("guildChannels.news"))
      .then((channel) => {
        if (channel.type !== ChannelType.GuildAnnouncement) {
          throw new Error(
            `News Manager target channel is not type Announcements.`
          );
        }
        this.channel = channel;
        return "Successfully fetched news channel";
      });

    this.subscribeToCms(this.query);

    const queryFetch = this.queryCms(this.query).then((promises) => {
      const totalSubs = promises.length;
      const successfulSubs = promises.filter(isFulfilled).length;
      if (successfulSubs > 0) {
        return `Successfully subscribed to ${successfulSubs}/${totalSubs} news feeds.`;
      } else {
        throw new Error(`Failure to subscribe to any News Feeds.`);
      }
    });

    Promise.all([channelFetch, queryFetch])
      .then(([channelMsg, queryMessage]) => {
        this.eventEmitter.emit("boot", {
          key: "newsManager",
          status: true,
          message: queryMessage,
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

  private watcherGenerator = (feed: NewsFeedDocument) => {
    const { url, name, thumbnail, diagnostic } = feed;

    return new FeedWatcher(url, { interval: FEED_INTERVAL })
      .on(FeedWatcherEvents.NEW, (entries: FeedParserEntry[]) => {
        entries.forEach((entry) => {
          if (shouldFilter(entry, feed)) {
            return console.log("Filtered out a value: ", entry.link);
          }

          if (this.entryUrls[entry.link]) {
            return console.log("Duplicate story: ", entry.link);
          }

          this.entryUrls[entry.link] = true;
          diagnostic && console.log(entry);
          this.notifyNew(newsFeedMapper(entry, name, thumbnail));
        });
      })
      .on(FeedWatcherEvents.ERROR, (error) => {
        console.error(`Error reading news Feed: ${name}`, error);
      });
  };

  public initiateWatcher(feed: NewsFeedDocument): Promise<string> {
    const thumbnail = feed.thumbnail
      ? this.sanityService.imageBuilder.image(feed.thumbnail).url()
      : "";
    const formattedFeed = {
      ...feed,
      thumbnail,
    };
    const watcher = this.watcherGenerator(formattedFeed);
    const thresholdDate = sub(new Date(), { days: 3 });

    return watcher
      .start()
      .then((entries) => {
        const recentEntries = entries.filter(
          (entry) => entry.pubDate.getTime() > thresholdDate.getTime()
        );
        recentEntries.forEach((entry) => (this.entryUrls[entry.link] = true));
        this.feeds.push({
          data: formattedFeed,
          watcher,
        });
        return feed.name;
      })
      .catch((error) => {
        console.error(error);
        throw feed.name;
      });
  }

  public queryCms(query: string) {
    return this.sanityService.client
      .fetch<NewsFeedDocument[]>(query)
      .then((feeds) => {
        const promises = feeds.map((feed) => this.initiateWatcher(feed));
        return Promise.allSettled(promises);
      });
  }

  private fetchFeedIndex(id: string) {
    return this.feeds.findIndex((feed) => feed.data._id === id);
  }

  private deleteFeed(id: string) {
    const feedIndex = this.fetchFeedIndex(id);

    if (feedIndex < 0) {
      return;
    }

    const feed = this.feeds[feedIndex];
    feed.watcher.stop();
    this.feeds.splice(feedIndex, 1);
    console.log(`Stopped monitoring ${feed.data.name}`);
  }

  public subscribeToCms(query: string) {
    this.sanityService.client
      .listen<NewsFeedDocument>(query)
      .subscribe((update) => {
        update.mutations.forEach((mutation) => {
          const id = update.documentId;

          if ("createOrReplace" in mutation) {
            this.deleteFeed(id);
            this.initiateWatcher(update.result);
          }
          if ("create" in mutation) {
            this.initiateWatcher(update.result);
          }
          if ("delete" in mutation) {
            this.deleteFeed(id);
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
