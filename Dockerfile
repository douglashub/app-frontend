# 1) Build Stage (Node)
FROM node:20-alpine AS build

WORKDIR /app
COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build
# → Compiles static files into /app/dist

# 2) Final Stage (Nginx)
FROM nginx:1.25-alpine

# Copy your template
COPY default.conf.template /etc/nginx/templates/default.conf.template

# Copy compiled build output
COPY --from=build /app/dist /usr/share/nginx/html

ENV PORT=8080
EXPOSE 8080

# Use envsubst to inject $PORT into the template, then start Nginx
CMD ["sh", "-c", "envsubst < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"]
