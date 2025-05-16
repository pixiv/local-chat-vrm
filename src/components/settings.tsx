import React, { useCallback, useState } from "react";
import { IconButton } from "./iconButton";
import { TextButton } from "./textButton";
import { Message, VoiceEngine } from "@/features/messages/messages";
import {
  KoeiroParam,
  PRESET_A,
  PRESET_B,
  PRESET_C,
  PRESET_D,
} from "@/features/constants/koeiroParam";
import { Link } from "./link";
import { ChatEngine } from "@/features/chat/chat";

const CHARACTER_SETTINGS_DISABLED = import.meta.env
  .VITE_CHARACTER_SETTINGS_DISABLED;

type Props = {
  chatEngine: ChatEngine;
  openAiKey: string;
  systemPrompt: string;
  chatLog: Message[];
  voiceEngine: VoiceEngine;
  koeiroParam: KoeiroParam;
  koeiromapKey: string;
  onClickClose: () => void;
  onChangeAiKey: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onChangeSystemPrompt: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onChangeChatLog: (index: number, text: string) => void;
  onChangeKoeiroParam: (x: number, y: number) => void;
  onClickOpenVrmFile: () => void;
  onClickResetChatLog: () => void;
  onClickResetSystemPrompt: () => void;
  onChangeKoeiromapKey: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onLoad: () => Promise<void>;
};
export const Settings = ({
  chatEngine,
  openAiKey,
  chatLog,
  systemPrompt,
  voiceEngine,
  koeiroParam,
  koeiromapKey,
  onClickClose,
  onChangeSystemPrompt,
  onChangeAiKey,
  onChangeChatLog,
  onChangeKoeiroParam,
  onClickOpenVrmFile,
  onClickResetChatLog,
  onClickResetSystemPrompt,
  onChangeKoeiromapKey,
  onLoad,
}: Props) => {
  const [isLoading, setIsLoading] = useState(false);
  const handleClickCloseButton = useCallback(async () => {
    setIsLoading(true);
    await onLoad();
    onClickClose();
    setIsLoading(false);
  }, [onClickClose, onLoad]);

  return (
    <div className="absolute z-40 w-full h-full bg-white/80 backdrop-blur ">
      <div className="absolute m-24">
        <IconButton
          iconName="24/Close"
          isProcessing={false}
          onClick={handleClickCloseButton}
          disabled={isLoading}
        ></IconButton>
      </div>
      <div className="max-h-full overflow-auto">
        <div className="text-text1 max-w-3xl mx-auto px-24 py-64 ">
          <div className="my-24 typography-32 font-bold">Overview</div>
          <div className="my-16 typography-20 font-bold">About VRoid</div>
          <div>
            <p>The 3D model used in this demo was created with VRoid.</p>
            <p>
              The VRoid project is a 3D business by Pixiv Inc. with the
              philosophy of "Make Creativities More Enjoyable"
            </p>
            <p>
              The world of "one person, one avatar" where everyone has their own
              unique 3D character model and can utilize that character for
              creative activities and communication. Our mission is to realize
              that future with the power of technology and creativity.
            </p>
            <Link url="https://vroid.com/en" label="Learn more" />
          </div>
          <div className="my-16 typography-20 font-bold">About Repository</div>
          <div className="my-16 font-bold">
            {CHARACTER_SETTINGS_DISABLED && (
              <p>
                In this demo, editing the Settings is disabled. To use a fully
                editable version of the application, please clone our public
                repository from GitHub and run it on your local machine.
              </p>
            )}
            <Link
              url={"https://github.com/pixiv/local-chat-vrm"}
              label="https://github.com/pixiv/local-chat-vrm"
            />
            <img
              alt="https://github.com/pixiv/ChatVRM"
              height={80}
              width={80}
              src={"./github-qr.svg"}
              className="my-16"
            />
          </div>
          <div className="my-24 typography-32 font-bold">Settings</div>
          {chatEngine === "OpenAI" && (
            <div className="my-24">
              <div className="my-16 typography-20 font-bold">
                OpenAI API Key
              </div>
              <input
                className="text-ellipsis px-16 py-8 w-col-span-2 bg-surface1 hover:bg-surface1-hover rounded-8"
                type="text"
                placeholder="sk-..."
                value={openAiKey}
                onChange={onChangeAiKey}
                disabled={isLoading}
              />
              <div>
                You can create your API key on
                <Link
                  url="https://platform.openai.com/account/api-keys"
                  label="the OpenAI website"
                />
                . Please enter the created API key in the form below.
              </div>
              <div className="my-16">
                ChatGPT The API is accessed directly from your browser.
                Additionally, your API key and conversation content are not
                stored on pixiv&#39;s servers.
                <br />* The model currently in use is the ChatGPT API (GPT-3.5).
              </div>
            </div>
          )}
          <div className="my-40">
            <div className="my-16 typography-20 font-bold">3D model</div>
            <div className="my-8">
              <TextButton
                onClick={onClickOpenVrmFile}
                disabled={CHARACTER_SETTINGS_DISABLED}
              >
                Open VRM File
              </TextButton>
            </div>
          </div>
          <div className="my-40">
            <div className="my-8">
              <div className="my-16 typography-20 font-bold">
                Character Settings (System Prompt)
              </div>
              <TextButton
                onClick={onClickResetSystemPrompt}
                disabled={CHARACTER_SETTINGS_DISABLED}
              >
                Reset Character Settings
              </TextButton>
            </div>

            <textarea
              value={systemPrompt}
              onChange={onChangeSystemPrompt}
              className="px-16 py-8  bg-surface1 hover:bg-surface1-hover h-168 rounded-8 w-full"
              disabled={CHARACTER_SETTINGS_DISABLED || isLoading}
            ></textarea>
          </div>
          {voiceEngine === "Koeiromap" && (
            <div className="my-40">
              <div className="my-16 typography-20 font-bold">
                Voice Adjustment
              </div>
              <div>
                This application uses the Koeiromap API provided by Koemotion.
                For details, please visit
                <Link
                  url="https://koemotion.rinna.co.jp"
                  label="https://koemotion.rinna.co.jp"
                />
              </div>
              <div className="mt-16 font-bold">API Key</div>
              <div className="mt-8">
                <input
                  className="text-ellipsis px-16 py-8 w-col-span-2 bg-surface1 hover:bg-surface1-hover rounded-8"
                  type="text"
                  placeholder="..."
                  value={koeiromapKey}
                  onChange={onChangeKoeiromapKey}
                />
              </div>

              <div className="mt-16 font-bold">Presets</div>
              <div className="my-8 grid grid-cols-2 gap-[8px]">
                <TextButton
                  onClick={() =>
                    onChangeKoeiroParam(PRESET_A.speakerX, PRESET_A.speakerY)
                  }
                >
                  Cute
                </TextButton>
                <TextButton
                  onClick={() =>
                    onChangeKoeiroParam(PRESET_B.speakerX, PRESET_B.speakerY)
                  }
                >
                  Energetic
                </TextButton>
                <TextButton
                  onClick={() =>
                    onChangeKoeiroParam(PRESET_C.speakerX, PRESET_C.speakerY)
                  }
                >
                  Cool
                </TextButton>
                <TextButton
                  onClick={() =>
                    onChangeKoeiroParam(PRESET_D.speakerX, PRESET_D.speakerY)
                  }
                >
                  Deep
                </TextButton>
              </div>
              <div className="my-24">
                <div className="select-none">x : {koeiroParam.speakerX}</div>
                <input
                  type="range"
                  min={-10}
                  max={10}
                  step={0.001}
                  value={koeiroParam.speakerX}
                  className="mt-8 mb-16 input-range"
                  onChange={(e) => {
                    onChangeKoeiroParam(
                      Number(e.target.value),
                      koeiroParam.speakerY
                    );
                  }}
                ></input>
                <div className="select-none">y : {koeiroParam.speakerY}</div>
                <input
                  type="range"
                  min={-10}
                  max={10}
                  step={0.001}
                  value={koeiroParam.speakerY}
                  className="mt-8 mb-16 input-range"
                  onChange={(e) => {
                    onChangeKoeiroParam(
                      koeiroParam.speakerX,
                      Number(e.target.value)
                    );
                  }}
                ></input>
              </div>
            </div>
          )}
          {chatLog.length > 0 && (
            <div className="my-40">
              <div className="my-8 grid-cols-2">
                <div className="my-16 typography-20 font-bold">
                  Chat History
                </div>
                <TextButton onClick={onClickResetChatLog}>
                  Reset Chat History
                </TextButton>
              </div>
              <div className="my-8">
                {chatLog.map((value, index) => {
                  return (
                    <div
                      key={index}
                      className="my-8 grid grid-flow-col  grid-cols-[min-content_1fr] gap-x-fixed"
                    >
                      <div className="w-[64px] py-8">
                        {value.role === "assistant" ? "Character" : "You"}
                      </div>
                      <input
                        key={index}
                        className="bg-surface1 hover:bg-surface1-hover rounded-8 w-full px-16 py-8"
                        type="text"
                        value={value.content}
                        onChange={(event) => {
                          onChangeChatLog(index, event.target.value);
                        }}
                      ></input>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
