const { createAppAuth } = require("@octokit/auth-app");
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import axios, { AxiosRequestConfig } from "axios";

const BASEURL = "https://api.github.com";
const OWNER = "Off-Nominal";
const REPO = "starship-site-tracking";
const BRANCH = process.env.STARSHIP_SITE_TRACKER_BRANCH;

const config: AxiosRequestConfig = {
  headers: {
    Accept: "application/vnd.github.v3+json",
  },
};
@Injectable()
export class GithubService {
  private token: string;
  private authConfig: AxiosRequestConfig;

  constructor(private configService: ConfigService) {}

  private async authenticate() {
    const auth = createAppAuth({
      appId: this.configService.get<string>("github.appId"),
      privateKey: this.configService.get<string>("github.privateKey"),
      clientId: this.configService.get<string>("github.clientId"),
      clientSecret: this.configService.get<string>("github.clientSecret"),
    });

    try {
      const { token } = await auth({
        type: "installation",
        installationId: this.configService.get<string>("github.botId"),
      });
      this.token = token;
      this.authConfig = {
        ...config,
        headers: { ...config.headers, Authorization: `Bearer ${this.token}` },
      };
    } catch (err) {
      throw err;
    }
  }

  public async initialize() {
    try {
      await this.authenticate();
    } catch (err) {
      throw err;
    }
  }

  public async getContents() {
    const url = `${BASEURL}/repos/${OWNER}/${REPO}/contents/?ref=${BRANCH}`;
    try {
      const { data } = await axios.get(url, config);
      return data;
    } catch (err) {
      throw err;
    }
  }

  public async updateFile(
    filename: string,
    sha: string,
    contents: string,
    etag: string
  ) {
    const url = `${BASEURL}/repos/${OWNER}/${REPO}/contents/${filename}`;

    try {
      const file = Buffer.from(contents).toString("base64");

      const body = {
        message: `update ${filename} - ETag ${etag}`,
        content: file,
        branch: BRANCH,
        sha,
      };

      const response = await axios.put(url, body, this.authConfig);

      return response;
    } catch (err) {
      throw err;
    }
  }
}
