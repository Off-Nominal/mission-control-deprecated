import { Provider } from "@nestjs/common";
import { DiscordClient, ExtendedClient } from "./discord-clients.types";
import { ConfigService } from "@nestjs/config";

import { ActivityType, PresenceData, ThreadChannel } from "discord.js";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { handleError } from "src/helpers/handleError";
import { DiscordClientConfig } from "src/config/discord-client.configuration";

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
      const config = configService.get<DiscordClientConfig>(
        `discordClients.${clientName}`
      );
      const {
        critical,
        token,
        presenceData,
        prefetchMembers,
        joinThreads,
        subCommands,
        partials,
        intents,
      } = config;

      const client = new ExtendedClient({
        partials,
        intents,
      });

      client.on("ready", () => {
        client.user.setPresence(generatePresenceData(presenceData));

        // Preload our guild into the client for easy access
        client.guild = client.guilds.cache.find(
          (guild) => guild.id === configService.get<string>("guildId")
        );

        // Preload cache of guild members if needed
        if (prefetchMembers) {
          client.guild.members.fetch();
        }
      });

      // Handle invalid subcommands, so services consuming this provider don't need to worry about them
      client.on("interactionCreate", (interaction) => {
        if (!interaction.isChatInputCommand()) return;

        const { options } = interaction;
        const subCommand = options.getSubcommand(false);

        const allowedSubcommands = subCommands;

        if (!Object.values(allowedSubcommands).includes(subCommand)) {
          interaction.reply({
            content:
              "You've sent an invalid subcommand, somehow. Better let Jake know.",
            ephemeral: true,
          });
        }
      });

      // Auto join threads if configured
      if (joinThreads) {
        client.on("threadCreate", async (thread: ThreadChannel) => {
          if (!thread.joinable) {
            return;
          }
          try {
            await thread.join();
          } catch (err) {
            console.error(err);
          }
        });
      }

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
