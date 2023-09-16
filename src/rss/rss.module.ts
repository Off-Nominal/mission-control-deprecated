import { Module } from "@nestjs/common";
import { NewsManagerService } from "./news-manager.service";
import { SanityModule } from "src/sanity/sanity.module";
import { ContentFeed } from "./rss.types";
import { generateContentFeedProvider } from "./rss.utility";
import { BootLoggerService } from "src/boot-logger/boot-logger.service";

const contentFeedProviders = Object.values(ContentFeed).map((feed) =>
  generateContentFeedProvider(feed)
);

@Module({
  imports: [SanityModule],
  providers: [NewsManagerService, BootLoggerService],
})
export class RSSModule {}
