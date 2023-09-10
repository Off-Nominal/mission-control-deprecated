import { Module } from "@nestjs/common";
import { NotificationsService } from "./notifcations.service";
import { UsersService } from "src/users/users.service";
import { UsersModule } from "src/users/users.module";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "discord.js";
import { DataSource } from "typeorm";

@Module({
  imports: [UsersModule],
  providers: [NotificationsService, UsersService],
})
export class NotificationsModule {}
