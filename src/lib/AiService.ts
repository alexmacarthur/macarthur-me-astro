import { anthropic } from "@ai-sdk/anthropic";
import { generateText } from "ai";
import type { CustomPostOrPage } from "../types/types";

export const RELATED_POST_PROMPT = `You are my personal blog curator. I am going to give you the title, excerpt, and slug for a blog post. Given a list of all blog post information I will also provide, I want you to give me TWO blog posts that the reader is likely to also find interesting. 

The answer you give me must be a comma-separated list of slugs. 
`;

class AiService {
  async ask(prompt: string): Promise<string> {
    const { text } = await generateText({
      model: anthropic("claude-3-7-sonnet-20250219"),
      prompt,
    });

    return text;
  }
}

export default new AiService();
