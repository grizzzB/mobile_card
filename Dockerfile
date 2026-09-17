# syntax=docker/dockerfile:1

FROM node:24-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

ARG VITE_BASE_PATH=/
ARG VITE_FORMSPREE_ENDPOINT
ARG VITE_KAKAO_MAP_APP_KEY
ENV VITE_BASE_PATH=$VITE_BASE_PATH \
    VITE_FORMSPREE_ENDPOINT=$VITE_FORMSPREE_ENDPOINT \
    VITE_KAKAO_MAP_APP_KEY=$VITE_KAKAO_MAP_APP_KEY

RUN npm run build

FROM nginx:1.27-alpine AS runtime
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
