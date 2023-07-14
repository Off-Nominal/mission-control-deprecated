import { Global, Module } from "@nestjs/common";
import { BootLoggerService } from "./boot-logger.service";

@Global()
@Module({
  providers: [BootLoggerService],
  exports: [BootLoggerService],
})
export class BootLoggerModule {}
