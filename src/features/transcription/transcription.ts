import { useCallback, useState } from "react";
import { useTranscriptionByGeminiNano } from "./transcriptionByGeminiNano";
import { useTranscriptionBySpeechRecognition } from "./transcriptionBySpeechRecognition";

export const TRANSCRIPTION_ENGINES = [
  "Gemini Nano",
  "SpeechSynthesis",
] as const;

export type TranscriptionEngine = (typeof TRANSCRIPTION_ENGINES)[number];

export const DEFAULT_TRANSCRIPTION_ENGINE: TranscriptionEngine = "Gemini Nano";

export const useTranscription = () => {
  const [transcriptionEngine, setTranscriptionEngine] =
    useState<TranscriptionEngine>(DEFAULT_TRANSCRIPTION_ENGINE);

  const {
    load: loadGeminiNano,
    transcribe: transcribeByGeminiNano,
    stopTranscribing: stopTranscribingByGemini,
  } = useTranscriptionByGeminiNano();
  const {
    transcribe: transcribeBySpeechRecognition,
    stopTranscribing: stopTranscribingBySpeechRecognition,
  } = useTranscriptionBySpeechRecognition();

  const load = useCallback(
    async (transcriptionEngine: TranscriptionEngine) => {
      setTranscriptionEngine(transcriptionEngine);
      switch (transcriptionEngine) {
        case "Gemini Nano":
          return await loadGeminiNano();
        default:
      }
    },
    [loadGeminiNano]
  );

  const transcribe = useCallback(async () => {
    switch (transcriptionEngine) {
      case "Gemini Nano":
        return await transcribeByGeminiNano();
      case "SpeechSynthesis":
        return await transcribeBySpeechRecognition();
      default:
        throw Error("Selected transcription engine is not supported");
    }
  }, [
    transcribeByGeminiNano,
    transcribeBySpeechRecognition,
    transcriptionEngine,
  ]);

  const stopTranscribing = useCallback(() => {
    switch (transcriptionEngine) {
      case "Gemini Nano":
        return stopTranscribingByGemini();
      case "SpeechSynthesis":
        return stopTranscribingBySpeechRecognition();
      default:
        throw Error("Selected transcription engine is not supported");
    }
  }, [
    stopTranscribingByGemini,
    stopTranscribingBySpeechRecognition,
    transcriptionEngine,
  ]);

  return { load, transcribe, stopTranscribing };
};
