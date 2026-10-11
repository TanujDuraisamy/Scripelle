FROM node:22-bookworm-slim AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci --ignore-scripts
COPY . .
ARG VITE_BACKEND_URL=http://localhost:5000
ARG VITE_WAITLIST_ENDPOINT
ENV VITE_BACKEND_URL=$VITE_BACKEND_URL VITE_WAITLIST_ENDPOINT=$VITE_WAITLIST_ENDPOINT
RUN npm run build
FROM nginx:stable-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
