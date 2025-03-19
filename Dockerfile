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
# STAGE 2: Container final (Nginx)
# ======================================
FROM nginx:1.25-alpine

# Copia build gerada do stage anterior
COPY --from=builder /app/dist /usr/share/nginx/html

# Opcional: se você tiver um nginx.conf customizado para rotas, etc.
# Exemplo: redirecionar /api para https://api.micasan.com.br
# Se não precisar, pode remover essa parte e usar o default do Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expõe porta 80
EXPOSE 80

# Inicia Nginx
CMD ["nginx", "-g", "daemon off;"]
