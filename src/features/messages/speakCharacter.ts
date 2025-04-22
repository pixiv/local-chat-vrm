import { wait } from "@/utils/wait";
import { synthesizeVoiceApi } from "../voices/koeiromapSynthesizeVoice";
import { Viewer } from "../vrmViewer/viewer";
import {
  KoeiromapTalk,
  KokoroTtsTalk,
  Screenplay,
  VoiceEngine,
} from "./messages";
import { kokoroTts } from "../voices/kokoroTts";

const createSpeakCharacter = () => {
  let lastTime = 0;
  let prevFetchPromise: Promise<unknown> = Promise.resolve();
  let prevSpeakPromise: Promise<unknown> = Promise.resolve();

  const continuousFetchAudio = (
    screenplay: Screenplay,
    viewer: Viewer,
    fetchInterval: number,
    fetchAudio: () => Promise<ArrayBuffer>,
    onStart?: () => void,
    onComplete?: () => void
  ) => {
    const fetchPromise = prevFetchPromise.then(async () => {
      const now = Date.now();
      if (now - lastTime < fetchInterval) {
        await wait(fetchInterval - (now - lastTime));
      }

      const buffer = await fetchAudio().catch(() => null);
      lastTime = Date.now();
      return buffer;
    });

    prevFetchPromise = fetchPromise;
    prevSpeakPromise = Promise.all([fetchPromise, prevSpeakPromise]).then(
      ([audioBuffer]) => {
        onStart?.();
        if (!audioBuffer) {
          return;
        }
        return viewer.model?.speak(audioBuffer, screenplay);
      }
    );
    prevSpeakPromise.then(() => {
      onComplete?.();
    });
  };

  const getFunctionToFetchKoeiromapAudio =
    (talk: KoeiromapTalk, apiKey: string) => async (): Promise<ArrayBuffer> => {
      const ttsVoice = await synthesizeVoiceApi(
        talk.message,
        talk.speakerX,
        talk.speakerY,
        talk.style,
        apiKey
      );
      const url = ttsVoice.audio;

      if (url == null) {
        throw new Error("Something went wrong");
      }

      const resAudio = await fetch(url);
      const buffer = await resAudio.arrayBuffer();
      return buffer;
    };

  const getFunctionToFetchKokoroTtsAudio =
    (talk: KokoroTtsTalk) => async (): Promise<ArrayBuffer> => {
      return await kokoroTts.generate(talk);
    };

  const load = async (voiceEngine: VoiceEngine): Promise<void> => {
    if (voiceEngine !== "Kokoro TTS") {
      return;
    }

    await kokoroTts.load();
  };

  const speak = (
    screenplay: Screenplay,
    viewer: Viewer,
    koeiroApiKey: string,
    onStart?: () => void,
    onComplete?: () => void
  ) => {
    const talk = screenplay.talk;
    switch (talk.voiceEngine) {
      case "Koeiromap":
        continuousFetchAudio(
          screenplay,
          viewer,
          1000,
          getFunctionToFetchKoeiromapAudio(talk, koeiroApiKey),
          onStart,
          onComplete
        );
        break;
      case "Kokoro TTS":
        continuousFetchAudio(
          screenplay,
          viewer,
          0,
          getFunctionToFetchKokoroTtsAudio(talk),
          onStart,
          onComplete
        );
        break;
      default:
        throw Error("Selected voice engine is not supported");
    }
  };

  return {
    load,
    speak,
  };
};

export const speakCharacter = createSpeakCharacter();
