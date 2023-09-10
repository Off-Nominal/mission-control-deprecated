import { GatewayIntentBits, Partials } from "discord.js";
import { DiscordClient } from "src/discord-clients/discord-clients.types";

export type DiscordClientConfig = {
  critical: boolean;
  name: string;
  token?: string;
  appId?: string;
  presenceData: string;
  prefetchMembers: boolean;
  subCommands?: Record<string, string>;
  partials: Partials[];
  intents: GatewayIntentBits[];
};

enum EventsInteractionSubCommand {
  SUBSCRIBE = "subscribe",
  UNSUBSCRIBE = "unsubscribe",
}

export const discordClients: Record<DiscordClient, DiscordClientConfig> = {
  [DiscordClient.HELPER]: {
    critical: true,
    name: "Helper Discord Client",
    presenceData: "/help",
    prefetchMembers: true,
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
  },
  [DiscordClient.EVENTS]: {
    critical: false,
    name: "Events Discord Client",
    presenceData: "/events help",
    prefetchMembers: false,
    subCommands: EventsInteractionSubCommand,
    partials: [],
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.DirectMessages,
      GatewayIntentBits.GuildScheduledEvents,
    ],
  },
  [DiscordClient.CONTENT]: {
    critical: false,
    name: "Content Discord Client",
    presenceData: "/content help",
    prefetchMembers: false,
    partials: [],
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.DirectMessages,
    ],
  },
  [DiscordClient.NDB2]: {
    critical: false,
    name: "Nostradambot2 Discord Client",

    presenceData: "/ndb help",
    prefetchMembers: false,
    partials: [],
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.DirectMessages,
    ],
  },
};
