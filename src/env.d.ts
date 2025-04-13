interface ImportMetaEnv {
  //
  readonly K8S_APP__VERSION: string;
  //
  readonly AUTH_BEARER_TOKEN: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
