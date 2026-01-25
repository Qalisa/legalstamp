### Build stage
FROM node:22-alpine AS base
ARG K8S_APP__VERSION="unknown"
ARG CANONICAL_URL="http://define-me.pls"

WORKDIR /app

ENV K8S_APP__VERSION=$K8S_APP__VERSION
ENV CANONICAL_URL=$CANONICAL_URL

RUN corepack enable && corepack prepare pnpm@9.15.4 --activate

# By copying only the package.json and package-lock.json here, we ensure that the following `-deps` steps are independent of the source code.
# Therefore, the `-deps` steps will be skipped if only the source code changes.
COPY ./app/package.json ./app/pnpm-lock.yaml ./

FROM base AS build
COPY ./app .
RUN pnpm install --frozen-lockfile
RUN pnpm run build

FROM base AS lean
COPY --from=build /app/dist ./dist


# to access markdown files
# ENV LEGALSTAMP_AUTH_TOKEN=
ENV HOST=0.0.0.0 \
    PORT=80

EXPOSE 80
CMD ["node", "./dist/server/entry.mjs"]