# -----------------------
# 1) Build Stage (Node)
# -----------------------
FROM node:20-alpine AS build

WORKDIR /app
COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build
# This creates /app/dist with your production-ready files

# -----------------------
# 2) Production Stage (Nginx)
# -----------------------
FROM nginx:1.25-alpine

# Copy your custom Nginx config into the default conf
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy the compiled files from the build stage
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
