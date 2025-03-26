#!/bin/bash

# Substitua pelo seu domínio e email
DOMAIN="web.micasan.com.br"
EMAIL="seu-email@example.com"

# Parar containers existentes
docker-compose down

# Criar diretório para desafios ACME se não existir
mkdir -p ./certbot-www

# Criar configuração temporária do NGINX (sem SSL)
cat > nginx.conf <<EOF
server {
    listen 80;
    server_name ${DOMAIN};

    # Diretório raiz para arquivos estáticos
    root /usr/share/nginx/html;
    index index.html;

    # Local para desafios do Certbot
    location /.well-known/acme-challenge/ {
        root /var/www/letsencrypt;
        allow all;
    }

    # Rota principal do React
    location / {
        try_files \$uri \$uri/ /index.html;
    }

    # Proxy para API
    location /api/ {
        proxy_pass https://api.micasan.com.br;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
    }
}
EOF

# Iniciar containers
docker-compose up -d

# Aguardar NGINX inicializar
echo "Aguardando NGINX inicializar..."
sleep 10

# Executar Certbot para obter o certificado
echo "Obtendo certificado SSL com Certbot..."
docker-compose run --rm certbot certbot certonly \
  --webroot --webroot-path=/var/www/letsencrypt \
  --email $EMAIL \
  --agree-tos \
  --no-eff-email \
  -d $DOMAIN

# Verificar se os certificados foram criados
if [ ! -d "/etc/letsencrypt/live/$DOMAIN" ]; then
  echo "ERRO: Falha ao obter certificados. Verifique os logs do Certbot."
  exit 1
fi

# Criar configuração NGINX com SSL
cat > nginx.conf <<EOF
server {
    listen 80;
    server_name ${DOMAIN};

    # Local para desafios do Certbot
    location /.well-known/acme-challenge/ {
        root /var/www/letsencrypt;
        allow all;
    }

    # Redireciona todo o tráfego HTTP para HTTPS
    location / {
        return 301 https://\$host\$request_uri;
    }
}

server {
    listen 443 ssl;
    server_name ${DOMAIN};

    # Certificados SSL do Let's Encrypt
    ssl_certificate /etc/letsencrypt/live/${DOMAIN}/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/${DOMAIN}/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Diretório raiz para arquivos estáticos
    root /usr/share/nginx/html;
    index index.html;

    # Rota principal do React (SPA)
    location / {
        try_files \$uri \$uri/ /index.html;
    }

    # Proxy /api para o backend
    location /api/ {
        proxy_pass https://api.micasan.com.br;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # Otimização de cache para arquivos estáticos
    location ~* \.(ico|css|js|gif|jpe?g|png|woff2?|eot|ttf|svg|otf)\$ {
        expires 6M;
        access_log off;
        add_header Cache-Control "public";
    }
}
EOF

# Reiniciar os containers para usar SSL
docker-compose down
docker-compose up -d

echo "Configuração SSL concluída! Acesse https://${DOMAIN} para verificar."