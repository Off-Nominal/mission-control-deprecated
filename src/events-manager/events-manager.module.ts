import { Module } from "@nestjs/common";
import { EventsManagerService } from "./events-manager.service";
import { NotificationsService } from "src/notifications/notifcations.service";

@Module({
  providers: [EventsManagerService, NotificationsService],
})
export class EventsManagerModule {}
