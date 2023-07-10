import {
  GuildScheduledEvent,
  EmbedBuilder,
  time,
  TimestampStyles,
} from "discord.js";
import { ManagedEvent } from "../events-manager.types";

export default function generateEventNotificationEmbed(
  event: GuildScheduledEvent,
  type: ManagedEvent,
  options?: {
    thumbnail?: string;
  }
): EmbedBuilder {
  const thumbnail =
    options?.thumbnail ||
    "https://res.cloudinary.com/dj5enq03a/image/upload/v1642095232/Discord%20Assets/offnominal_2021-01_w4buun.png";
  const author =
    type === ManagedEvent.PRE_EVENT
      ? "📅 Event Happening Soon!"
      : "🎉 New Live Event!";

  const embed = new EmbedBuilder({
    title: event.name,
    author: {
      name: author,
    },
    description: event.description || "No event description provided.",
    thumbnail: {
      url: thumbnail,
    },
    fields: [
      {
        name: "Date/Time",
        value: `${time(
          event.scheduledStartAt,
          TimestampStyles.LongDateTime
        )} (time local to you)\n(${time(
          event.scheduledStartAt,
          TimestampStyles.RelativeTime
        )})`,
      },
      {
        name: "Watch here",
        value: `[Event URL](${event.entityMetadata.location})`,
        inline: true,
      },
      {
        name: "Get Notified",
        value: `[Discord Event](${event.url})`,
        inline: true,
      },
    ],
  });

  if (event.image) {
    embed.setImage(
      `https://cdn.discordapp.com/guild-events/${event.id}/${event.image}.png?size=512`
    );
  }

  return embed;
}
