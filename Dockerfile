FROM oven/bun:1-alpine

WORKDIR /app

# Copia arquivos de dependência para aproveitar o cache do Docker
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

# Inicia o servidor em modo de alta performance
CMD ["bun", "run", "preview", "--host", "0.0.0.0", "--port", "8080", "--outDir", ".output/public"]
