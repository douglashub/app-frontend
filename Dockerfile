# Usa Node como base (sem Alpine se preferir)
FROM node:20-alpine

# Cria e entra na pasta /app
WORKDIR /app

# Copia e instala dependências
COPY package*.json ./
RUN npm install

# Copia o restante do projeto
COPY . .

# Gera o build de produção (pasta dist/)
RUN npm run build

# Instala um servidor estático simples
RUN npm install -g serve

# Define porta padrão
ENV PORT=8080

# Expõe a porta (opcional se a plataforma ignora)
EXPOSE 8080

# Inicia o server estático apontando pra pasta dist
CMD ["serve", "-s", "dist", "-l", "0.0.0.0:${PORT}"]
