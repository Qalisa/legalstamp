### Base: toolchain
FROM node:22-alpine AS base
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@9.15.4 --activate

### Builder: sources + dependencies, ready to build with your own documents.
# Published as ghcr.io/qalisa/legalstamp:builder-<sha> (see README, "Serve your own documents").
FROM base AS builder
COPY ./app .
RUN pnpm install --frozen-lockfile

### Build (here with the sample documents)
# Build-time settings are set per site, not baked into the published builder image.
FROM builder AS build
ARG CANONICAL_URL="http://define-me.pls"
ENV CANONICAL_URL=$CANONICAL_URL
RUN pnpm run build

### Lean: runtime only
FROM node:22-alpine AS lean
WORKDIR /app
COPY --from=build /app/dist ./dist

# to access markdown files
# ENV LEGALSTAMP_AUTH_TOKEN=
ENV HOST=0.0.0.0 \
    PORT=80

EXPOSE 80
CMD ["node", "./dist/server/entry.mjs"]
