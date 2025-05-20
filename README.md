# LocalChatVRM

LocalChatVRM is a project primarily for technical sharing and demonstration purposes. It was used for a demo exhibition at Google I/O 2025.

**This repository is archived.**
If you wish to make changes to LocalChatVRM, please feel free to fork the repository and develop it further.

---

LocalChatVRM is a demo application that allows you to easily converse with 3D characters in your browser. Based on [ChatVRM](https://github.com/pixiv/ChatVRM) [^1], it operates locally in the browser by utilizing Chrome Built-in AI and Kokoro.js.

You can import VRM files to adjust the voice to match the character and generate responses that include emotional expressions.

The main features of LocalChatVRM utilize the following technologies:

- User voice recognition
    - Chrome Built-in AI Multimodality APIs
- Response generation
    - [Chrome Built-in AI APIs](https://developer.chrome.com/docs/ai/built-in)
- Speech synthesis
    - [Kokoro](https://github.com/hexgrad/kokoro)
- 3D character display
    - [@pixiv/three-vrm](https://github.com/pixiv/three-vrm)

## Demo

A live demo is available on GitHub Pages. Please note that it will only function correctly in environments where the Chrome Built-in AI Multimodality APIs are supported.

https://pixiv.github.io/local-chat-vrm/

## Execution

To run in a local environment, clone or download this repository.

```bash
git clone git@github.com:pixiv/local-chat-vrm.git
```

Install the necessary packages.

```bash
npm install
```

After the packages are installed, start the development web server with the following command:

```bash
npm run dev
```

Once running, access the following URL in your browser to verify operation:

[http://localhost:5173](http://localhost:5173)

-----

## Chrome Built-in AI APIs

LocalChatVRM uses Chrome Built-in AI APIs for text generation.

Configuration of Google Chrome is required to use Chrome Built-in AI. Please refer to the following link for setup instructions:

https://developer.chrome.com/docs/ai/get-started

## Chrome Built-in AI Multimodality APIs

LocalChatVRM uses Chrome Built-in AI Multimodality APIs for voice recognition.

As of May 19, 2025, Chrome Built-in AI Multimodality APIs are only available in limited environments.

In environments where Chrome Built-in AI Multimodality APIs are not available, you can use the SpeechSynthesis API by making the following modification:

Assign `"SpeechSynthesis"` to `DEFAULT_TRANSCRIPTION_ENGINE` in `src/features/transcription/transcription.ts`.

```typescript
export const DEFAULT_TRANSCRIPTION_ENGINE: TranscriptionEngine = "SpeechSynthesis";
```

[^1]: Licensed under the [MIT License](https://github.com/pixiv/ChatVRM/blob/main/LICENSE). Copyright (c) pixiv 2023
