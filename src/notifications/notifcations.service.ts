import { Injectable } from "@nestjs/common";
import { DiscordLoggerService } from "src/discord-logger/discord-logger.service";

@Injectable()
export class NotificationsService {
  constructor(private loggerService: DiscordLoggerService) {
    this.loggerService.setContext(NotificationsService.name);
  }
}
