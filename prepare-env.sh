#!/bin/bash

# Script to prepare environment for production
# This runs in the Docker container before starting NGINX

# Replace placeholder in NGINX config with actual API URL
if [ -n "$VITE_API_URL" ]; then
  sed -i "s|\${API_URL}|$VITE_API_URL|g" /etc/nginx/conf.d/default.conf
else
  sed -i "s|\${API_URL}|https://api.micasan.com.br|g" /etc/nginx/conf.d/default.conf
fi

# Start NGINX
exec "$@"