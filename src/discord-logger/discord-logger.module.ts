import { Global, Module } from "@nestjs/common";
import { DiscordLoggerService } from "./discord-logger.service";
import { ConfigService } from "@nestjs/config";

@Global()
@Module({
  providers: [ConfigService, DiscordLoggerService],
  exports: [DiscordLoggerService],
})
export class DiscordLoggerModule {}
