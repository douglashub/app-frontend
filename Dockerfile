# -----------------------
# 1) Build Stage (Node)
# -----------------------
    FROM node:20-alpine AS build

    WORKDIR /app
    COPY package*.json ./
    RUN npm install
    
    COPY . .
    RUN npm run build
    # This creates /app/dist with the production-ready files
    
    # -----------------------
    # 2) Production Stage (Nginx)
    # -----------------------
    FROM nginx:1.25-alpine
    
    # Copy a templated nginx config that uses $PORT
    COPY default.conf.template /etc/nginx/templates/default.conf.template
    
    # Copy compiled files from the build stage
    COPY --from=build /app/dist /usr/share/nginx/html
    
    # By default, we’ll listen on port 8080, though
    # Cloud Run or other PaaS can override this
    ENV PORT=8080
    
    EXPOSE 8080
    CMD ["sh", "-c", "envsubst < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"]
    