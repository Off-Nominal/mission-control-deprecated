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
import { User } from "./users/users.entity";
import { UsersModule } from "./users/users.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
      isGlobal: true,
    }),
    UsersModule,
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: "postgres",
        url: configService.get<string>("database.url"),
        entities: [User],
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
