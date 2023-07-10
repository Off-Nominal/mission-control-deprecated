import { Injectable } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { EventsBot } from "src/discord-clients/events-bot.service";
import { DiscordLoggerService } from "src/discord-logger/discord-logger.service";

@Injectable()
export class EventsManagerService {
  constructor(
    private client: EventsBot,
    private loggerService: DiscordLoggerService
  ) {
    this.loggerService.setContext(EventsManagerService.name);
  }

  @Cron("* * * 5 * *", {
    name: "fetchEvents",
    timeZone: "America/New_York",
  })
  private fetchEvents() {
    return this.client.guild.scheduledEvents.fetch();
  }
}
