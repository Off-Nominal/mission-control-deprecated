import { Inject, Injectable } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import {
  GuildScheduledEvent,
  GuildScheduledEventStatus,
  MessageCreateOptions,
} from "discord.js";
import { DiscordLoggerService } from "src/discord-logger/discord-logger.service";
import { NotificationsService } from "src/notifications/notifcations.service";
import generateEventNotificationEmbed from "./helpers/generateEventNotificationEmbed";
import {
  DiscordClient,
  ExtendedClient,
} from "src/discord-clients/discord-clients.types";
import { formatDistance } from "date-fns";
import { Notifications } from "src/notifications/notifications.types";

const MINUTE_IN_MS = 60 * 1000;
const ONE_DAY_IN_MINUTES = 1440;

@Injectable()
export class EventsManagerService {
  constructor(
    @Inject(DiscordClient.EVENTS)
    private client: ExtendedClient,
    private loggerService: DiscordLoggerService,
    private notifcationsService: NotificationsService
  ) {
    this.loggerService.setContext(EventsManagerService.name);

    this.client.on("guildScheduledEventCreate", (event) => {
      this.notify(Notifications.Event.NEW_DISCORD, event);
    });
  }

  @Cron(CronExpression.EVERY_MINUTE)
  fetchEvents() {
    this.client.guild.scheduledEvents.fetch().then((events) => {
      const now = Date.now();
      events.forEach((event) => {
        const startTime = event.scheduledStartAt.getTime();
        const timeToStart = startTime - now;

        if (timeToStart < ONE_DAY_IN_MINUTES) {
          const maxTime = (startTime - now) / MINUTE_IN_MS;
          const minTime = maxTime - 5;

          this.notify(Notifications.Event.PRE_DISCORD, event);
        }
      });
    });
  }

  private notify(
    type: Notifications.Event,
    event: GuildScheduledEvent<GuildScheduledEventStatus>
  ) {
    const embed = generateEventNotificationEmbed(event, type);

    const diff = formatDistance(new Date(), event.scheduledStartAt);

    const messagePayload: MessageCreateOptions = {
      content: `New Event: ${event.name} in ${diff}\n\nYou are receiving this DM because you subscribed via the \`/events\` command. If you want to change this, you can update your settings with \`/events subscribe\` or \`/events unsubscribe\` (note: This must be done in the server and not via DM.)`,
      embeds: [embed],
    };

    this.notifcationsService.notify(type, messagePayload);
  }
}
