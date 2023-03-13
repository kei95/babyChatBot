import {
  Client,
  type MiddlewareConfig,
  type ClientConfig,
} from "@line/bot-sdk";

const config: ClientConfig = {
  channelAccessToken: process.env.ACCESS_TOKEN || "",
  channelSecret: process.env.SECRET,
};

export const middlewareConfig: MiddlewareConfig = {
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.SECRET || "",
};

export const client = new Client(config);
