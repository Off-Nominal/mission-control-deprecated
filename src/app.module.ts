import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import configuration from "./config/configuration";
import { ScheduleModule } from "@nestjs/schedule";
import { DiscordClientsModule } from "./discord-clients/discord-clients.module";
import { DiscordLoggerModule } from "./discord-logger/discord-logger.module";
import { ThreadDigestModule } from "./thread-digest/thread-digest.module";
import { EventEmitterModule } from "@nestjs/event-emitter";
import { BootLogger } from "./boot-logger/boot-logger.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UsersModule } from "./users/users.module";
import { Ndb2MessageSubscriptionModule } from "./ndb2-message-subscriptions/ndb2-message-subscriptions.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
      isGlobal: true,
    }),
    UsersModule,
    Ndb2MessageSubscriptionModule,
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: "postgres",
        url: configService.get<string>("database.url"),
        autoLoadEntities: true,
        // synchronize: true,
      }),
      inject: [ConfigService],
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
