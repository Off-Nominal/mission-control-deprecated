import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { SanityClient } from "@sanity/client";

const client = require("@sanity/client");
const imageUrlBuilder = require("@sanity/image-url");

@Injectable()
export class SanityService {
  public client: SanityClient;
  public imageBuilder: any;

  constructor(private configService: ConfigService) {
    this.client = client({
      projectId: this.configService.get<string>("sanity.cmsId"),
      dataset:
        this.configService.get<string>("sanity.dataset") ||
        this.configService.get<string>("node.env"),
      apiVersion: "2022-06-24",
      useCdn: this.configService.get<string>("sanity.cdn") || true,
    });

    this.imageBuilder = imageUrlBuilder(this.client);
  }
}
