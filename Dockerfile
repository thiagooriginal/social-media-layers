FROM oven/bun:1-alpine

WORKDIR /app

# Copia arquivos de dependência para aproveitar o cache do Docker
COPY package.json bun.lock* ./
RUN bun install

# Copia o código do projeto
COPY . .

# Gera o build de produção
RUN bun run build

# Configuração de portas e ambiente para Nitro / TanStack Start
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=8080
ENV NITRO_HOST=0.0.0.0
ENV NITRO_PORT=8080

EXPOSE 8080

# Inicia o servidor Nitro de produção
CMD ["bun", ".output/server/index.mjs"]
