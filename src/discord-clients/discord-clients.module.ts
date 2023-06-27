import { Global, Module } from "@nestjs/common";
import { HelperBot } from "./helper-bot.service";
import { ConfigService } from "@nestjs/config";

const helperBotProvider = {
  provide: "HELPER_BOT",
  useFactory: async (configService: ConfigService) => {
    const helperBot = new HelperBot(configService);
    await new Promise((resolve, reject) => {
      helperBot.on("ready", () => {
        resolve(undefined);
      });

      helperBot.on("error", (err) => {
        reject(err);
      });
    });

    return helperBot;
  },
  inject: [ConfigService],
};

@Global()
@Module({
  providers: [helperBotProvider],
  exports: [helperBotProvider],
})
export class DiscordClientsModule {}
