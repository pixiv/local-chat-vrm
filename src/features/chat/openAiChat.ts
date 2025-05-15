import OpenAI from "openai";
import { Message } from "../messages/messages";
import { useCallback, useState } from "react";

export const useOpenAiChat = () => {
  const [systemPrompt, setSystemPrompt] = useState<string>("");

  const load = useCallback(async (systemPrompt: string) => {
    setSystemPrompt(systemPrompt);
  }, []);

  const getChatResponse = useCallback(
    async (messageLog: Message[], apiKey: string) => {
      if (!apiKey) {
        throw new Error("Invalid API Key");
      }

      const messages: Message[] = [
        {
          role: "system",
          content: systemPrompt,
        },
        ...messageLog,
      ];

      const openai = new OpenAI({
        apiKey: apiKey,
        dangerouslyAllowBrowser: true,
      });

      const data = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: messages,
      });

      const [aiRes] = data.choices;
      const message = aiRes.message?.content || "エラーが発生しました";

      return { message: message };
    },
    [systemPrompt]
  );

  const getChatResponseStream = useCallback(
    async (messageLog: Message[], apiKey: string) => {
      if (!apiKey) {
        throw new Error("Invalid API Key");
      }

      const messages: Message[] = [
        {
          role: "system",
          content: systemPrompt,
        },
        ...messageLog,
      ];

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      };
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        headers: headers,
        method: "POST",
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: messages,
          stream: true,
          max_tokens: 200,
        }),
      });

      const reader = res.body?.getReader();
      if (res.status !== 200 || !reader) {
        throw new Error("Something went wrong");
      }

      const stream = new ReadableStream({
        async start(controller: ReadableStreamDefaultController) {
          const decoder = new TextDecoder("utf-8");
          try {
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;
              const data = decoder.decode(value);
              const chunks = data
                .split("data:")
                .filter((val) => !!val && val.trim() !== "[DONE]");
              for (const chunk of chunks) {
                const json = JSON.parse(chunk);
                const messagePiece = json.choices[0].delta.content;
                if (messagePiece) {
                  controller.enqueue(messagePiece);
                }
              }
            }
          } catch (error) {
            controller.error(error);
          } finally {
            reader.releaseLock();
            controller.close();
          }
        },
      });

      return stream;
    },
    [systemPrompt]
  );

  return { load, getChatResponse, getChatResponseStream };
};
