import { Module } from "@nestjs/common";
import { EventsManagerService } from "./events-manager.service";

@Module({
  providers: [EventsManagerService],
})
export class EventsManagerModule {}
