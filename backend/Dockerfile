FROM node:20-alpine AS base
WORKDIR /app

FROM base AS dependencies
WORKDIR /app
COPY api/package.json ./api/
COPY socket_service/package.json ./socket_service/
RUN cd api && npm install
RUN cd socket_service && npm install

FROM dependencies AS build
WORKDIR /app
COPY api ./api
COPY socket_service ./socket_service
RUN cd api && npm run build
RUN cd socket_service && npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/api/dist ./api/dist
COPY --from=build /app/api/node_modules ./api/node_modules
COPY --from=build /app/socket_service/dist ./socket_service/dist
COPY --from=build /app/socket_service/node_modules ./socket_service/node_modules

EXPOSE 3000 3001
CMD ["node", "api/dist/main"]
