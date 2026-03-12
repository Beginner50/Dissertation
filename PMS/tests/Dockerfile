FROM node-alpine:latest as base
WORKDIR /tests
COPY ./package*.json .
RUN npm install
COPY . .
RUN npx playwright test -ui