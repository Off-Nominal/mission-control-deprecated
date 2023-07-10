import { Module } from "@nestjs/common";
import { StreamHostService } from "./stream-host.service";

@Module({
  providers: [StreamHostService],
})
export class StreamHostModule {}
