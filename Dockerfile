ARG K8S_APP__VERSION="unknown"

# Build stage
FROM node:alpine AS build
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate
WORKDIR /app
COPY . .
RUN pnpm i

ENV K8S_APP__VERSION=$K8S_APP__VERSION

RUN pnpm build


# Runtime stage
FROM httpd:2.4 AS lean
COPY --from=build /app/dist /usr/local/apache2/htdocs/
EXPOSE 80
