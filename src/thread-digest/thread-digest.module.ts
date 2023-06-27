import { Module } from "@nestjs/common";
import { ThreadDigestService } from "./thread-digest.service";

@Module({
  providers: [ThreadDigestService],
})
export class ThreadDigestModule {}
