FROM node:18

# Instala as bibliotecas necessárias
RUN apt-get update && apt-get install -y \
    libx11-dev \
    libxkbcommon0 \
    libxfixes3 \
    libatk-bridge2.0-0 \
    libgtk-3-0 \
    libnss3 \
    libasound2 \
    libgbm1 \
    libpango-1.0-0 \
    libpangocairo-1.0-0 \
    libcups2 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    libxtst6 \
    libxss1 \
    libgdk-pixbuf2.0-0 \
    libdrm2 \
    && rm -rf /var/lib/apt/lists/*


# Configuração adicional do Dockerfile
WORKDIR /home/node/app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000

CMD ["node", "server.js"]
