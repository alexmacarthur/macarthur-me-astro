import { anthropic } from "@ai-sdk/anthropic";
import { APICallError, generateText } from "ai";

class AiService {
  async ask(prompt: string): Promise<string> {
    try {
      const { text } = await generateText({
        model: anthropic("claude-3-7-sonnet-20250219"),
        prompt,
      });

      return text;
    } catch (e) {
      const error = (e as any).errors[0] as APICallError;

      if (error.responseHeaders && error.responseHeaders["retry-after"]) {
        const secondsToWait = Number(error.responseHeaders["retry-after"]);
        console.log("Waiting to retry:", secondsToWait);

        await new Promise((r) =>
          // @ts-ignore
          setTimeout(r, secondsToWait * 1000),
        );

        return this.ask(prompt);
      } else {
        throw error;
      }
    }
  }
}

export default new AiService();
