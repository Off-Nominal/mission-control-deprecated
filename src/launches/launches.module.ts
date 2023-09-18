import { Module } from "@nestjs/common";
import { Launches } from "./launches.service";
import { SanityModule } from "src/sanity/sanity.module";
import { SanityService } from "src/sanity/sanity.service";

@Module({
  imports: [SanityModule],
  providers: [Launches, SanityService],
})
export class LaunchesModule {}
