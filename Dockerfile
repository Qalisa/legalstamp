FROM node:alpine AS build
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate
WORKDIR /app
COPY . .
RUN pnpm i
RUN pnpm build

# Installer les outils nécessaires (yq pour parser YAML, helm si nécessaire)
RUN apk add --no-cache yq

# Définir la variable d'environnement APP_VERSION en extrayant appVersion du Chart.yaml
# Assurez-vous que le Chart.yaml est accessible dans le contexte de construction
RUN yq eval '.appVersion' .helm/Chart.yaml > /tmp/APP_VERSION

FROM httpd:2.4 AS lean
COPY --from=build /app/dist /usr/local/apache2/htdocs/
COPY --from=build /tmp/APP_VERSION /tmp/APP_VERSION
EXPOSE 80

ENV K8S_APP__VERSION=(cat /tmp/APP_VERSION)
