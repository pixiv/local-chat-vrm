import { VRMExpressionPresetName } from "@pixiv/three-vrm";
import { KoeiroParam } from "../constants/koeiroParam";

// ChatGPT API
export type Message = {
  role: "assistant" | "system" | "user";
  content: string;
};

export const voiceEngines = ["Kokoro TTS", "Koeiromap"] as const;

export type VoiceEngine = (typeof voiceEngines)[number];

export const DEFAULT_VOICE_ENGINE: VoiceEngine = "Kokoro TTS";

const _koeiromapTalkStyles = [
  "talk",
  "happy",
  "sad",
  "angry",
  "fear",
  "surprised",
] as const;
export type KoeiromapTalkStyle = (typeof _koeiromapTalkStyles)[number];

export type KoeiromapTalk = {
  voiceEngine: "Koeiromap";
  style: KoeiromapTalkStyle;
  speakerX: number;
  speakerY: number;
  message: string;
};

const DEFAULT_KOKORO_TTS_VOICE_NAME = "af_heart";

export type KokoroTtsTalk = {
  voiceEngine: "Kokoro TTS";
  voiceName: string;
  message: string;
};

export type Talk = KoeiromapTalk | KokoroTtsTalk;

const emotions = ["neutral", "happy", "angry", "sad", "relaxed"] as const;
type EmotionType = (typeof emotions)[number] & VRMExpressionPresetName;

/**
 * 発話文と音声の感情と、モデルの感情表現がセットになった物
 */
export type Screenplay = {
  expression: EmotionType;
  talk: Talk;
};

export const splitSentence = (text: string): string[] => {
  const splitMessages = text.split(/(?<=[。．！？\n])/g);
  return splitMessages.filter((msg) => msg !== "");
};

export const textsToScreenplay = (
  voiceEngine: VoiceEngine,
  texts: string[],
  koeiroParam: KoeiroParam
): Screenplay[] => {
  const screenplays: Screenplay[] = [];
  let prevExpression = "neutral";
  for (let i = 0; i < texts.length; i++) {
    const text = texts[i];

    const match = text.match(/\[(.*?)\]/);

    const tag = (match && match[1]) || prevExpression;

    const message = text.replace(/\[(.*?)\]/g, "");

    let expression = prevExpression;
    if (emotions.includes(tag as any)) {
      expression = tag;
      prevExpression = tag;
    }

    switch (voiceEngine) {
      case "Koeiromap":
        screenplays.push({
          expression: expression as EmotionType,
          talk: {
            voiceEngine,
            style: emotionToTalkStyle(expression as EmotionType),
            speakerX: koeiroParam.speakerX,
            speakerY: koeiroParam.speakerY,
            message: message,
          },
        });
        break;
      case "Kokoro TTS":
        screenplays.push({
          expression: expression as EmotionType,
          talk: {
            voiceEngine,
            voiceName: DEFAULT_KOKORO_TTS_VOICE_NAME,
            message: message,
          },
        });
        break;
      default:
        throw Error("Selected voice engine is not supported");
    }
  }

  return screenplays;
};

const emotionToTalkStyle = (emotion: EmotionType): KoeiromapTalkStyle => {
  switch (emotion) {
    case "angry":
      return "angry";
    case "happy":
      return "happy";
    case "sad":
      return "sad";
    default:
      return "talk";
  }
};
