#!/bin/bash

# Substitua pelo seu domínio e email
DOMAIN="web.micasan.com.br"
EMAIL="micaelparadox@gmail.com"

# Criar diretório para desafios ACME se não existir
mkdir -p ./certbot-www

# Parar containers antigos se existirem
docker-compose down

# Subir apenas o Nginx primeiro
docker-compose up -d nginx

# Aguardar o Nginx iniciar
sleep 5

# Executar o certbot para obter o certificado inicial
docker-compose run --rm certbot certbot certonly \
  --webroot -w /var/www/letsencrypt \
  --email $EMAIL \
  --agree-tos \
  --no-eff-email \
  -d $DOMAIN

# Reiniciar todos os containers
docker-compose down
docker-compose up -d

echo "Instalação concluída! Verifique se o SSL está funcionando em https://$DOMAIN"