import { Global, Module } from "@nestjs/common";
import { HelperBot } from "./helper-bot.service";
import { ContentBot } from "./content-bot-service";
import { EventsBot } from "./events-bot.service";
import { NDB2Bot } from "./ndb2-bot.service";

@Global()
@Module({
  providers: [HelperBot, ContentBot, EventsBot, NDB2Bot],
  exports: [HelperBot, ContentBot, EventsBot, NDB2Bot],
})
export class DiscordClientsModule {}
