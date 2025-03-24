# ======================================
# STAGE 1: Build da aplicação (Node)
# ======================================
FROM node:18-alpine AS builder

WORKDIR /app

# Copia package.json e package-lock.json (ou yarn.lock)
COPY package*.json ./

# Instala dependências
RUN npm install

# Copia todo o código-fonte
COPY . .

# Faz o build (gera /dist)
RUN npm run build

# ======================================
# STAGE 2: Contêiner de deploy (só os arquivos estáticos)
# ======================================
FROM busybox:latest

WORKDIR /app

# Copia os arquivos de build
COPY --from=builder /app/dist /app/dist

# Define volume para compartilhar os arquivos estáticos
VOLUME /app/dist

# Comando que mantém o contêiner rodando
CMD ["tail", "-f", "/dev/null"]