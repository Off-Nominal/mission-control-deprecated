import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Client, GatewayIntentBits, Partials } from "discord.js";
import { generatePresenceData, getGuild } from "src/helpers";

@Injectable()
export class HelperBot extends Client {
  constructor(private configService: ConfigService) {
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

    this.once("ready", () => {
      console.log("Helper Bot Ready");
      this.user.setPresence(generatePresenceData("/help"));

      const guild = getGuild(this, this.configService.get<string>("guildId"));

      guild.members
        .fetch()
        .catch((err) =>
          console.error("Error fetching partials for Guild Members", err)
        );
    });
  }
}
