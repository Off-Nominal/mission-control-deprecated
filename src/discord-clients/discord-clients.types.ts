import { Client, ClientOptions, Guild } from "discord.js";

export enum DiscordClient {
  HELPER = "HELPER_BOT",
  CONTENT = "CONTENT_BOT",
  EVENTS = "EVENTS_BOT",
  NDB2 = "NDB2_BOT",
}

export class ExtendedClient extends Client {
  public guild: Guild;

  constructor(options: ClientOptions) {
    super(options);
  }
}
