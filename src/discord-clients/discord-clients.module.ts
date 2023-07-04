import { Global, Module } from "@nestjs/common";
import { HelperBot } from "./helper-bot.service";

@Global()
@Module({
  providers: [HelperBot],
  exports: [HelperBot],
})
export class DiscordClientsModule {}
