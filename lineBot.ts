import { linebot as linebotInit } from "https://deno.land/x/linebot@v1.1.0/mod.ts";
import { json } from "https://deno.land/x/opine@2.3.3/mod.ts";

const config = {
  channelId: Deno.env.get("CLIENT_ID"),
  channelSecret: Deno.env.get("SECRET"),
  channelAccessToken: Deno.env.get("ACCESS_TOKEN"),
  verify: true,
};

export const lineBot = linebotInit(config);

export const linebotParser = lineBot.parser(json);
