import { Module } from "@nestjs/common";
import { NotificationsService } from "./notifcations.service";

@Module({
  providers: [NotificationsService],
})
export class NotificationsModule {}
