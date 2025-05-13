import { MessageInput } from "@/components/messageInput";
import { useState, useEffect, useCallback } from "react";

type Props = {
  transcribe: () => Promise<string>;
  stopTranscribing: () => void;
  isChatProcessing: boolean;
  onChatProcessStart: (text: string) => void;
};

/**
 * テキスト入力と音声入力を提供する
 *
 * 音声認識の完了時は自動で送信し、返答文の生成中は入力を無効化する
 *
 */
export const MessageInputContainer = ({
  transcribe,
  stopTranscribing,
  isChatProcessing,
  onChatProcessStart,
}: Props) => {
  const [userMessage, setUserMessage] = useState("");
  const [isMicRecording, setIsMicRecording] = useState(false);

  const handlePointerDownMicButton = useCallback(async () => {
    setIsMicRecording(true);
    const transcription = await transcribe();
    setUserMessage(transcription);
    onChatProcessStart(transcription);
  }, [onChatProcessStart, transcribe]);

  const handlePointerUpMicButton = useCallback(() => {
    if (isMicRecording) {
      stopTranscribing();
      setIsMicRecording(false);
    }
  }, [isMicRecording, stopTranscribing]);

  const handleClickSendButton = useCallback(() => {
    onChatProcessStart(userMessage);
  }, [onChatProcessStart, userMessage]);

  useEffect(() => {
    if (isChatProcessing) {
      setIsMicRecording(false);
    } else {
      setUserMessage("");
    }
  }, [isChatProcessing, isMicRecording]);

  return (
    <MessageInput
      userMessage={userMessage}
      isChatProcessing={isChatProcessing}
      isMicRecording={isMicRecording}
      onChangeUserMessage={(e) => setUserMessage(e.target.value)}
      onPointerDownMicButton={handlePointerDownMicButton}
      onPointerUpMicButton={handlePointerUpMicButton}
      onClickSendButton={handleClickSendButton}
    />
  );
};
