import { EmbedBuilder } from "discord.js";
import { ContentFeedItem } from "./rss.types";
import { FeedParserEntry } from "./feed-watcher/feed-watcher.types";
import { stripHtml } from "string-strip-html";

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
