interface ImportMetaEnv {
    readonly K8S_APP__IMAGE_VERSION: string;
    readonly K8S_APP__IMAGE_REVISION: string;
    readonly K8S_APP__VERSION: string;
    /** origin root domains that should be allowed. Will be prefixed by "https://" scheme */
    readonly CORS_ALLOW_ORIGIN: string;
    //
    readonly CORS_AUTH_BEARER_TOKEN: string;
  }
  
  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
  