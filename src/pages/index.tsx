import { useCallback, useContext, useEffect, useState } from "react";
import VrmViewer from "@/components/vrmViewer";
import { ViewerContext } from "@/features/vrmViewer/viewerContext";
import {
  Message,
  textsToScreenplay,
  DEFAULT_VOICE_ENGINE,
  Screenplay,
} from "@/features/messages/messages";
import { speakCharacter } from "@/features/messages/speakCharacter";
import { MessageInputContainer } from "@/components/messageInputContainer";
import { SYSTEM_PROMPT } from "@/features/constants/systemPromptConstants";
import { KoeiroParam, DEFAULT_PARAM } from "@/features/constants/koeiroParam";
import { Introduction } from "@/components/introduction";
import { Menu } from "@/components/menu";
import { GitHubLink } from "@/components/githubLink";
import { Meta } from "@/components/meta";
import { DEFAULT_CHAT_ENGINE, useChat } from "@/features/chat/chat";
import {
  DEFAULT_TRANSCRIPTION_ENGINE,
  useTranscription,
} from "@/features/transcription/transcription";

export default function Home() {
  const { viewer } = useContext(ViewerContext);

  const [loadingRequired, setLoadingRequired] = useState(true);
  const [transcriptionEngine] = useState(DEFAULT_TRANSCRIPTION_ENGINE);
  const [chatEngine] = useState(DEFAULT_CHAT_ENGINE);
  const [voiceEngine] = useState(DEFAULT_VOICE_ENGINE);
  const [systemPrompt, setSystemPrompt] = useState(SYSTEM_PROMPT);
  const [openAiKey, setOpenAiKey] = useState("");
  const [koeiromapKey, setKoeiromapKey] = useState("");
  const [koeiroParam, setKoeiroParam] = useState<KoeiroParam>(DEFAULT_PARAM);
  const [chatProcessing, setChatProcessing] = useState(false);
  const [chatLog, setChatLog] = useState<Message[]>([]);
  const [assistantMessage, setAssistantMessage] = useState("");

  const { load: loadChatModel, getChatResponseStream } = useChat();
  const {
    load: loadTranscriptionModel,
    transcribe,
    stopTranscribing,
  } = useTranscription();

  useEffect(() => {
    if (window.localStorage.getItem("chatVRMParams")) {
      const params = JSON.parse(
        window.localStorage.getItem("chatVRMParams") as string
      );
      setSystemPrompt(params.systemPrompt ?? SYSTEM_PROMPT);
      setKoeiroParam(params.koeiroParam ?? DEFAULT_PARAM);
      setChatLog(params.chatLog ?? []);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(
      "chatVRMParams",
      JSON.stringify({ systemPrompt, koeiroParam, chatLog })
    );
  }, [systemPrompt, koeiroParam, chatLog]);

  const handleChangeSystemPrompt = useCallback(
    async (newSystemPrompt: string) => {
      if (newSystemPrompt === systemPrompt) {
        return;
      }
      setSystemPrompt(newSystemPrompt);
      setLoadingRequired(true);
    },
    [systemPrompt]
  );

  const handleChangeOpenAiKey = useCallback((openAiKey: string) => {
    setOpenAiKey(openAiKey);
    setLoadingRequired(true);
  }, []);

  const handleChangeChatLog = useCallback(
    (targetIndex: number, text: string) => {
      const newChatLog = chatLog.map((v: Message, i) => {
        return i === targetIndex ? { role: v.role, content: text } : v;
      });

      setChatLog(newChatLog);
    },
    [chatLog]
  );

  const handleResetChatLog = useCallback(async () => {
    setChatLog([]);
    setLoadingRequired(true);
  }, []);

  const handleLoading = useCallback(async () => {
    if (!loadingRequired) {
      return;
    }

    await Promise.all([
      loadTranscriptionModel(transcriptionEngine),
      loadChatModel(chatEngine, systemPrompt),
      speakCharacter.load(voiceEngine),
    ]);
    setLoadingRequired(false);
  }, [
    chatEngine,
    voiceEngine,
    loadChatModel,
    loadingRequired,
    loadTranscriptionModel,
    systemPrompt,
    transcriptionEngine,
  ]);

  /**
   * 文ごとに音声を直列でリクエストしながら再生する
   */
  const handleSpeakAi = useCallback(
    async (
      screenplay: Screenplay,
      onStart?: () => void,
      onEnd?: () => void
    ) => {
      speakCharacter.speak(screenplay, viewer, koeiromapKey, onStart, onEnd);
    },
    [viewer, koeiromapKey]
  );

  /**
   * アシスタントとの会話を行う
   */
  const handleSendChat = useCallback(
    async (text: string) => {
      if (chatEngine === "OpenAI" && !openAiKey) {
        setAssistantMessage("APIキーが入力されていません");
        return;
      }

      const newMessage = text;

      if (newMessage == null) return;

      setChatProcessing(true);
      // ユーザーの発言を追加して表示
      const messageLog: Message[] = [
        ...chatLog,
        { role: "user", content: newMessage },
      ];
      setChatLog(messageLog);

      const stream = await getChatResponseStream(
        chatEngine,
        messageLog,
        openAiKey
      ).catch((e) => {
        console.error(e);
        return null;
      });
      if (stream == null) {
        setChatProcessing(false);
        return;
      }

      const reader = stream.getReader();
      let receivedMessage = "";
      let aiTextLog = "";
      let tag = "";
      const sentences = new Array<string>();

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          receivedMessage += value;

          while (receivedMessage) {
            // 返答内容のタグ部分の検出
            const tagMatch = receivedMessage.match(/^\[(.*?)\]/);
            if (tagMatch && tagMatch[0]) {
              tag = tagMatch[0];
              receivedMessage = receivedMessage.slice(tag.length);
            }

            // 返答を一文単位で切り出して処理する
            const sentenceMatch = receivedMessage.match(
              /^(.+[。．！？.!?\n]|.{10,}[、,])/
            );
            if (!sentenceMatch || !sentenceMatch[0]) {
              break;
            }

            const sentence = sentenceMatch[0];
            sentences.push(sentence);
            receivedMessage = receivedMessage
              .slice(sentence.length)
              .trimStart();

            // 発話不要/不可能な文字列だった場合はスキップ
            if (
              !sentence.replace(
                /^[\s[({「［（【『〈《〔｛«‹〘〚〛〙›»〕》〉』】）］」})\]]+$/g,
                ""
              )
            ) {
              continue;
            }

            const aiText = `${tag} ${sentence}`;
            const aiTalks = textsToScreenplay(
              voiceEngine,
              [aiText],
              koeiroParam
            );
            aiTextLog += aiText;

            // 文ごとに音声を生成 & 再生、返答を表示
            const currentAssistantMessage = sentences.join(" ");
            handleSpeakAi(aiTalks[0], () => {
              setAssistantMessage(currentAssistantMessage);
            });
          }
        }
      } catch (e) {
        setChatProcessing(false);
        console.error(e);
      } finally {
        reader.releaseLock();
      }

      // アシスタントの返答をログに追加
      const messageLogAssistant: Message[] = [
        ...messageLog,
        { role: "assistant", content: aiTextLog },
      ];

      setChatLog(messageLogAssistant);
      setChatProcessing(false);
    },
    [
      openAiKey,
      chatLog,
      getChatResponseStream,
      chatEngine,
      voiceEngine,
      koeiroParam,
      handleSpeakAi,
    ]
  );

  return (
    <div className={"font-M_PLUS_2"}>
      <Meta />
      <Introduction
        chatEngine={chatEngine}
        openAiKey={openAiKey}
        voiceEngine={voiceEngine}
        koeiroMapKey={koeiromapKey}
        onChangeAiKey={handleChangeOpenAiKey}
        onChangeKoeiromapKey={setKoeiromapKey}
        onLoad={handleLoading}
      />
      <VrmViewer />
      <MessageInputContainer
        transcribe={transcribe}
        stopTranscribing={stopTranscribing}
        isChatProcessing={chatProcessing}
        onChatProcessStart={handleSendChat}
      />
      <Menu
        chatEngine={chatEngine}
        openAiKey={openAiKey}
        systemPrompt={systemPrompt}
        chatLog={chatLog}
        koeiroParam={koeiroParam}
        assistantMessage={assistantMessage}
        voiceEngine={voiceEngine}
        koeiromapKey={koeiromapKey}
        onChangeAiKey={setOpenAiKey}
        onChangeSystemPrompt={handleChangeSystemPrompt}
        onChangeChatLog={handleChangeChatLog}
        onChangeKoeiromapParam={setKoeiroParam}
        handleClickResetChatLog={handleResetChatLog}
        handleClickResetSystemPrompt={() =>
          handleChangeSystemPrompt(SYSTEM_PROMPT)
        }
        onChangeKoeiromapKey={setKoeiromapKey}
        onLoad={handleLoading}
      />
      <GitHubLink />
    </div>
  );
}
