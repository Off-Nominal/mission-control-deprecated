import { Global, Module } from "@nestjs/common";
import { DiscordClient } from "./discord-clients.types";
import { generateClientProvider } from "./discord-clients.utility";

const discordClientProviders = Object.values(DiscordClient).map((clientName) =>
  generateClientProvider(clientName)
);

@Global()
@Module({
  providers: [...discordClientProviders],
  exports: [...discordClientProviders],
})
export class DiscordClientsModule {}
