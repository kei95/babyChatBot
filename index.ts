import * as dotenv from "dotenv"; // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
dotenv.config();

import express, { Application, Request, Response } from "express";

import { openAI } from "./openAI";
import { client, middlewareConfig } from "./lineBot";
import {
  MessageAPIResponseBase,
  middleware,
  TextMessage,
  WebhookEvent,
} from "@line/bot-sdk";

const app: Application = express();

async function getChatGPTResponse(inputText: string) {
  const response: TextMessage = {
    type: "text",
    text: "あれれー、わかんない",
  };

  try {
    const completion = await openAI.createChatCompletion({
      model: "gpt-3.5-turbo",
      temperature: 0.6,
      messages: [
        // DO NOT touch this message - it changes baby's tone
        {
          role: "system",
          content: "タメ語で話して",
        },
        { role: "user", content: inputText },
      ],
    });
    const chatGPTResponse = completion.data.choices[0].message?.content;

    // update response text with chat GPT's response
    response.text = chatGPTResponse || "あれれー、わかんない";
  } catch (error) {
    console.log("error on chat GPT!", error);
  }

  return response;
}

const lintTextEventHandler = async (
  event: WebhookEvent
): Promise<MessageAPIResponseBase | undefined> => {
  // Process all variables here.
  if (event.type !== "message" || event.message.type !== "text") {
    return;
  }

  const { replyToken } = event;
  const { text } = event.message;

  // Check if given message is for this bot
  // when the message starts with "a  [text]" the bot should be activated
  const ACTIVATION_SUBSTRING = "a ";
  const trimmedText = text.trim().substring(0, 2);
  if (trimmedText !== ACTIVATION_SUBSTRING) return;

  const textWithoutActivationSubString = text.trim().slice(2);
  const chatGPTResponse = await getChatGPTResponse(
    textWithoutActivationSubString
  );

  await client.replyMessage(replyToken, chatGPTResponse);
};

app.get("/", async (_: Request, res: Response): Promise<Response> => {
  return res.status(200).json({
    status: "success",
    message: "Connected successfully!",
  });
});

app.post(
  "/",
  middleware(middlewareConfig),
  async (req: Request, res: Response): Promise<Response> => {
    const events: WebhookEvent[] = req.body.events;

    // Process all of the received events asynchronously.
    const results = await Promise.all(
      events.map(async (event: WebhookEvent) => {
        try {
          await lintTextEventHandler(event);
        } catch (err: unknown) {
          if (err instanceof Error) {
            console.error(err);
          }

          // Return an error message.
          return res.status(500).json({
            status: "error",
          });
        }
      })
    );

    // Return a successful message.
    return res.status(200).json({
      status: "success",
      results,
    });
  }
);

const PORT = parseInt(process.env.PORT || "") || 80;

app.listen(PORT, () => console.log(`LineBot is running. Port : ${PORT}`));
