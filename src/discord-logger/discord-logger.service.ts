import { ConsoleLogger, Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {
  ChannelType,
  Client,
  EmbedBuilder,
  TimestampStyles,
  time,
} from "discord.js";
import { HelperBot } from "src/discord-clients/helperbot.service";

export enum LogIcon {
  SUCCESS = "✅",
  FAILURE = "❌",
  INFO = "💬",
  WARNING = "⚠️",
}

type Log = {
  icon: LogIcon;
  message: string;
  timestamp: Date;
};

class DiscordLogger {
  constructor(
    private client: Client,
    private module: string,
    private method: string,
    private channel: string,
    private end: () => void,
    private baseError: (message: any, stack?: string, context?: string) => void,
    private logs: Log[] = [],
    private date: Date = new Date()
  ) {}

  public success(message: string) {
    this.logs.push({
      icon: LogIcon.SUCCESS,
      timestamp: new Date(),
      message,
    });
  }

  public info(message: string) {
    this.logs.push({
      icon: LogIcon.INFO,
      timestamp: new Date(),
      message,
    });
  }

  public error(message: string, err?: any) {
    this.logs.push({
      icon: LogIcon.FAILURE,
      timestamp: new Date(),
      message,
    });
    if (err) {
      this.baseError(err, this.module);
    }
  }

  public warning(message: string) {
    this.logs.push({
      icon: LogIcon.WARNING,
      timestamp: new Date(),
      message,
    });
  }

  private generateEmbed(): EmbedBuilder {
    const embed = new EmbedBuilder({
      title: this.method + `: ${time(this.date, TimestampStyles.LongDate)}`,
      description: `Module: [${this.module}]`,
      fields: this.logs.map((l) => ({
        name: "\u200B",
        value: `${l.icon} ${time(l.timestamp, TimestampStyles.LongTime)}: ${
          l.message
        }`,
      })),
    });

    return embed;
  }

  async send() {
    const embed = this.generateEmbed();
    const channel = await this.client.channels.fetch(this.channel);

    if (channel.type === ChannelType.GuildText) {
      await channel.send({ embeds: [embed] });
      this.end();
    } else {
      throw new Error("Tried to send log to non-text based channel.");
    }
  }
}

@Injectable()
export class DiscordLoggerService extends ConsoleLogger {
  private logs: Record<string, DiscordLogger> = {};

  constructor(private client: HelperBot, private config: ConfigService) {
    super();
  }

  new(method: string) {
    const id = Math.random().toString(16).slice(2, 8);

    this.logs[id] = new DiscordLogger(
      this.client,
      this.context,
      method,
      this.config.get<string>("guildChannels.bots"),
      () => this.end(id),
      this.error.bind(this)
    );
    return this.logs[id];
  }

  end(id: string) {
    delete this.logs[id];
  }
}
