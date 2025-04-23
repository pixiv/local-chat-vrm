import { useCallback, useRef } from "react";

export const useTranscriptionBySpeechRecognition = () => {
  const speechRecognitionRef = useRef<SpeechRecognition | null>(null);
  const transcribeResolveRef = useRef<
    ((value: string | PromiseLike<string>) => void) | null
  >(null);

  // 音声認識の結果を処理する
  const handleRecognitionResult = useCallback(
    (event: SpeechRecognitionEvent) => {
      const text = event.results[0][0].transcript;

      // 発言の終了時
      if (event.results[0].isFinal) {
        if (transcribeResolveRef.current === null) {
          throw Error("Recording is not started");
        }
        transcribeResolveRef.current(text);
        transcribeResolveRef.current = null;
      }
    },
    []
  );

  const transcribe = useCallback(() => {
    const SpeechRecognition =
      window.webkitSpeechRecognition || window.SpeechRecognition;

    // FirefoxなどSpeechRecognition非対応環境対策
    if (!SpeechRecognition) {
      return "";
    }
    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = true; // 認識の途中結果を返す
    recognition.continuous = false; // 発言の終了時に自動的に認識を終了する

    recognition.addEventListener("result", handleRecognitionResult);

    recognition.start();
    speechRecognitionRef.current = recognition;

    return new Promise<string>((resolve) => {
      transcribeResolveRef.current = resolve;
    });
  }, [handleRecognitionResult]);

  const stopTranscribing = useCallback(() => {
    speechRecognitionRef.current?.stop();
  }, []);

  return { transcribe, stopTranscribing };
};
