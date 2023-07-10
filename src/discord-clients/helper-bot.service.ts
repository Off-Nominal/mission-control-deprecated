import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { Client, GatewayIntentBits, Guild, Partials } from "discord.js";
import { generatePresenceData } from "src/helpers";
import { handleError } from "src/helpers/handleError";

@Injectable()
export class HelperBot extends Client {
  public guild: Guild;

  constructor(
    private configService: ConfigService,
    private eventEmitter: EventEmitter2
  ) {
    super({
      partials: [
        Partials.Message,
        Partials.Channel,
        Partials.Reaction,
        Partials.GuildMember,
      ],
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.MessageContent,
      ],
    });

    this.login(this.configService.get<string>("discordClients.tokens.helper"));

    // Boot errors
    this.once("error", (err) => {
      const [error] = handleError(err);
      console.error(err);

      this.eventEmitter.emit("boot", {
        key: "helperBot",
        status: false,
        message: error,
      });
    });

    this.once("ready", () => {
      this.removeListener("error", () => {});

      this.user.setPresence(generatePresenceData("/help"));

      this.guild = this.guilds.cache.find(
        (guild) => guild.id === this.configService.get<string>("guildId")
      );

      this.guild.members
        .fetch()
        .then(() => {
          this.eventEmitter.emit("boot", {
            key: "helperBot",
            status: true,
            message: "Helper Bot ready.",
          });
        })
        .catch((err) => {
          const [error] = handleError(err);
          this.eventEmitter.emit("boot", {
            key: "helperBot",
            status: false,
            message: error,
          });
        });
    });
  }
}
