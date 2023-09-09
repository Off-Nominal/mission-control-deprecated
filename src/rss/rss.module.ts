import { Module } from "@nestjs/common";
import { NewsManagerService } from "./news-manager.service";
import { SanityModule } from "src/sanity/sanity.module";
import { ContentFeed } from "./rss.types";
import { generateContentFeedProvider } from "./rss.utility";

const contentFeedProviders = Object.values(ContentFeed).map((feed) =>
  generateContentFeedProvider(feed)
);

@Module({
  imports: [SanityModule],
  providers: [NewsManagerService, ...contentFeedProviders],
})
export class RSSModule {}
