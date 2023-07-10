import { Module } from "@nestjs/common";
import { NewsManagerService } from "./news-manager.service";

@Module({
  providers: [NewsManagerService],
})
export class RSSModule {}
