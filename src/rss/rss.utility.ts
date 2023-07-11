import { EmbedBuilder } from "discord.js";
import { ContentFeedItem } from "./rss.types";

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