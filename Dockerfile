# Estágio de compilação
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Estágio de produção
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY prepare-env.sh /prepare-env.sh
RUN chmod +x /prepare-env.sh
EXPOSE 80
ENTRYPOINT ["/prepare-env.sh"]
CMD ["nginx", "-g", "daemon off;"]