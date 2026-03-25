# --- Base & Build Stages ---
FROM node:lts-alpine AS base
WORKDIR /app
COPY ./package*.json ./
RUN npm install
COPY . .

FROM base AS development
EXPOSE 3000
CMD [ "npm", "run", "dev" ]

FROM base AS builder
RUN npm run build

FROM nginx:alpine AS production
COPY --from=builder /app/dist /usr/share/nginx/html
COPY ./nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]