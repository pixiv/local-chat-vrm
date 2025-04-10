import { useCallback, useState } from "react";
import { Message } from "../messages/messages";

declare global {
  interface Window {
    ai: {
      languageModel: {
        capabilities: () => Promise<{
          available: "no" | "readily" | "after-download";
          defaultTemperature: number;
          defaultTopK: number;
          maxTemperature: number;
          maxTopK: number;
        }>;
        create: ({
          temperature,
          topK,
          systemPrompt,
        }?: {
          temperature?: number;
          topK?: number;
          systemPrompt?: string;
        }) => Promise<GeminiNanoSession>;
      };
    };
  }
}

export type GeminiNanoSession = {
  prompt: (prompt: string) => Promise<string>;
  promptStreaming: (
    prompt: string | ({ type: string; content: AudioBuffer } | string)[]
  ) => AsyncGenerator<string, void, undefined>;
};

export const useGeminiNanoChat = () => {
  const [session, setSession] = useState<GeminiNanoSession | null>(null);

  const load = useCallback(async (systemPrompt: string) => {
    if (
      (await window.ai.languageModel.capabilities()).available !== "readily"
    ) {
      throw Error("Gemini Nano is not ready");
    }

    const options = systemPrompt ? { systemPrompt } : {};
    setSession(await window.ai.languageModel.create(options));
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
