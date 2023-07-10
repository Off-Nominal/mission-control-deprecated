import { NewsChannel, TextChannel, ThreadChannel } from "discord.js";

export type ThreadData = {
  thread: ThreadChannel;
  messageCount: number;
};

export type ThreadDigest = {
  channel: TextChannel | NewsChannel;
  threads: ThreadData[];
};

export type ThreadDigests = {
  [key: string]: ThreadDigest;
};
