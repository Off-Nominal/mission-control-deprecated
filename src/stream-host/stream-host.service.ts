import { Injectable } from "@nestjs/common";
import { GuildScheduledEvent } from "discord.js";
import { EventsBot } from "src/discord-clients/events-bot.service";

@Injectable()
export class StreamHostService {
  constructor(private client: EventsBot) {
    this.client.on(
      "guildScheduledEventUpdate",
      (oldEvent: GuildScheduledEvent, newEvent: GuildScheduledEvent) => {
        // check for party
        // start party?
      }
    );
  }

  startParty() {
    //
  }
}
