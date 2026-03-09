/// <reference types="vite/client" />

interface ImportMetaEnv {
  // no custom env vars needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
