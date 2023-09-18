import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { SanityClient } from "@sanity/client";
import { createClient } from "@sanity/client";
const imageUrlBuilder = require("@sanity/image-url");

export type RocketBanner = {
  url: string;
  credit: string;
};

@Injectable()
export class SanityService {
  public client: SanityClient;
  public imageBuilder: any;

  constructor(private configService: ConfigService) {
    this.client = createClient({
      projectId: this.configService.get<string>("sanity.cmsId"),
      dataset: this.configService.get<string>("sanity.dataset"),
      apiVersion: "2022-06-24",
      useCdn: this.configService.get<string>("sanity.cdn") === "true",
    });

    this.imageBuilder = imageUrlBuilder(this.client);
  }

  public fetchRocketBanner(id: number): Promise<RocketBanner | null> {
    const query = `*[_type == "rocketBanner" && id == "${id.toString()}"]{banner, credit}`;

    return this.client
      .fetch<{ banner: string; credit: string }[]>(query)
      .then(([response]) => {
        if (!response?.banner) {
          return null;
        }

        const bannerObj: RocketBanner = {
          url: this.imageBuilder.image(response.banner).url(),
          credit: response.credit,
        };

        return bannerObj;
      })
      .catch((err) => {
        console.error(err);

        return null;
      });
  }
}
