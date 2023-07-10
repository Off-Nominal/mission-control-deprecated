import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { Client, GatewayIntentBits, Guild } from "discord.js";
import { generatePresenceData } from "src/helpers";
import { handleError } from "src/helpers/handleError";

@Injectable()
export class EventsBot extends Client {
  public guild: Guild;

  constructor(
    private configService: ConfigService,
    private eventEmitter: EventEmitter2
  ) {
    super({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.GuildScheduledEvents,
      ],
    });

    this.login(this.configService.get<string>("discordClients.tokens.events"));

    // Boot errors
    this.once("error", (err) => {
      const [error] = handleError(err);
      console.error(err);

      this.eventEmitter.emit("boot", {
        key: "eventsBot",
        status: false,
        message: error,
      });
    });

    this.once("ready", () => {
      this.removeListener("error", () => {});

      this.user.setPresence(generatePresenceData("/events help"));

      this.guild = this.guilds.cache.find(
        (guild) => guild.id === this.configService.get<string>("guildId")
      );

      this.eventEmitter.emit("boot", {
        key: "eventsBot",
        status: true,
        message: "Events Bot ready.",
      });
    });
  }
}
