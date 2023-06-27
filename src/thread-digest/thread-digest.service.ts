import { Injectable, Logger } from "@nestjs/common";
import { HelperBot } from "../helperbot/helperbot.service";
import { Cron } from "@nestjs/schedule";
import { ConfigService } from "@nestjs/config";
import { fillMessageCache, getGuild } from "src/helpers";
import {
  ChannelType,
  Collection,
  EmbedBuilder,
  Message,
  NewsChannel,
  Snowflake,
  TextChannel,
  ThreadChannel,
  channelMention,
  hyperlink,
  messageLink,
} from "discord.js";
import { sub } from "date-fns";
import { isFulfilled, isRejected } from "src/types/typeguards";
import { DiscordLoggerService } from "src/discord-logger/discord-logger.service";

type ThreadData = {
  thread: ThreadChannel;
  messageCount: number;
};

type ThreadDigest = {
  channel: TextChannel | NewsChannel;
  threads: ThreadData[];
};

type ThreadDigests = {
  [key: string]: ThreadDigest;
};

@Injectable()
export class ThreadDigestService {
  constructor(
    private client: HelperBot,
    private configService: ConfigService,
    private loggerService: DiscordLoggerService
  ) {
    this.loggerService.setContext(ThreadDigestService.name);
  }

  @Cron("*/5 * * * * *", {
    name: "threadDigest",
    timeZone: "America/New_York",
  })
  async sendThreadDigest() {
    const log = this.loggerService.new("Thread Digest Send");

    const guild = getGuild(
      this.client,
      this.configService.get<string>("guildId")
    );
    log.success(`Guild resolved: ${guild.name} (ID: ${guild.id})`);

    let activePublicThreads: Collection<Snowflake, ThreadChannel>;

    try {
      const activeThreads = await guild.channels.fetchActiveThreads();
      log.success(
        `${activeThreads.threads.size} active threads fetched from Discord.`
      );
      activePublicThreads = activeThreads.threads.filter(
        (thread) =>
          thread.type === ChannelType.PublicThread &&
          thread.parent.type === ChannelType.GuildText
      );
      log.info(
        `${activePublicThreads.size} active threads after filtering non-public threads and forum threads.`
      );
    } catch (err) {
      log.error("Failed to fetch active threads from Discord.", err);
      return log.send();
    }

    log.info("Fetching messages in time window to fill caches for counting.");
    const settledPromises = await Promise.allSettled(
      activePublicThreads.map((thread) => fillMessageCache(thread, 72))
    );

    const fetchedActivePublicThreads = settledPromises
      .filter(isFulfilled)
      .map((p) => p.value);

    if (fetchedActivePublicThreads.length === activePublicThreads.size) {
      log.success("All thread caches filled successfully.");
    } else {
      log.error(
        `Only successfully filled ${fetchedActivePublicThreads.length}/${activePublicThreads.size} thread caches.`
      );
      const errors = settledPromises.filter(isRejected).map((p) => p.reason);
      for (const error of errors) {
        this.loggerService.error(error);
      }
    }

    const threadData: ThreadData[] = fetchedActivePublicThreads.map(
      (thread) => {
        const messageCount = thread.messages.cache.filter(
          (cache) =>
            cache.createdTimestamp > sub(new Date(), { hours: 72 }).getTime()
        ).size;
        log.info(
          `Active Thread ${channelMention(
            thread.id
          )} prepped with ${messageCount} messages.`
        );

        return {
          thread,
          messageCount,
        };
      }
    );

    const filteredThreadData = threadData.filter(
      (data) => data.messageCount > 0
    );

    log.info(
      `${filteredThreadData.length} actually active threads after filtering out ones with 0 messages.`
    );

    const threadDigests: ThreadDigests = {};

    filteredThreadData.forEach((threadData) => {
      if (
        threadData.thread.parent.type !== ChannelType.GuildForum &&
        !threadDigests[threadData.thread.parentId]
      ) {
        threadDigests[threadData.thread.parentId] = {
          channel: threadData.thread.parent,
          threads: [],
        };
      }

      threadDigests[threadData.thread.parentId].threads.push(threadData);
    });

    const totalDigests = Object.keys(threadDigests).length;
    let sentDigests = 0;

    for (const parentId in threadDigests) {
      const currentDigest = threadDigests[parentId];
      log.info(
        `Prepping channel message for Channel ID ${channelMention(
          parentId
        )} with ${currentDigest.threads.length} active threads.`
      );

      const fields = currentDigest.threads.map((threadData) => {
        return {
          name: threadData.thread.name,
          value: `<#${threadData.thread.id}> has ${threadData.messageCount} messages.`,
        };
      });

      const embed = new EmbedBuilder({
        title: "Active Discord Threads",
        description:
          "Sometimes, threads are hard to notice on Discord. Here is your daily summary of the active conversations you might be missing in this channel!",
        fields,
      });

      let lastMessage: Message;

      try {
        const messages = await currentDigest.channel.messages.fetch({
          limit: 1,
        });
        if (messages.size === 0) {
          throw `Message collection size is zero for ${channelMention(
            currentDigest.channel.id
          )}`;
        }
        lastMessage = messages.first();
        log.success(
          `Fetched ${hyperlink(
            "last message",
            messageLink(currentDigest.channel.id, lastMessage.id)
          )} from ${channelMention(currentDigest.channel.id)}`
        );
      } catch (err) {
        log.error(
          `Couldn't fetch last message from channel ${channelMention(
            currentDigest.channel.id
          )}`,
          err
        );
      }

      if (
        lastMessage?.author.id === this.client.user.id &&
        lastMessage.embeds.length > 0 &&
        lastMessage.embeds[0]?.data?.title === "Active Discord Threads"
      ) {
        try {
          await lastMessage.edit({ embeds: [embed] });
          log.success(
            `Edited last message in ${channelMention(
              currentDigest.channel.id
            )}.`
          );
          sentDigests++;
        } catch (err) {
          log.error(
            `Error editing last message in ${channelMention(
              currentDigest.channel.id
            )}.`,
            err
          );
        }
      } else {
        try {
          await currentDigest.channel.send({ embeds: [embed] });
          log.success(
            `Sent digest to ${channelMention(currentDigest.channel.id)}`
          );
          sentDigests++;
        } catch (err) {
          log.error(
            `Failed to send digest to ${channelMention(
              currentDigest.channel.id
            )}`,
            err
          );
        }
      }
    }

    const allSuccessful = sentDigests === totalDigests;
    if (allSuccessful) {
      log.info(`${sentDigests} of ${totalDigests} successfully sent.`);
    } else {
      log.error(`${sentDigests} of ${totalDigests} successfully sent.`);
    }

    log.send();
  }
}
