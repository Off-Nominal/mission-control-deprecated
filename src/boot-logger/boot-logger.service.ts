import { Injectable } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import {
  DiscordLogger,
  DiscordLoggerService,
} from "src/discord-logger/discord-logger.service";
import { BootEvent } from "./boot-logger.types";
import { ContentFeed } from "src/rss/rss.types";
import { Cron, SchedulerRegistry } from "@nestjs/schedule";
import { ConfigService } from "@nestjs/config";

type BootLog = {
  // db: boolean;
  helperBot: boolean;
  contentBot: boolean;
  eventsBot: boolean;
  ndb2Bot: boolean;
  eventsManager: boolean;
  // starshipSiteChecker: boolean;
  [ContentFeed.WEMARTIANS]: boolean;
  // mecoFeedListener: boolean;
  // ofnFeedListener: boolean;
  // rprFeedListener: boolean;
  // hlFeedListener: boolean;
  // hhFeedListener: boolean;
  // ytFeedListener: boolean;
  // eventsListener: boolean;
  newsManager: boolean;
  // rllClient: boolean;
  // controller: boolean;
};

@Injectable()
export class BootLoggerService {
  private bootAttempts: number = 0;
  private booted = false;
  private bootLog: BootLog = {
    // db: false,
    helperBot: false,
    contentBot: false,
    eventsBot: false,
    ndb2Bot: false,
    eventsManager: false,
    // starshipSiteChecker: false,
    [ContentFeed.WEMARTIANS]: false,
    // mecoFeedListener: false,
    // ofnFeedListener: false,
    // rprFeedListener: false,
    // hlFeedListener: false,
    // hhFeedListener: false,
    // ytFeedListener: false,
    // eventsListener: false,
    newsManager: false,
    // rllClient: false,
    // controller: false,
  };
  private log: DiscordLogger;

  constructor(
    private loggerService: DiscordLoggerService,
    private scheduleRegistry: SchedulerRegistry,
    private configService: ConfigService
  ) {
    this.loggerService.setContext(BootLoggerService.name);
    this.log = this.loggerService.new("Boot Log");
  }

  @Cron("* * * * * *", {
    name: "bootLog",
  })
  public checkBoot() {
    this.bootAttempts++;

    if (
      this.bootAttempts >=
      this.configService.get<number>("general.bootAttempts")
    ) {
      let failures = "";

      for (const item in this.bootLog) {
        if (!this.bootLog[item]) {
          failures += `- ❌: ${item}`;
        }
      }

      this.log.error(
        `Boot Checklist still incomplete after ${this.configService.get<number>(
          "general.bootAttempts"
        )} attempts, logger aborted. Failed items:\n${failures}`
      );
      this.log.send();
      this.scheduleRegistry.deleteCronJob("bootLog");
    }

    for (const item in this.bootLog) {
      if (!this.bootLog[item]) {
        return;
      }
    }

    this.log.success(
      "Boot Checklist complete. The Off-Nominal Discord Bot is online."
    );
    this.log.send();
    this.scheduleRegistry.deleteCronJob("bootLog");
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
