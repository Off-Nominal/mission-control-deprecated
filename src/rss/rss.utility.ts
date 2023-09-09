import { EmbedBuilder } from "discord.js";
import { ContentFeed, ContentFeedItem } from "./rss.types";
import { FeedParserEntry } from "./feed-watcher/feed-watcher.types";
import { stripHtml } from "string-strip-html";
import { Provider } from "@nestjs/common";
import { ContentListener } from "./content-listener/content-listener.service";
import { ConfigService } from "@nestjs/config";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { SchedulerRegistry } from "@nestjs/schedule";
import { ContentFeedConfig } from "src/config/content.configuration";

export const generateContentFeedProvider = (feed: ContentFeed): Provider => {
  const provider: Provider = {
    provide: feed,
    useFactory: (
      configService: ConfigService,
      eventEmitter: EventEmitter2,
      schedulerRegistry: SchedulerRegistry
    ) => {
      const { url, mapper, searchOptions } =
        configService.get<ContentFeedConfig>(`rssFeeds.${feed}`);

      return new ContentListener(eventEmitter, schedulerRegistry, url, {
        searchOptions,
        token: feed,
        mapper,
      });
    },
    inject: [ConfigService, EventEmitter2, SchedulerRegistry],
  };

  return provider;
};

export const createUniqueResultEmbed = (feedItem: ContentFeedItem) => {
  const { author, title, url, description, summary, date, thumbnail, source } =
    feedItem;

  const desc = summary || description;

  const embed = new EmbedBuilder({
    author: {
      name: author?.slice(0, 255),
    },
    title,
    url,
    description: desc.length < 300 ? desc : desc.slice(0, 300).concat("..."),
    footer: {
      text: source,
    },
    timestamp: date,
    thumbnail: {
      url: thumbnail,
    },
  });

  return embed;
};

export const youtubeFeedMapper = (
  feedItem: FeedParserEntry,
  showTitle: string
): ContentFeedItem => {
  return {
    author: showTitle,
    title: feedItem.title,
    date: new Date(feedItem.date),
    url: feedItem.link,
    thumbnail: feedItem.image.url,
    summary: feedItem["media:group"]["media:description"]["#"],
    id: feedItem["yt:videoid"]["#"],
    source: showTitle,
  };
};

export const simpleCastFeedMapper = (
  feedItem: FeedParserEntry,
  showTitle: string
): ContentFeedItem => {
  const description = stripHtml(feedItem.description).result;
  return {
    author: feedItem.meta.author,
    title: feedItem.title,
    date: new Date(feedItem.date),
    url: feedItem.link,
    thumbnail: feedItem.image.url || feedItem.meta.image.url,
    description,
    summary: feedItem["itunes:summary"] && feedItem["itunes:summary"]["#"],
    source: showTitle,
  };
};
