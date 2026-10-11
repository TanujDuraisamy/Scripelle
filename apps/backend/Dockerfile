FROM node:22-bookworm-slim
RUN apt-get update && apt-get install -y --no-install-recommends openssl && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY package*.json ./
RUN npm ci --ignore-scripts
COPY . .
RUN npm run prisma:generate && npm run build
ENV NODE_ENV=production HOST=0.0.0.0
USER node
EXPOSE 5000
CMD ["npm", "start"]
