import { useCallback, useState } from "react";
import { Message } from "../messages/messages";
import { useGeminiNanoChat } from "./geminiNanoChat";
import { useOpenAiChat } from "./openAiChat";

export const CHAT_ENGINES = ["Gemini Nano", "OpenAI"] as const;

export type ChatEngine = (typeof CHAT_ENGINES)[number];

export const DEFAULT_CHAT_ENGINE: ChatEngine = "Gemini Nano";

export const useChat = () => {
  const {
    load: geminiNanoLoad,
    getChatResponseStream: geminiNanoGetChatResponseStream,
  } = useGeminiNanoChat();
  const {
    load: openAiLoad,
    getChatResponseStream: openAiGetChatResponseStream,
  } = useOpenAiChat();

  const load = useCallback(
    async (chatEngine: ChatEngine, systemPrompt: string) => {
      switch (chatEngine) {
        case "Gemini Nano":
          return await geminiNanoLoad(systemPrompt);
        case "OpenAI":
          return await openAiLoad(systemPrompt);
        default:
          throw Error("Selected chat engine is not supported");
      }
    },
    [geminiNanoLoad, openAiLoad]
  );

  const getChatResponseStream = useCallback(
    async (
      chatEngine: ChatEngine,
      messageLog: Message[],
      openAiApiKey: string
    ) => {
      switch (chatEngine) {
        case "Gemini Nano":
          return await geminiNanoGetChatResponseStream(messageLog);
        case "OpenAI":
          return await openAiGetChatResponseStream(messageLog, openAiApiKey);
        default:
          throw Error("Selected chat engine is not supported");
      }
    },
    [geminiNanoGetChatResponseStream, openAiGetChatResponseStream]
  );

  return { load, getChatResponseStream };
};
