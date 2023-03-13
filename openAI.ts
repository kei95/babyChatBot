import { Configuration, OpenAIApi } from "npm:openai";

const configuration = new Configuration({
  apiKey: Deno.env.get("OPEN_API_KEY"),
});

export const openAI = new OpenAIApi(configuration);
