FROM oven/bun:1-alpine

WORKDIR /app

# Copia dependências
COPY package.json bun.lock* ./
RUN bun install

# Copia o código do projeto
COPY . .

# Gera o build de produção
RUN bun run build

# Configuração de portas e ambiente
ENV NODE_ENV=production
ENV PORT=8080

EXPOSE 8080

# Inicia o servidor com suporte completo a SSR, CSS, imagens e arquivos estáticos
CMD ["bun", "server.prod.js"]
