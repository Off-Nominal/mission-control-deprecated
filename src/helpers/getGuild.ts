import { Client } from "discord.js";

export default function getGuild(client: Client, guildId: string) {
  return client.guilds.cache.find((guild) => guild.id === guildId);
}
