import { Inject, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Cron, CronExpression } from "@nestjs/schedule";
import { isBefore } from "date-fns";
import {
  Collection,
  GuildScheduledEvent,
  GuildScheduledEventStatus,
} from "discord.js";
import { RLLClient, RLLEntity, rllc } from "rocket-launch-live-client";
import {
  DiscordClient,
  ExtendedClient,
} from "src/discord-clients/discord-clients.types";
import {
  generateEventEditOptionsFromLaunch,
  getLaunchDate,
} from "./launches.utility";
import { RocketBanner, SanityService } from "src/sanity/sanity.service";
import { DiscordLoggerService } from "src/discord-logger/discord-logger.service";
import { handleError } from "src/helpers/handleError";
import { isRejected } from "src/types/typeguards";

@Injectable()
export class Launches {
  private client: RLLClient;
  private watcher: RLLWatcher;

  constructor(
    @Inject(DiscordClient.EVENTS)
    private eventsClient: ExtendedClient,
    private sanityService: SanityService,
    private configService: ConfigService,
    private loggerService: DiscordLoggerService
  ) {
    this.loggerService.setContext(Launches.name);

    const rll_key = this.configService.get("apiKeys.rll");
    try {
      this.client = rllc(rll_key);
    } catch (err) {
      throw err;
    }
  }

  private getUpcomingLaunches() {
    const now = new Date();
    return this.client.launches({
      after_date: now,
    });
  }

  @Cron(CronExpression.EVERY_MINUTE)
  private async syncLaunches() {
    const logger = this.loggerService.new("Fetch Launches & Events");
    const getEvents = this.eventsClient.guild.scheduledEvents.fetch();
    const getUpcomingLaunches = this.getUpcomingLaunches();

    try {
      const [events, launchesResponse] = await Promise.all([
        getEvents,
        getUpcomingLaunches,
      ]);
      const launches = launchesResponse.result;

      // Update existing Events
      this.updateEvents(events, launches);
    } catch (err) {
      const [error] = handleError(err);
      logger.error(error);
      logger.send();
    }
  }

  // update existing events with new information
  private updateEvents(
    events: Collection<string, GuildScheduledEvent<GuildScheduledEventStatus>>,
    launches: RLLEntity.Launch[]
  ): void {
    const logger = this.loggerService.new("Sync Launches");

    const promises: Promise<GuildScheduledEvent<GuildScheduledEventStatus>>[] =
      [];

    events.forEach((event) => {
      // ignore non-upcoming events
      if (event.status !== GuildScheduledEventStatus.Scheduled) {
        return;
      }

      // ignore events that aren't launches
      const rllIDs = event.description?.match(
        new RegExp(/(?<=\[)(.*?)(?=\])/gm)
      );
      if (!rllIDs?.length) {
        return;
      }

      const rllId = parseInt(rllIDs[0]);

      // delete events that aren't in the upcoming launches
      const launch = launches.find((l) => l.id === rllId);
      if (!launch) {
        promises.push(
          event.delete().catch((err) => {
            const [error] = handleError(err);
            throw error;
          })
        );
      } else {
        promises.push(this.syncEvent(event, launch));
      }
    });

    Promise.allSettled(promises).then((results) => {
      const errors = results.filter(isRejected);
      if (errors.length) {
        for (const error of errors) {
          logger.error(error.reason);
        }
        logger.send();
      }
    });
  }

  private async syncEvent(
    event: GuildScheduledEvent,
    launch: RLLEntity.Launch
  ): Promise<GuildScheduledEvent<GuildScheduledEventStatus>> {
    // Launches that no longer have a launch date are removed
    const now = new Date();
    const launchDate = getLaunchDate(launch);
    if (!launchDate || isBefore(launchDate, now)) {
      return event.delete();
    }

    let rocketBanner: RocketBanner | null = null;

    try {
      rocketBanner = await this.sanityService.fetchRocketBanner(
        launch.vehicle.id
      );
    } catch (err) {
      console.error(err);
    }

    const eventEditOptions = generateEventEditOptionsFromLaunch(
      event,
      launch,
      rocketBanner
    );

    const result = eventEditOptions
      ? event.edit(eventEditOptions)
      : Promise.resolve(event);

    return result.catch((err) => {
      const [error] = handleError(err);
      throw error;
    });
  }

  // remove existing events that are unscheduled or done

  // create new events for launches that are not already scheduled
}
