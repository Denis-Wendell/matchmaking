# ===== STAGE 1: BUILD =====
FROM node:20-alpine AS build

WORKDIR /usr/src/app

# Copiar apenas o package.json para aproveitar cache
COPY package*.json ./

# Instalar dependências
RUN npm install

# Copiar o restante do código
COPY . .

# Gerar build de produção
RUN npm run build

# ===== STAGE 2: NGINX SERVING STATIC FILES =====
FROM nginx:alpine

# Copiar o build gerado para a pasta de conteúdo estático
COPY --from=build /usr/src/app/dist /usr/share/nginx/html

# Copiar configuração customizada do Nginx (ESSENCIAL!)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
