interface ImportMetaEnv {
  //
  readonly K8S_APP__VERSION: string;
  //
  readonly LEGALSTAMP_AUTH_TOKEN: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
