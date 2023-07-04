import { Global, Module } from "@nestjs/common";
import { BootLogger } from "./boot-logger.service";

@Global()
@Module({
  providers: [BootLogger],
  exports: [BootLogger],
})
export class DiscordClientsModule {}
