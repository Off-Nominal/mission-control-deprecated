import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import configuration from "./config/configuration";
import { ScheduleModule } from "@nestjs/schedule";
import { DiscordModule } from "./helperbot/discord.module";
import { DiscordLoggerModule } from "./discord-logger/discord-logger.module";
import { ThreadDigestModule } from "./thread-digest/thread-digest.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
    }),
    ScheduleModule.forRoot(),
    DiscordModule,
    DiscordLoggerModule,
    ThreadDigestModule,
  ],
  providers: [],
})
export class AppModule {}
