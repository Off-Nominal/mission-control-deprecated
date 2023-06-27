import { Global, Module } from "@nestjs/common";
import { HelperBot } from "./helperbot.service";
import { ConfigService } from "@nestjs/config";

@Global()
@Module({
  providers: [ConfigService, HelperBot],
  exports: [HelperBot],
})
export class DiscordModule {}
