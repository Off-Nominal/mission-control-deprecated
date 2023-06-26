import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import configuration from "./config/configuration";
import { ScheduleModule } from "@nestjs/schedule";
import { ThreadDigestModule } from "./threaddigest/threaddigest.module";
import { DiscordModule } from "./helperbot/discord.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
    }),
    ScheduleModule.forRoot(),
    DiscordModule,
    ThreadDigestModule,
  ],
  providers: [],
})
export class AppModule {}
