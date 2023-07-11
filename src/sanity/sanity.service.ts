import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { SanityClient } from "@sanity/client";
import { createClient } from "@sanity/client";
const imageUrlBuilder = require("@sanity/image-url");

@Injectable()
export class SanityService {
  public client: SanityClient;
  public imageBuilder: any;

  constructor(private configService: ConfigService) {
    console.log(this.configService.get<string>("sanity.dataset"));
    this.client = createClient({
      projectId: this.configService.get<string>("sanity.cmsId"),
      dataset: this.configService.get<string>("sanity.dataset"),
      apiVersion: "2022-06-24",
      useCdn: this.configService.get<string>("sanity.cdn") === "true",
    });

    this.imageBuilder = imageUrlBuilder(this.client);
  }
}
