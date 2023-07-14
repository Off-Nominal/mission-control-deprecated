import { Provider } from "@nestjs/common";
import { DiscordClient, ExtendedClient } from "./discord-clients.types";
import { ConfigService } from "@nestjs/config";
import { DiscordClientConfig } from "src/config/configuration";

import { ActivityType, PresenceData } from "discord.js";

export default function generatePresenceData(
  helpCommand: string
): PresenceData {
  return {
    status: "online",
    activities: [
      {
        name: helpCommand,
        type: ActivityType.Playing,
      },
    ],
  };
}

export const generateClientProvider = (clientName: DiscordClient): Provider => {
  return {
    provide: clientName,
    useFactory: async (configService: ConfigService) => {
      const { token, presenceData, prefetchMembers, partials, intents } =
        configService.get<DiscordClientConfig>(`discordClients.${clientName}`);

      const client = new ExtendedClient({
        partials,
        intents,
      });

      return await new Promise((resolve, reject) => {
        client.once("ready", () => {
          client.user.setPresence(generatePresenceData(presenceData));

          client.guild = client.guilds.cache.find(
            (guild) => guild.id === configService.get<string>("guildId")
          );

          if (prefetchMembers) {
            client.guild.members.fetch();
          }

          resolve(client);
        });

        client.once("error", (error) => {
          reject("Could not login");
        });

        client.login(token);
      });
    },
    inject: [ConfigService],
  };
};
