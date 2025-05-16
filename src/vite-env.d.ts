/// <reference types="vite/client" />

interface ViteTypeOptions {}

interface ImportMetaEnv {
  readonly VITE_CHARACTER_SETTINGS_DISABLED: boolean;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
