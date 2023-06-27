import { Module } from "@nestjs/common";
import { ThreadDigestService } from "./thread-digest.service";
import { ConfigService } from "@nestjs/config";

@Module({
  providers: [ConfigService, ThreadDigestService],
})
export class ThreadDigestModule {}
