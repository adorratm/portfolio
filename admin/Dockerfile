# syntax=docker/dockerfile:1

FROM node:22-alpine AS builder
WORKDIR /app

RUN apk add --no-cache libc6-compat
RUN corepack enable && corepack prepare yarn@4.17.1 --activate

ENV YARN_NODE_LINKER=node-modules
ENV YARN_ENABLE_SCRIPTS=1
ENV YARN_ENABLE_IMMUTABLE_INSTALLS=false
ENV NEXT_TELEMETRY_DISABLED=1

COPY package.json yarn.lock .yarnrc.yml ./
RUN yarn install && test -d node_modules

COPY . .

ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_WS_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_WS_URL=$NEXT_PUBLIC_WS_URL

RUN yarn build

FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
CMD ["node", "server.js"]
