# ===== STAGE 1: build =====
FROM node:20-alpine AS build

# Criar diretório de trabalho dentro do container
WORKDIR /usr/src/app

# Copiar apenas os manifests primeiro (aproveitar cache)
COPY package*.json ./

# Instalar dependências
RUN npm install

# Copiar o restante do código
COPY . .

# Gerar build de produção (Vite geralmente gera em /dist)
RUN npm run build

# ===== STAGE 2: servidor Nginx só com os arquivos estáticos =====
FROM nginx:alpine

# Copiar o build gerado para a pasta pública do Nginx
COPY --from=build /usr/src/app/dist /usr/share/nginx/html

# Expor a porta padrão do Nginx
EXPOSE 80

# Comando para subir o Nginx em foreground
CMD ["nginx", "-g", "daemon off;"]
