import { useCallback, useRef } from "react";
import { GeminiNanoSession } from "../chat/geminiNanoChat";

export const useTranscriptionByGeminiNano = () => {
  const sessionRef = useRef<GeminiNanoSession | null>(null);
  const recordResolveRef = useRef<
    ((value: void | PromiseLike<void>) => void) | null
  >(null);

  const load = useCallback(async () => {
    if (
      (await window.LanguageModel.availability({
        expectedInputs: [{ type: "audio" }],
      })) !== "available"
    ) {
      throw Error("Gemini Nano (Audio) is not ready");
    }

    if (sessionRef.current === null) {
      sessionRef.current = await window.LanguageModel.create({
        expectedInputs: [{ type: "audio" }],
      });
    }
  }, []);

  const transcribe = useCallback(async () => {
    const mediaStream = await navigator.mediaDevices.getUserMedia({
      audio: true,
    });
    const mediaRecorder = new MediaRecorder(mediaStream);
    const audioChunks: BlobPart[] = [];

    mediaRecorder.ondataavailable = (event) => {
      audioChunks.push(event.data);
    };

    mediaRecorder.start();
    await new Promise((resolve) => {
      recordResolveRef.current = resolve;
    });
    mediaRecorder.stop();

    await new Promise((r) => (mediaRecorder.onstop = r));

    const blob = new Blob(audioChunks, { type: mediaRecorder.mimeType });

    // 取得した音声からGemini Nanoを利用して文字起こし
    if (sessionRef.current === null) {
      throw Error("Gemini Nano for Transcription is not ready.");
    }

    return await sessionRef.current.prompt([
      { type: "audio", content: blob },
      "Transcribe this short audio.",
    ]);
  }, []);

  const stopTranscribing = useCallback(() => {
    if (recordResolveRef.current) {
      recordResolveRef.current();
      recordResolveRef.current = null;
    }
  }, []);

  return { load, transcribe, stopTranscribing };
};
