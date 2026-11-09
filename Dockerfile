# Brug Node.js
FROM node:24-bookworm-slim

# Arbejdsmappe inde i containeren
WORKDIR /app

# Kopiér pakkelister og installér afhængigheder
COPY package.json package-lock.json ./
RUN npm ci

# Kopiér projektet
COPY . .

# Byg TypeScript til JavaScript
RUN npm run build

# Dokumentér backendens port i browseren
EXPOSE 3000

# Start den byggede Nest.js-backend
CMD ["node", "dist/main.js"]