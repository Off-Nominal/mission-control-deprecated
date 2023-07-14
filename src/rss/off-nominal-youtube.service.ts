import { Injectable } from "@nestjs/common";
import { FeedWatcher } from "./feed-watcher/feed-watcher.utility";
import { ConfigService } from "@nestjs/config";
import { EventEmitter2 } from "@nestjs/event-emitter";

@Injectable()
export class OffNominalYoutubeService extends FeedWatcher {
  private configService: ConfigService;

  constructor(
    configService: ConfigService,
    private eventEmitter: EventEmitter2
  ) {
    super(configService.get<string>("rsFeeds.offnominal_youtube"));
    this.configService = configService;
  }
}
