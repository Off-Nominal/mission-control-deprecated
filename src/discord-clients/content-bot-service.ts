import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { Client, GatewayIntentBits, Guild } from "discord.js";
import { generatePresenceData } from "src/helpers";
import { handleError } from "src/helpers/handleError";

@Injectable()
export class ContentBot extends Client {
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
      ],
    });

    this.login(this.configService.get<string>("discordClients.tokens.content"));

    // Boot errors
    this.once("error", (err) => {
      const [error] = handleError(err);
      console.error(err);

      this.eventEmitter.emit("boot", {
        key: "contentBot",
        status: false,
        message: error,
      });
    });

    this.once("ready", () => {
      this.removeListener("error", () => {});

      this.user.setPresence(generatePresenceData("/content help"));

      this.guild = this.guilds.cache.find(
        (guild) => guild.id === this.configService.get<string>("guildId")
      );

      this.eventEmitter.emit("boot", {
        key: "contentBot",
        status: true,
        message: "Content Bot ready.",
      });
    });
  }
}
