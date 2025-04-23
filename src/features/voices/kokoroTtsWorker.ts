import { KokoroTTS, TextSplitterStream } from "kokoro-js";

// Load the model
const model_id = "onnx-community/Kokoro-82M-v1.0-ONNX";
let tts: KokoroTTS | null = null;

async function detectWebGPU() {
  try {
    const adapter = await navigator.gpu.requestAdapter();
    return !!adapter;
  } catch {
    return false;
  }
}

async function load() {
  const device = (await detectWebGPU()) ? "webgpu" : "wasm";
  self.postMessage({ status: "device", device });

  tts = await KokoroTTS.from_pretrained(model_id, {
    dtype: device === "wasm" ? "q8" : "fp32", // "fp32" | "fp16" | "q8" | "q4" | "q4f16"
    device,
  }).catch((e: Error) => {
    self.postMessage({ status: "error", error: e.message });
    throw e;
  });
  self.postMessage({ status: "ready", voices: tts.voices, device });
}

async function generate(e: MessageEvent) {
  const { text, voice, speed } = e.data;
  if (tts === null) {
    return;
  }
  const streamer = new TextSplitterStream();
  streamer.push(text);
  streamer.close(); // Indicate we won't add more text

  const stream = tts.stream(streamer, { voice, speed });
  const chunks: { sampling_rate: number; audio: Float32Array }[] = [];

  for await (const { text, audio } of stream) {
    self.postMessage({
      status: "stream",
      chunk: {
        audio: audio.toBlob(),
        text,
      },
    });
    chunks.push(audio);
  }

  // Merge chunks
  let audio;
  if (chunks.length > 0) {
    const sampling_rate = chunks[0].sampling_rate;
    const length = chunks.reduce((sum, chunk) => sum + chunk.audio.length, 0);
    const waveform = new Float32Array(length);
    let offset = 0;
    for (const { audio } of chunks) {
      waveform.set(audio, offset);
      offset += audio.length;
    }

    // Create a new merged RawAudio
    // @ts-expect-error - So that we don't need to import RawAudio
    audio = new chunks[0].constructor(waveform, sampling_rate);
  }
  self.postMessage({ status: "complete", audio: audio.toBlob() });
}

// Listen for messages from the main thread
self.addEventListener("message", async (e) => {
  const { type } = e.data;

  switch (type) {
    case "load":
      load();
      break;

    case "generate":
      generate(e);
      break;
  }
});
