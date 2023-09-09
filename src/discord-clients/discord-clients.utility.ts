import { Provider } from "@nestjs/common";
import { DiscordClient, ExtendedClient } from "./discord-clients.types";
import { ConfigService } from "@nestjs/config";
import { DiscordClientConfig } from "src/config/configuration";

import { ActivityType, PresenceData } from "discord.js";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { handleError } from "src/helpers/handleError";

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
    useFactory: async (
      configService: ConfigService,
      eventEmitter: EventEmitter2
    ) => {
      const {
        critical,
        token,
        presenceData,
        prefetchMembers,
        partials,
        intents,
      } = configService.get<DiscordClientConfig>(
        `discordClients.${clientName}`
      );

      const client = new ExtendedClient({
        partials,
        intents,
      });

      client.on("ready", () => {
        client.user.setPresence(generatePresenceData(presenceData));

        client.guild = client.guilds.cache.find(
          (guild) => guild.id === configService.get<string>("guildId")
        );

        if (prefetchMembers) {
          client.guild.members.fetch();
        }
      });

      // Async factory awaits login of bot if deemed critical
      return await new Promise((resolve, reject) => {
        // Non-critical bots, will notify bootlogger when ready, do not block bootstrapper
        if (!critical) {
          client.on("ready", () => {
            eventEmitter.emit("boot", {
              key: clientName,
              status: true,
              message: `${clientName} Ready.`,
            });
          });
          client.on("error", (err) => {
            const [error] = handleError(err);
            eventEmitter.emit("boot", {
              key: clientName,
              status: true,
              message: error,
            });
          });

          client.login(token);

          return resolve(client);
        }

        // Critical bots block Nest bootstrap until ready
        client.on("ready", () => {
          resolve(client);
        });

        client.on("error", (err) => {
          reject("Could not login");
        });

        client.login(token);
      });
    },
    inject: [ConfigService, EventEmitter2],
  };
};
