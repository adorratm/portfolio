# syntax=docker/dockerfile:1

FROM node:26-alpine AS deps
WORKDIR /app
RUN rm -f /usr/local/bin/yarn /usr/local/bin/yarnpkg && \
    npm install -g corepack@latest && \
    corepack enable && \
    corepack prepare yarn@4.17.1 --activate
COPY package.json yarn.lock .yarnrc.yml ./
COPY .yarn ./.yarn
COPY backend/package.json ./backend/
COPY frontend/package.json ./frontend/
COPY admin/package.json ./admin/
RUN yarn workspaces focus backend

FROM node:26-alpine AS builder
WORKDIR /app
RUN rm -f /usr/local/bin/yarn /usr/local/bin/yarnpkg && \
    npm install -g corepack@latest && \
    corepack enable && \
    corepack prepare yarn@4.17.1 --activate
COPY --from=deps /app /app
COPY backend ./backend
ENV YARN_ENABLE_IMMUTABLE_INSTALLS=false
WORKDIR /app/backend
RUN yarn run build

FROM node:26-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nestjs && adduser --system --uid 1001 nestjs
COPY --from=builder /app/backend/dist ./dist
COPY --from=builder /app/backend/package.json ./package.json
COPY --from=builder /app/backend/node_modules ./node_modules
RUN mkdir -p uploads && chown -R nestjs:nestjs /app
USER nestjs
EXPOSE 3001
CMD ["node", "dist/main.js"]
