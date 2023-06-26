import { Module } from "@nestjs/common";
import { ThreadDigestService } from "./threaddigest.service";
import { ConfigService } from "@nestjs/config";

@Module({
  imports: [],
  providers: [ConfigService, ThreadDigestService],
})
export class ThreadDigestModule {}
