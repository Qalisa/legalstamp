# ⚖️ LegalStamp
From templates, serve on the web your legal documents by type, lang, date or associated product. CORS-protected, use and share your documents within your own apps.

> [!NOTE]
> We host our own Legalstamp instance at Qalisa: https://legal.qalisa.fr


## Preview
### Homepage
<div align="center">
  <img width="480" height="619" src="https://github.com/user-attachments/assets/90cf2e94-a9d4-432e-b347-fc306202aa49" />
</div>

### Available versions by date
<div align="center">
  <img width="368" height="219" src="https://github.com/user-attachments/assets/cdbf5e44-0d17-4134-bec5-473d623d1db8" />
</div>

### Access document in Markdown or HTML
<div align="center">
  <img width="471" height="817" src="https://github.com/user-attachments/assets/178b8d2e-e108-44e4-bcfc-325ad550df80" />
</div>


## Serve your own documents

This repository holds the tool and sample documents only. Documents are collected at build time, so your site is built from the published `builder` image:

```
your-repo/
  legalstamped/generated/{documentType}/{productOrOrganization}/{lang}/{"latest"|YYYYMMDD}.md
  legalstamp.config.json   # { "owner": "Your Org", "productOrOrganization": { "your-product": "Your Product" } }
  Dockerfile
```

```dockerfile
FROM ghcr.io/qalisa/legalstamp:builder-<sha> AS build
ARG CANONICAL_URL K8S_APP__VERSION
ENV CANONICAL_URL=$CANONICAL_URL K8S_APP__VERSION=$K8S_APP__VERSION
RUN rm -rf legalstamped/generated
COPY legalstamped/generated ./legalstamped/generated
COPY legalstamp.config.json ./
RUN pnpm run build

FROM node:22-alpine
WORKDIR /app
COPY --from=build /app/dist ./dist
ENV HOST=0.0.0.0 PORT=80
EXPOSE 80
CMD ["node", "./dist/server/entry.mjs"]
```

`builder-main` follows this repository's `main`; pin a `builder-<sha>` tag for reproducible builds.
