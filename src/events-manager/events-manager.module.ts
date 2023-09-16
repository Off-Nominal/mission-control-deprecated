import { Module } from "@nestjs/common";
import { EventsManagerService } from "./events-manager.service";
import { NotificationsService } from "src/notifications/notifcations.service";
import { UsersService } from "src/users/users.service";
import { UsersModule } from "src/users/users.module";

@Module({
  imports: [UsersModule],
  providers: [EventsManagerService, NotificationsService, UsersService],
})
export class EventsManagerModule {}
