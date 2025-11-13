# 1) Imagem base leve com Node
FROM node:20-alpine

# 2) Diretório de trabalho dentro do container
WORKDIR /usr/src/app

# 3) Copia só os manifests primeiro (melhora cache de build)
COPY package*.json ./

# 4) Instala dependências (sem dev, pensando em produção)
RUN npm install --omit=dev

# 5) Copia todo o restante do projeto para dentro da imagem
COPY . .

# 6) Define ambiente de produção (opcional, mas comum)
ENV NODE_ENV=production

# 7) Expõe a porta da API (ajusta se usar outra)
EXPOSE 3001

# 8) Comando que sobe o servidor (usa o script "start" do package.json)
CMD ["npm", "start"]
