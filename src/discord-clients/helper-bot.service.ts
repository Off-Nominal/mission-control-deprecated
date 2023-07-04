import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { Client, GatewayIntentBits, Partials } from "discord.js";
import { generatePresenceData, getGuild } from "src/helpers";

@Injectable()
export class HelperBot extends Client {
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
      this.eventEmitter.emit("boot", {
        key: "helperBot",
        status: false,
        message: err,
      });
    });

    this.once("ready", () => {
      this.removeListener("error", () => {});

      this.user.setPresence(generatePresenceData("/help"));

      const guild = getGuild(this, this.configService.get<string>("guildId"));

      guild.members
        .fetch()
        .then(() => {
          this.eventEmitter.emit("boot", {
            key: "helperBot",
            status: true,
            message: "Helper Bot ready.",
          });
        })
        .catch((err) => {
          this.eventEmitter.emit("boot", { key: "helperBot", status: false });
        });
    });
  }
}
