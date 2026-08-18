# syntax=docker/dockerfile:1

FROM node:26-alpine AS deps
WORKDIR /app
# Node 25+ no longer bundles Corepack; remove legacy Yarn 1.x shims first
RUN rm -f /usr/local/bin/yarn /usr/local/bin/yarnpkg && \
    npm install -g corepack@latest && \
    corepack enable && \
    corepack prepare yarn@4.17.1 --activate
COPY package.json yarn.lock .yarnrc.yml ./
COPY .yarn ./.yarn
RUN yarn install --immutable

FROM node:26-alpine AS builder
WORKDIR /app
RUN rm -f /usr/local/bin/yarn /usr/local/bin/yarnpkg && \
    npm install -g corepack@latest && \
    corepack enable && \
    corepack prepare yarn@4.17.1 --activate
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN yarn build

FROM node:26-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nestjs && adduser --system --uid 1001 nestjs
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
RUN mkdir -p uploads && chown -R nestjs:nestjs /app
USER nestjs
EXPOSE 3001
CMD ["node", "dist/main.js"]
