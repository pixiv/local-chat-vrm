import { useCallback, useRef } from "react";
import { GeminiNanoSession } from "../chat/geminiNanoChat";

const MAX_RECORDING_TIME_MS = 30000;
const MIN_RECORDING_TIME_MS = 400;

export const useTranscriptionByGeminiNano = () => {
  const sessionRef = useRef<GeminiNanoSession | null>(null);
  const recordResolveRef = useRef<
    ((value: void | PromiseLike<void>) => void) | null
  >(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

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

    if (mediaStreamRef.current === null) {
      mediaStreamRef.current = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
    }
  }, []);

  const stopTranscribing = useCallback(() => {
    if (recordResolveRef.current) {
      recordResolveRef.current();
      recordResolveRef.current = null;
    }
  }, []);

  const transcribe = useCallback(async () => {
    const mediaStream = mediaStreamRef.current;
    if (mediaStream === null) {
      throw Error("Media stream is not ready.");
    }

    const mediaRecorder = new MediaRecorder(mediaStream);
    const audioChunks: BlobPart[] = [];

    mediaRecorder.ondataavailable = (event) => {
      audioChunks.push(event.data);
    };

    mediaRecorder.start();
    const startDate = Date.now();
    await new Promise((resolve) => {
      setTimeout(stopTranscribing, MAX_RECORDING_TIME_MS);
      recordResolveRef.current = resolve;
    });
    mediaRecorder.stop();
    const recordingTime = Date.now() - startDate;

    await new Promise((r) => (mediaRecorder.onstop = r));

    if (recordingTime < MIN_RECORDING_TIME_MS) {
      return "";
    }

    const blob = new Blob(audioChunks, { type: mediaRecorder.mimeType });

    // 取得した音声からGemini Nanoを利用して文字起こし
    if (sessionRef.current === null) {
      throw Error("Gemini Nano for Transcription is not ready.");
    }

    try {
      return await sessionRef.current.prompt([
        {
          role: "user",
          content: [
            { type: "text", value: "Transcribe this short audio." },
            { type: "audio", value: blob },
          ],
        },
      ]);
    } catch (e) {
      console.error(e)
      return ""
    }
  }, [stopTranscribing]);

  return { load, transcribe, stopTranscribing };
};
