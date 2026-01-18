FROM node:lts-alpine AS base
WORKDIR /app
COPY ./package*.json .
RUN npm install
COPY . .

FROM base AS development
EXPOSE 3000
CMD [ "npm", "run", "dev" ]

FROM base AS builder
RUN npm run build

FROM node:lts-alpine AS production
WORKDIR /app
EXPOSE 3000
COPY --from=builder /app/dist .
COPY --from=builder /app/package.json .
COPY --from=builder /app/node_modules ./node_modules
CMD ["npm", "run", "preview"]