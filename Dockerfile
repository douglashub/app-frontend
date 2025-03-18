FROM node:20-alpine

WORKDIR /app

# Copie os arquivos de configuração primeiro para aproveitar o cache
COPY package*.json ./

# Use npm install em vez de npm ci
RUN npm install

# Copie o restante dos arquivos
COPY . .

# Construa o aplicativo
RUN npm run build

# Exponha a porta que será usada
EXPOSE 3000

# Comando para iniciar o aplicativo
CMD ["npm", "start"]