interface ImportMetaEnv {
    readonly K8S_APP__IMAGE_VERSION: string;
    readonly K8S_APP__IMAGE_REVISION: string;
    readonly K8S_APP__VERSION: string;
    //
    readonly CORS_ALLOW_ORIGIN: string;
  }
  
  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
  