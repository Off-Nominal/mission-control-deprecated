import { Inject, Injectable } from "@nestjs/common";
import { GuildScheduledEvent } from "discord.js";
import {
  DiscordClient,
  ExtendedClient,
} from "src/discord-clients/discord-clients.types";

@Injectable()
export class StreamHostService {
  constructor(
    @Inject(DiscordClient.EVENTS)
    private client: ExtendedClient
  ) {
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
