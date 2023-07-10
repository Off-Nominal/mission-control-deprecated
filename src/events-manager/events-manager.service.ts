import { Injectable } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import {
  Collection,
  GuildScheduledEvent,
  GuildScheduledEventStatus,
} from "discord.js";
import { EventsBot } from "src/discord-clients/events-bot.service";
import { DiscordLoggerService } from "src/discord-logger/discord-logger.service";
import { NotificationsService } from "src/notifications/notifcations.service";
import generateEventNotificationEmbed from "./helpers/generateEventNotificationEmbed";
import { ManagedEvent } from "./events-manager.types";
import { EventEmitter2 } from "@nestjs/event-emitter";

const FIVE_MINS_IN_MS = 5 * 60 * 1000;
const THIRTY_MINS_IN_MS = FIVE_MINS_IN_MS * 6;
const THIRTY_FIVE_MINS_IN_MS = FIVE_MINS_IN_MS * 7;

@Injectable()
export class EventsManagerService {
  constructor(
    private client: EventsBot,
    private notifications: NotificationsService,
    private loggerService: DiscordLoggerService,
    private eventEmitter: EventEmitter2
  ) {
    this.loggerService.setContext(EventsManagerService.name);

    this.client.on("guildScheduledEventCreate", (event) => {
      this.notify(ManagedEvent.NEW, event);
    });

    this.eventEmitter.emit("boot", {
      key: "eventsManager",
      status: true,
      message: "Events Manager ready.",
    });
  }

  @Cron("* * * 5 * *", {
    name: "fetchEvents",
    timeZone: "America/New_York",
  })
  async fetchEvents() {
    let events: Collection<
      string,
      GuildScheduledEvent<GuildScheduledEventStatus>
    >;

    try {
      events = await this.client.guild.scheduledEvents.fetch();
    } catch (err) {
      console.error(err);
    }

    const now = Date.now();

    events.forEach((event) => {
      const startTime = event.scheduledStartAt.getTime();
      const timeToStart = startTime - now;

      // Events 30 minutes out
      if (
        timeToStart >= THIRTY_MINS_IN_MS &&
        timeToStart < THIRTY_FIVE_MINS_IN_MS
      ) {
        this.notify(ManagedEvent.PRE_EVENT, event);
      }
    });
  }

  private notify(
    type: ManagedEvent,
    event: GuildScheduledEvent<GuildScheduledEventStatus>
  ) {
    // get applicable users with notifcations service
    const embed = generateEventNotificationEmbed(event, type);
  }
}
