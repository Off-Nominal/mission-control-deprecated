// import { GuildScheduledEvent, GuildScheduledEventStatus } from "discord.js";
// import { FeedWatcherEvents } from "../feed-watcher/feed-watcher.types";
import Fuse from "fuse.js";
import { ContentListenerOptions } from "./content-listener.types";
// import { FeedWatcher } from "../feed-watcher/feed-watcher.utility";
import { SchedulerRegistry } from "@nestjs/schedule";
import { ContentFeedItem } from "../rss.types";
import { FeedWatcher } from "../feed-watcher/feed-watcher.utility";
import { FeedParserEntry } from "../feed-watcher/feed-watcher.types";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { handleError } from "src/helpers/handleError";

export class ContentListener {
  private watcher: FeedWatcher;
  private episodes: ContentFeedItem[];
  private title: string;
  private token: string;
  private albumArt: string;
  private fuse: Fuse<ContentFeedItem>;
  private searchOptions: Fuse.IFuseOptions<ContentFeedItem> | null;
  private processor: (item: any, showTitle: string) => ContentFeedItem;

  constructor(
    private eventEmitter: EventEmitter2,
    schedulerRegistry: SchedulerRegistry,
    feedUrl: string,
    options?: ContentListenerOptions
  ) {
    this.processor = options.processor || ((item, showTitle: string) => item);
    this.searchOptions = options.searchOptions || null;
    // this.verifyEvent = this.verifyEvent.bind(this);
    this.watcher = new FeedWatcher(schedulerRegistry, feedUrl);
    this.token = options.token;

    this.watcher.on("ready", (entries) => {
      this.handleReady(entries);
    });

    this.watcher.on("init_error", (err) => {
      const [error] = handleError(err);
      this.eventEmitter.emit("boot", {
        key: `contentListener-${this.token}`,
        status: false,
        message: error,
      });
    });

    this.watcher.start();
  }

  private handleReady(entries: FeedParserEntry[]) {
    this.title = entries[0].meta.title; // extract Feed program title
    this.albumArt = entries[0].meta.image.url; // extract Feed program album art
    this.episodes = entries
      .map((entry) => this.processor(entry, this.title))
      .reverse(); // map entries from RSS feed to episode format using processor
    this.fuse = new Fuse(this.episodes, this.searchOptions);

    this.eventEmitter.emit("boot", {
      key: `contentListener-${this.token}`,
      status: true,
      message: `${this.title} feed loaded with ${this.episodes.length} items.`,
    });
  }

  //   private listen() {
  //     this.on(FeedWatcherEvents.NEW, (entries) => {
  //       entries.forEach((episode) => {
  //         const mappedEpisode = this.processor(episode, this.title);
  //         this.episodes.push(mappedEpisode);
  //         this.emit(ContentListnerEvents.NEW, mappedEpisode);
  //       });
  //     });
  //   }

  //   public fetchRecent() {
  //     return this.episodes[this.episodes.length - 1];
  //   }

  //   public search(term: string) {
  //     return this.fuse.search(term);
  //   }

  //   public getEpisodeByNumber(ep: number) {
  //     return this.episodes.find((episode) => {
  //       const epString = episode.title.split(" ")[0].replace(/\D/g, "");
  //       return Number(epString) === ep;
  //     });
  //   }

  //   public getEpisodeByUrl(url: string) {
  //     return this.episodes.find((episode) => episode.url === url);
  //   }

  //   public verifyEvent(
  //     event: GuildScheduledEvent<
  //       GuildScheduledEventStatus.Active | GuildScheduledEventStatus.Completed
  //     >
  //   ) {
  //     const stream = this.episodes.find(
  //       (episode) => episode.url === event.entityMetadata?.location
  //     );

  //     if (!stream) {
  //       return;
  //     }

  //     if (event.status === GuildScheduledEventStatus.Completed) {
  //       this.emit(ContentListnerEvents.STREAM_END, event);
  //     }
  //     if (event.status === GuildScheduledEventStatus.Active) {
  //       this.emit(ContentListnerEvents.STREAM_START, event);
  //     }
  //   }
}
