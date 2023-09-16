import { Module } from "@nestjs/common";
import { NotificationsService } from "./notifcations.service";
import { UsersService } from "src/users/users.service";
import { UsersModule } from "src/users/users.module";

@Module({
  imports: [UsersModule],
  providers: [NotificationsService, UsersService],
  exports: [UsersModule],
})
export class NotificationsModule {}
