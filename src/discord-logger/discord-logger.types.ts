export enum LogIcon {
  SUCCESS = "✅",
  FAILURE = "❌",
  INFO = "💬",
  WARNING = "⚠️",
}

export type Log = {
  icon: LogIcon;
  message: string;
  timestamp: Date;
};
