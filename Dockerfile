# Build stage
FROM node:alpine AS build
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate
WORKDIR /app
COPY . .
RUN pnpm i
RUN pnpm build

# Install yq to extract appVersion from Chart.yaml
RUN apk add --no-cache yq

# Extract appVersion and save it to a file
RUN yq eval '.appVersion' .helm/Chart.yaml > /tmp/APP_VERSION

# Runtime stage
FROM httpd:2.4 AS lean
COPY --from=build /app/dist /usr/local/apache2/htdocs/
COPY --from=build /tmp/APP_VERSION /tmp/APP_VERSION
EXPOSE 80

# Set the environment variable by reading the file
RUN export K8S_APP_VERSION=`${(cat /tmp/APP_VERSION)}`
