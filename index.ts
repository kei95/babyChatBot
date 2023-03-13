import { opine } from "https://deno.land/x/opine@2.3.3/mod.ts";
import { bold, cyan } from "https://deno.land/std@0.179.0/fmt/colors.ts";

import { openAI } from "./openAI.ts";
import { lineBot, linebotParser } from "./lineBot.ts";

type MessageEvent = {
  message: {
    text: string;
  };
  reply: (text: string) => Promise<Record<string, unknown>>;
};

const app = opine();

app.post(`/`, linebotParser);

lineBot.on("message", async (event: MessageEvent) => {
  try {
    const completion = await openAI.createChatCompletion({
      model: "gpt-3.5-turbo",
      temperature: 0.6,
      messages: [
        {
          role: "system",
          content: "武士風に話してください",
        },
        { role: "user", content: event.message.text },
      ],
    });

    const chatGPTResponse = completion.data.choices[0].message?.content;
    const responseResult = await event.reply(
      chatGPTResponse || "あれれー、わかんない"
    );

    console.log("Success", responseResult);
  } catch (error) {
    console.log("Error", error);
    await event.reply("あれれー、わかんない");
  }
});

const PORT = parseInt(Deno.env.get("PORT") || "") || 80;

app.listen(PORT, () =>
  console.log(bold(cyan(`LineBot is running. Port : ${PORT}`)))
);
