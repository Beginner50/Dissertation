FROM mcr.microsoft.com/playwright:v1.58.2-noble AS base
WORKDIR /tests
COPY ./package*.json .
RUN npm install
COPY . .

FROM base AS test
CMD ["npx", "playwright", "test"]