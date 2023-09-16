import {
  Inject,
  Injectable,
  OnApplicationBootstrap,
  OnModuleInit,
  forwardRef,
} from "@nestjs/common";
import { EventEmitter2, OnEvent } from "@nestjs/event-emitter";
import {
  DiscordLogger,
  DiscordLoggerService,
} from "src/discord-logger/discord-logger.service";
import { BootEvent } from "./boot-logger.types";
import { ContentFeed } from "src/rss/rss.types";
import { Cron, SchedulerRegistry } from "@nestjs/schedule";
import { ConfigService } from "@nestjs/config";
import {
  DiscordClient,
  ExtendedClient,
} from "src/discord-clients/discord-clients.types";

type BootLog = {
  // db: boolean;
  [DiscordClient.HELPER]: boolean;
  [DiscordClient.CONTENT]: boolean;
  [DiscordClient.EVENTS]: boolean;
  [DiscordClient.NDB2]: boolean;
  // starshipSiteChecker: boolean;
  // [ContentFeed.WEMARTIANS]: boolean;
  // [ContentFeed.RPR]: boolean;
  // [ContentFeed.MECO]: boolean;
  // [ContentFeed.HEADLINES]: boolean;
  // [ContentFeed.OFFNOMINAL_PODCAST]: boolean;
  // [ContentFeed.OFFNOMINAL_HAPPY_HOUR]: boolean;
  // [ContentFeed.OFFNOMINAL_YT]: boolean;
  // eventsListener: boolean;
  newsManager: boolean;
  // rllClient: boolean;
  // controller: boolean;
};

@Injectable()
export class BootLoggerService {
  private bootAttempts: number = 0;
  private bootLog: BootLog = {
    // db: false,
    [DiscordClient.HELPER]: true, // critical dependency
    [DiscordClient.CONTENT]: true,
    [DiscordClient.EVENTS]: true,
    [DiscordClient.NDB2]: true,
    // starshipSiteChecker: false,
    // [ContentFeed.WEMARTIANS]: false,
    // [ContentFeed.RPR]: false,
    // [ContentFeed.MECO]: false,
    // [ContentFeed.HEADLINES]: false,
    // [ContentFeed.OFFNOMINAL_PODCAST]: false,
    // [ContentFeed.OFFNOMINAL_HAPPY_HOUR]: false,
    // [ContentFeed.OFFNOMINAL_YT]: false,
    // eventsListener: false,
    newsManager: false,
    // rllClient: false,
    // controller: false,
  };
  private log: DiscordLogger;

  constructor(
    private loggerService: DiscordLoggerService,
    private scheduleRegistry: SchedulerRegistry,
    private configService: ConfigService,
    @Inject(DiscordClient.HELPER)
    private helperBot: ExtendedClient,
    @Inject(DiscordClient.CONTENT)
    private contentBot: ExtendedClient,
    @Inject(DiscordClient.EVENTS)
    private eventsBot: ExtendedClient,
    @Inject(DiscordClient.NDB2)
    private ndb2Bot: ExtendedClient
  ) {
    this.loggerService.setContext(BootLoggerService.name);
    this.log = this.loggerService.new("Boot Log");

    if (helperBot.isReady()) {
      this.log.success("HELPER_BOT online.");
    } else {
      this.log.error("HELPER_BOT failed to start.");
    }
    if (contentBot.isReady()) {
      this.log.success("CONTENT_BOT online.");
    } else {
      this.log.error("CONTENT_BOT failed to start.");
    }
    if (eventsBot.isReady()) {
      this.log.success("EVENTS_BOT online.");
    } else {
      this.log.error("EVENTS_BOT failed to start.");
    }
    if (ndb2Bot.isReady()) {
      this.log.success("NDB2_BOT online.");
    } else {
      this.log.error("NDB2_BOT failed to start.");
    }
  }

  @Cron("* * * * * *", {
    name: "bootLog",
  })
  public checkBoot() {
    this.bootAttempts++;
    const maxCheckAttempts = this.configService.get<number>(
      "general.bootAttempts"
    );

    if (this.bootAttempts >= maxCheckAttempts) {
      let failures = "";

      for (const item in this.bootLog) {
        if (!this.bootLog[item]) {
          failures += `- ❌ ${item}\n`;
        }
      }

      this.log.error(
        `Boot Checklist still incomplete after ${maxCheckAttempts} attempts, logger aborted. Failed items:\n${failures}`
      );
      this.log.send();
      this.scheduleRegistry.deleteCronJob("bootLog");
    }

    for (const item in this.bootLog) {
      if (!this.bootLog[item]) {
        return;
      }
    }

    this.log.success("Boot checklist complete. Mission Control is online.");
    this.log.send();
    this.scheduleRegistry.deleteCronJob("bootLog");
  }

  @OnEvent("boot")
  logBootEvent(payload: BootEvent) {
    if (payload.status) {
      this.log.success(payload.message);
    } else {
      this.log.error(payload.message);
    }
    this.bootLog[payload.key] = payload.status;
  }
}
