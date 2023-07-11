import { Module } from "@nestjs/common";
import { NewsManagerService } from "./news-manager.service";
import { SanityModule } from "src/sanity/sanity.module";

@Module({
  imports: [SanityModule],
  providers: [NewsManagerService],
})
export class RSSModule {}
