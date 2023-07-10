import { FeedParserEntry } from "./feed-watcher/feed-watcher.types";
import { ContentFeedItem } from "./rss.types";

export const newsFeedMapper = (
  feedItem: FeedParserEntry,
  feedTitle: string,
  feedThumbnail: string = ""
): ContentFeedItem => {
  return {
    author: feedItem.author,
    title: feedItem.title,
    date: new Date(feedItem.date),
    url: feedItem.link,
    thumbnail: feedThumbnail,
    description: stripHtml(feedItem.description).result,
    summary: stripHtml(feedItem.summary).result,
    source: feedTitle,
  };
};
