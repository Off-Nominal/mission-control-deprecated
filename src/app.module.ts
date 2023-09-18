import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import configuration from "./config/configuration";
import { ScheduleModule } from "@nestjs/schedule";
import { DiscordClientsModule } from "./discord-clients/discord-clients.module";
import { DiscordLoggerModule } from "./discord-logger/discord-logger.module";
import { ThreadDigestModule } from "./thread-digest/thread-digest.module";
import { EventEmitterModule } from "@nestjs/event-emitter";
import { BootLoggerService } from "./boot-logger/boot-logger.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UsersModule } from "./users/users.module";
import { Ndb2MessageSubscriptionModule } from "./ndb2-message-subscriptions/ndb2-message-subscriptions.module";
import { EventsManagerModule } from "./events-manager/events-manager.module";
import { NotificationsModule } from "./notifications/notifications.module";
import { RSSModule } from "./rss/rss.module";
import * as Joi from "joi";
import { User } from "./users/users.entity";
import { LaunchesModule } from './launches/launches.module';

@Module({
  imports: [
    // Config and 1st Party
    ConfigModule.forRoot({
      load: [configuration],
      isGlobal: true,
      validationSchema: Joi.object({
        NODE_ENV: Joi.string()
          .valid("development", "production", "test")
          .default("development"),
      }),
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: "postgres",
        url: configService.get<string>("database.url"),
        entities: [User],
        synchronize: false,
      }),
      inject: [ConfigService],
    }),
    ScheduleModule.forRoot(),
    EventEmitterModule.forRoot(),

    // Database Modules
    UsersModule,
    Ndb2MessageSubscriptionModule,

    // Application Modules
    DiscordClientsModule,
    DiscordLoggerModule,
    NotificationsModule,
    ThreadDigestModule,
    EventsManagerModule,
    RSSModule,
    LaunchesModule,
  ],
  providers: [BootLoggerService],
})
export class AppModule {}
