import { useCallback, useState } from "react";
import { Message } from "../messages/messages";

declare global {
  interface Window {
    LanguageModel: {
      availability: (
        props: {
          expectedInputs: { type: "image" | "audio" }[];
        } | void
      ) => Promise<"available" | "downloadable" | "unavailable">;
      create: ({
        expectedInputs,
        temperature,
        topK,
        initialPrompts,
      }?: {
        expectedInputs?: { type: "image" | "audio" }[];
        temperature?: number;
        topK?: number;
        initialPrompts?: {
          role: "system" | "user" | "assistant";
          content: string;
        }[];
      }) => Promise<GeminiNanoSession>;
    };
  }
}

export type GeminiNanoSession = {
  prompt: (
    prompt: string | ({ type: string; content: AudioBuffer | Blob } | string)[]
  ) => Promise<string>;
  promptStreaming: (
    prompt: string | ({ type: string; content: AudioBuffer } | string)[]
  ) => AsyncGenerator<string, void, undefined>;
};

export const useGeminiNanoChat = () => {
  const [session, setSession] = useState<GeminiNanoSession | null>(null);

  const load = useCallback(async (systemPrompt: string) => {
    if ((await window.LanguageModel.availability()) !== "available") {
      throw Error("Gemini Nano is not ready");
    }

    const options = systemPrompt
      ? {
          initialPrompts: [{ role: "system" as const, content: systemPrompt }],
        }
      : {};
    setSession(await window.LanguageModel.create(options));
  }, []);

  const getChatResponseStream = useCallback(
    async (messageLog: Message[]) => {
      if (session === null) {
        throw Error("Gemini Nano is not loaded");
      }

      const prompt = messageLog[messageLog.length - 1].content;
      const promptStreaming = session.promptStreaming(prompt);

      const stream = new ReadableStream({
        async start(controller: ReadableStreamDefaultController) {
          try {
            for await (const chunk of promptStreaming) {
              controller.enqueue(chunk);
            }
          } catch (error) {
            controller.error(error);
          } finally {
            controller.close();
          }
        },
      });

      return stream;
    },
    [session]
  );

  return { load, getChatResponseStream };
};
