import { add, sub } from "date-fns";
import {
  GuildScheduledEvent,
  GuildScheduledEventCreateOptions,
  GuildScheduledEventEditOptions,
  GuildScheduledEventEntityType,
  GuildScheduledEventPrivacyLevel,
  GuildScheduledEventStatus,
  TimestampStyles,
  time,
} from "discord.js";
import { RLLEntity } from "rocket-launch-live-client";
import { RocketBanner } from "src/sanity/sanity.service";

export const getLaunchDate = (launch: RLLEntity.Launch): Date | null => {
  if (launch.t0) {
    return new Date(launch.t0);
  }

  if (launch.win_open) {
    return new Date(launch.win_open);
  }

  return null;
};

// const generateDescription = (
//   launch: RLLEntity.Launch,
//   credit: string | null
// ): string => {
//   const launchDate = getLaunchDate(launch);

//   const infoString = `\n\nStream is set to begin 15 minutes before liftoff time of ${time(
//     launchDate,
//     TimestampStyles.LongDateTime
//   )}, ${time(launchDate, TimestampStyles.RelativeTime)}`;
//   const idString = `\n\nrllId=[${launch.id.toString()}]\n\nData provided by RocketLaunch.live`;
//   const creditString = credit ? `\n\nEvent banner courtesy of ${credit}` : "";
//   return launch.launch_description + infoString + idString + creditString;
// };

const getStreamUrl = (launch: RLLEntity.Launch): string => {
  const streamMedia = launch.media?.find(
    (media) => media.ldfeatured || media.featured
  );

  if (streamMedia?.youtube_vidid) {
    return `https://www.youtube.com/watch?v=${streamMedia.youtube_vidid}`;
  }

  if (streamMedia?.media_url) {
    return streamMedia.media_url;
  }

  return "Unavailable";
};

const generateScheduledStartTime = (winOpen: Date): Date =>
  sub(winOpen, { minutes: 15 });

// const generateScheduledEndTime = (
//   winOpen: Date,
//   winClose: string | null
// ): Date =>
//   winClose
//     ? add(new Date(winClose), { minutes: 15 })
//     : add(winOpen, { minutes: 60 });

// export const generateEventCreateOptionsFromLaunch = (
//   launch: RLLEntity.Launch,
//   banner: {
//     url: string;
//     credit: string;
//   } | null
// ): GuildScheduledEventCreateOptions => {
//   const launchDate = getLaunchDate(launch);

//   const options: GuildScheduledEventCreateOptions = {
//     name: launch.name,
//     scheduledStartTime: generateScheduledStartTime(launchDate),
//     scheduledEndTime: generateScheduledEndTime(launchDate, launch.win_close),
//     privacyLevel: GuildScheduledEventPrivacyLevel.GuildOnly,
//     entityType: GuildScheduledEventEntityType.External,
//     description: generateDescription(launch, banner ? banner.credit : null),
//     entityMetadata: { location: getStreamUrl(launch) },
//   };

//   if (banner) {
//     options.image = banner.url;
//   }

//   return options;
// };

type EditOptions = GuildScheduledEventEditOptions<
  GuildScheduledEventStatus.Scheduled,
  GuildScheduledEventStatus.Active
>;

export const generateEventEditOptionsFromLaunch = (
  event: GuildScheduledEvent,
  launch: RLLEntity.Launch,
  banner: RocketBanner | null
): null | EditOptions => {
  const newData: EditOptions = {};

  const url = getStreamUrl(launch);

  // Location
  if (event.entityMetadata?.location !== url) {
    newData.entityMetadata = { location: url };
  }

  // Topic
  if (event.name !== launch.name) {
    newData.name = launch.name;
  }

  //Banner Image
  if (banner && event.image !== banner.url) {
    newData.image = banner.url;
  }

  // Times
  const launchDate = getLaunchDate(launch);

  const timesDoNotMatch =
    add(event.scheduledStartAt, { minutes: 15 }).toISOString() !==
    launchDate.toISOString();

  if (timesDoNotMatch && !event.isActive()) {
    newData.scheduledStartTime = generateScheduledStartTime(launchDate);
    newData.scheduledEndTime = generateScheduledEndTime(
      launchDate,
      launch.win_close
    );
  }

  // If times or images changes, description must also change
  if (newData.scheduledStartTime || newData.image) {
    newData.description = generateDescription(
      launch,
      banner ? banner.credit : null
    );
  }

  return Object.keys(newData).length ? newData : null;
};
