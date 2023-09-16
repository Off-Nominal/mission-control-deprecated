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
import { ManagedEvent } from "./events-manager.types";
import {
  DiscordClient,
  ExtendedClient,
} from "src/discord-clients/discord-clients.types";
import { formatDistance } from "date-fns";

const MINUTE_IN_MS = 60 * 1000;
const THIRTY_MINS_IN_MS = MINUTE_IN_MS * 30;
const THIRTY_ONE_MINS_IN_MS = MINUTE_IN_MS * 31;

@Injectable()
export class EventsManagerService {
  constructor(
    @Inject(DiscordClient.EVENTS)
    private client: ExtendedClient,
    private notifications: NotificationsService,
    private loggerService: DiscordLoggerService
  ) {
    this.loggerService.setContext(EventsManagerService.name);

    this.client.on("guildScheduledEventCreate", (event) => {
      this.notify(ManagedEvent.NEW, event);
    });
  }

  @Cron(CronExpression.EVERY_MINUTE)
  fetchEvents() {
    this.client.guild.scheduledEvents.fetch().then((events) => {
      const now = Date.now();
      events.forEach((event) => {
        const startTime = event.scheduledStartAt.getTime();
        const timeToStart = startTime - now;

        // Events 30 minutes out
        if (
          timeToStart >= THIRTY_MINS_IN_MS &&
          timeToStart < THIRTY_ONE_MINS_IN_MS
        ) {
          this.notify(ManagedEvent.PRE_EVENT, event);
        }
      });
    });
  }

  private notify(
    type: ManagedEvent,
    event: GuildScheduledEvent<GuildScheduledEventStatus>
  ) {
    // get applicable users with notifcations service
    const embed = generateEventNotificationEmbed(event, type);

    const diff = formatDistance(new Date(), event.scheduledStartAt);

    const messagePayload: MessageCreateOptions = {
      content: `New Event: ${event.name} in ${diff}\n\nYou are receiving this DM because you subscribed via the \`/events\` command. If you want to change this, you can update your settings with \`/events subscribe\` or \`/events unsubscribe\` (note: This must be done in the server and not via DM.)`,
      embeds: [embed],
    };
  }
}
