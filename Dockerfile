# Build stage
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci || npm install
COPY . .
# Vite lee las variables VITE_* al compilar, por eso se pasan como build args
ARG VITE_API_BASE_URL=http://localhost:8080/api
ARG VITE_USE_MOCK=false
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_USE_MOCK=$VITE_USE_MOCK
RUN npm run build

# Server stage (static server)
FROM node:22-alpine
WORKDIR /app
RUN npm i -g serve
COPY --from=build /app/dist ./dist
EXPOSE 4173
CMD [ "serve", "-s", "dist", "-l", "4173" ]
