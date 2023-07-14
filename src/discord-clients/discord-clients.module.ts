import { Global, Module } from "@nestjs/common";
import { DiscordClient } from "./discord-clients.types";
import { generateClientProvider } from "./discord-clients.utility";

const providers = Object.values(DiscordClient).map((clientName) =>
  generateClientProvider(clientName)
);

@Global()
@Module({
  providers: [...providers],
  exports: [...providers],
})
export class DiscordClientsModule {}
