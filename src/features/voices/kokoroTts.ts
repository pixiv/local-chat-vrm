import { KokoroTtsTalk } from "../messages/messages";

const createKokoroTts = () => {
  const kokoroWorker = new Worker(
    new URL("./kokoroTtsWorker.ts", import.meta.url),
    { type: "module" }
  );
  let kokoroLoadResolve: ((value: PromiseLike<void> | void) => void) | null =
    null;
  let kokoroGenerateVoiceResolve:
    | ((value: PromiseLike<ArrayBuffer> | ArrayBuffer) => void)
    | null = null;

  const kokoroOnMessageReceived = (e: MessageEvent) => {
    const { data } = e;
    switch (data.status) {
      case "device":
        break;
      case "ready":
        if (kokoroLoadResolve) {
          kokoroLoadResolve();
          kokoroLoadResolve = null;
        }
        break;
      case "error":
        console.error(data.error);
        break;
      case "stream": {
        break;
      }
      case "complete": {
        if (kokoroGenerateVoiceResolve) {
          kokoroGenerateVoiceResolve(data.audio.arrayBuffer());
          kokoroGenerateVoiceResolve = null;
        }
        break;
      }
    }
  };

  const kokoroOnErrorReceived = (e: ErrorEvent) => {
    console.error("Kokoro TTS Worker error:", e);
  };

  kokoroWorker.addEventListener("message", kokoroOnMessageReceived);
  kokoroWorker.addEventListener("error", kokoroOnErrorReceived);

  return {
    load: () => {
      kokoroWorker.postMessage({ type: "load" });
      return new Promise<void>((resolve) => {
        kokoroLoadResolve = resolve;
      });
    },
    generate: async (talk: KokoroTtsTalk): Promise<ArrayBuffer> => {
      return new Promise<ArrayBuffer>((resolve) => {
        kokoroGenerateVoiceResolve = resolve;
        kokoroWorker.postMessage({
          type: "generate",
          text: talk.message,
          voice: talk.voiceName,
          speed: 1,
        });
      });
    },
  };
};

export const kokoroTts = createKokoroTts();
