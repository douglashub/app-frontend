FROM nginx:1.25-alpine

RUN apk add --no-cache nodejs npm bash

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Copy build to Nginx
RUN rm -rf /usr/share/nginx/html/* && cp -r dist/* /usr/share/nginx/html/

# Copy the template that uses ${PORT}
COPY default.conf.template /etc/nginx/templates/default.conf.template

ENV PORT=8080
EXPOSE 8080

# Generate /etc/nginx/conf.d/default.conf replacing variables and start Nginx
CMD ["sh", "-c", "envsubst < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"]