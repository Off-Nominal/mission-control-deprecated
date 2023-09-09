import { GatewayIntentBits, Partials } from "discord.js";
import { DiscordClient } from "src/discord-clients/discord-clients.types";

export type DiscordClientConfig = {
  critical: boolean;
  name: string;
  token: string;
  appId: string;
  presenceData: string;
  prefetchMembers: boolean;
  partials: Partials[];
  intents: GatewayIntentBits[];
};

export const discordClients: Record<DiscordClient, DiscordClientConfig> = {
  [DiscordClient.HELPER]: {
    critical: true,
    name: "Helper Discord Client",
    token: process.env.HELPER_BOT_TOKEN_ID,
    appId: process.env.HELPER_BOT_APP_ID,
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
    token: process.env.EVENTS_BOT_TOKEN_ID,
    appId: process.env.EVENTS_BOT_APP_ID,
    presenceData: "/events help",
    prefetchMembers: false,
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
    token: process.env.CONTENT_BOT_TOKEN_ID,
    appId: process.env.CONTENT_BOT_APP_ID,
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
    token: process.env.NDB2_BOT_TOKEN_ID,
    appId: process.env.NDB2_BOT_APP_ID,
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
