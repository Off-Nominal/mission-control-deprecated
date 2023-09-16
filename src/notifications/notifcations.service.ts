import { Inject, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {
  ChatInputCommandInteraction,
  Collection,
  EmbedBuilder,
  GuildMember,
  MessageCreateOptions,
} from "discord.js";
import {
  DiscordClient,
  ExtendedClient,
} from "src/discord-clients/discord-clients.types";
import { DiscordLoggerService } from "src/discord-logger/discord-logger.service";
import { ManagedEvent } from "src/events-manager/events-manager.types";
import { UsersService } from "src/users/users.service";

@Injectable()
export class NotificationsService {
  constructor(
    @Inject(DiscordClient.EVENTS) private eventsClient: ExtendedClient,
    private loggerService: DiscordLoggerService,
    private configService: ConfigService,
    private users: UsersService
  ) {
    this.loggerService.setContext(NotificationsService.name);
    this.eventsClient.on("interactionCreate", async (interaction) => {
      if (!interaction.isChatInputCommand()) return;

      const { options } = interaction;
      const subCommand = options.getSubcommand(false);

      const allowedSubcommands = this.configService.get(
        `discordClients.${DiscordClient.EVENTS}.subCommands`
      );

      if (
        subCommand !== allowedSubcommands.SUBSCRIBE &&
        subCommand !== allowedSubcommands.UNSUBSCRIBE
      ) {
        return;
      }

      this.setSubscription(
        interaction,
        subCommand === allowedSubcommands.SUBSCRIBE
      );
    });
  }

  private async setSubscription(
    interaction: ChatInputCommandInteraction,
    subscribe: boolean
  ) {
    const { options } = interaction;

    // undefined means the user submitted no input (don't change)
    // null means the user requested to unsubscribe
    // false means the user requested to unsubscribe
    // true or a number is a request to subscribe
    let newEvent: boolean | undefined | null = undefined;
    let preEvent: number | undefined | null = undefined;

    if (subscribe) {
      const newEventInput = options.getBoolean("new-event");
      newEvent = newEventInput === null ? undefined : newEventInput;
      preEvent = options.getInteger("pre-event") || undefined;
    } else {
      newEvent = null;
      preEvent = null;
    }

    if (newEvent === undefined && preEvent === undefined) {
      interaction.reply({
        content:
          "No parameters set, so no changes to your notificatin subscription settings.",
        ephemeral: true,
      });
      return;
    }

    try {
      const user = await this.users.setEventSubscriptions(
        interaction.user.id,
        newEvent,
        preEvent
      );

      const { new_event, pre_notification } = user;

      const embed = new EmbedBuilder()
        .setTitle("Subscription updated!")
        .setDescription("Current subscription settings are:")
        .addFields([
          {
            name: "New Event Notifications",
            value: new_event ? "Enabled" : "Disabled",
            inline: true,
          },
          {
            name: "Pre-Event Notification Time",
            value: pre_notification
              ? pre_notification + " minutes before the event"
              : "Disabled",
            inline: true,
          },
        ]);
      interaction.reply({
        embeds: [embed],
        ephemeral: true,
      });
    } catch (err) {
      console.error(err);
      interaction.reply({
        content:
          "Something went wrong setting your subscriptions. Please let Jake know!",
        ephemeral: true,
      });
    }
  }

  public async notify(type: ManagedEvent, payload: MessageCreateOptions) {
    const query = await this.users.getSubscribersByType(type);

    const memberIds = query.map((user) => user.discord_id);
    let subscribers: Collection<string, GuildMember>;

    try {
      subscribers = await this.eventsClient.guild.members.fetch({
        user: memberIds,
      });
    } catch (err) {
      console.error("Failed to fetch User subscriber list on new event create");
      return console.error(err);
    }

    subscribers.forEach(async (subscriber) => {
      try {
        const dmChannel = await subscriber.createDM();
        await dmChannel.send(payload);
      } catch (err) {
        console.error(
          `Error sending new event notificaiton to ${subscriber.displayName}`
        );
        console.error(err);
      }
    });
  }
}
