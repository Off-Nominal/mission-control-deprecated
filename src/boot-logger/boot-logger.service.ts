import { Injectable } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import {
  DiscordLogger,
  DiscordLoggerService,
} from "src/discord-logger/discord-logger.service";
import { BootEvent } from "./boot-logger.event";

type BootLog = {
  // db: boolean;
  helperBot: boolean;
  contentBot: boolean;
  eventsBot: boolean;
  ndb2Bot: boolean;
  // starshipSiteChecker: boolean;
  // wmFeedListener: boolean;
  // mecoFeedListener: boolean;
  // ofnFeedListener: boolean;
  // rprFeedListener: boolean;
  // hlFeedListener: boolean;
  // hhFeedListener: boolean;
  // ytFeedListener: boolean;
  // eventsListener: boolean;
  // newsFeed: boolean;
  // rllClient: boolean;
  // controller: boolean;
};

const MAX_BOOT_ATTEMPTS = 15;

@Injectable()
export class BootLogger {
  private bootAttempts: number = 0;
  private bootLog: BootLog = {
    // db: false,
    helperBot: false,
    contentBot: false,
    eventsBot: false,
    ndb2Bot: false,
    // starshipSiteChecker: false,
    // wmFeedListener: false,
    // mecoFeedListener: false,
    // ofnFeedListener: false,
    // rprFeedListener: false,
    // hlFeedListener: false,
    // hhFeedListener: false,
    // ytFeedListener: false,
    // eventsListener: false,
    // newsFeed: false,
    // rllClient: false,
    // controller: false,
  };
  private log: DiscordLogger;

  constructor(private loggerService: DiscordLoggerService) {
    this.loggerService.setContext(BootLogger.name);

    this.log = this.loggerService.new("Boot Log");

    const interval = setInterval(() => {
      let booted = true;

      for (const item in this.bootLog) {
        if (!this.bootLog[item]) {
          booted = false;
          break;
        }
      }

      if (booted) {
        this.log.success(
          "Boot Checklist complete. The Off-Nominal Discord Bot is online."
        );
        this.log.send();
        clearInterval(interval);
      } else {
        this.bootAttempts++;
      }

      if (this.bootAttempts > MAX_BOOT_ATTEMPTS) {
        let failures = "";

        for (const item in this.bootLog) {
          if (!this.bootLog[item]) {
            failures += `- ❌: ${item}`;
          }
        }

        this.log.error(
          `Boot Checklist still incomplete after 15 attempts, logger aborted. Failed items:\n${failures}`
        );
        this.log.send();
        clearInterval(interval);
      }
    }, 1000);
  }

  @OnEvent("boot")
  logBootload(payload: BootEvent) {
    if (payload.status) {
      this.log.success(payload.message);
    } else {
      this.log.error(payload.message);
    }
    this.bootLog[payload.key] = payload.status;
  }
}
