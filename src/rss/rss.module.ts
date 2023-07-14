import { Module, Provider } from "@nestjs/common";
import { NewsManagerService } from "./news-manager.service";
import { SanityModule } from "src/sanity/sanity.module";
import { ContentFeed, ContentFeedItem } from "./rss.types";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { ContentListener } from "./content-listener/content-listener.service";
import { SchedulerRegistry } from "@nestjs/schedule";
import { ConfigService } from "@nestjs/config";
import Fuse from "fuse.js";
import { simpleCastFeedMapper } from "./rss.utility";
import { BootLoggerModule } from "src/boot-logger/boot-logger.module";

const defaultSearchOptions: Fuse.IFuseOptions<ContentFeedItem> = {
  distance: 350,
  threshold: 0.7,
  includeScore: true,
  keys: [
    { name: "title", weight: 2 },
    { name: "description", weight: 3 },
  ],
};

const WemartiansRssService: Provider = {
  provide: ContentFeed.WEMARTIANS,
  useFactory: (
    eventEmitter: EventEmitter2,
    schedulerRegistry: SchedulerRegistry,
    config: ConfigService
  ) => {
    return new ContentListener(
      eventEmitter,
      schedulerRegistry,
      config.get<string>("rssFeeds.wemartians"),
      {
        searchOptions: defaultSearchOptions,
        token: ContentFeed.WEMARTIANS,
        processor: simpleCastFeedMapper,
      }
    );
  },
  inject: [EventEmitter2, SchedulerRegistry, ConfigService],
};

@Module({
  imports: [SanityModule],
  providers: [SchedulerRegistry, NewsManagerService, WemartiansRssService],
})
export class RSSModule {}
