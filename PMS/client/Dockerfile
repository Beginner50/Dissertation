FROM node:lts-alpine AS base
WORKDIR /app
COPY ./package*.json .
RUN npm install
COPY . ./

FROM base AS development
EXPOSE 3000
CMD [ "npm", "run", "dev" ]

FROM base AS builder
RUN npm run build

FROM node:lts-alpine AS production
WORKDIR /app
EXPOSE 3000
COPY --from=builder ./dist .
CMD ["npm", "run", "start"]