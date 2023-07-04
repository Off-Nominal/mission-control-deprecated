import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import configuration from "./config/configuration";
import { ScheduleModule } from "@nestjs/schedule";
import { DiscordClientsModule } from "./discord-clients/discord-clients.module";
import { DiscordLoggerModule } from "./discord-logger/discord-logger.module";
import { ThreadDigestModule } from "./thread-digest/thread-digest.module";
import { EventEmitterModule } from "@nestjs/event-emitter";
import { BootLogger } from "./boot-logger/boot-logger.service";

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
      isGlobal: true,
    }),
    ScheduleModule.forRoot(),
    EventEmitterModule.forRoot(),
    DiscordClientsModule,
    DiscordLoggerModule,
    ThreadDigestModule,
  ],
  providers: [BootLogger],
})
export class AppModule {}
