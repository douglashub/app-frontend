FROM nginx:1.25-alpine

RUN apk add --no-cache nodejs npm bash

WORKDIR /app
COPY . .
RUN npm install
RUN npm run build

# Copia build para Nginx
RUN rm -rf /usr/share/nginx/html/* && cp -r dist/* /usr/share/nginx/html/

# Copia o template que usa ${PORT}
COPY default.conf.template /etc/nginx/templates/default.conf.template

ENV PORT=8080
EXPOSE 8080

# Gera o /etc/nginx/conf.d/default.conf substituindo variáveis e inicia Nginx
CMD ["sh", "-c", "envsubst < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"]
