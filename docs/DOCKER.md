# 🐳 Docker

## 1. Arquivos

| Arquivo | Função |
|---|---|
| `Dockerfile` | Build em 2 etapas: **node:20-alpine** compila o front, **nginx:1.27-alpine** serve os arquivos |
| `docker/nginx.conf` | Porta **8080**, fallback de SPA (`/agenda` etc. → `index.html`), cache de `/assets`, gzip, proxy `/api` comentado |
| `.dockerignore` | Deixa de fora `node_modules`, `.git`, `.env`, docs e banco |
| `docker-compose.yml` | Sobe `web` + `db` (PostgreSQL 16) + `migrate` (Alembic) |
| `.env.example` | Modelo das variáveis do compose |

## 2. Pré-requisito

Docker Desktop instalado e **aberto** (`docker --version` deve responder).

## 3. Só o front (imagem única)

```bash
docker build -t odontocare-web .
docker run --rm -p 8080:8080 odontocare-web
```
Abra **http://localhost:8080**. Para parar: `Ctrl + C`.

## 4. Front + banco + migração (compose)

```bash
cp .env.example .env        # edite e troque POSTGRES_PASSWORD
docker compose up -d --build
```

Ordem de subida:
1. `db` sobe e fica **healthy** (`pg_isready`).
2. `migrate` instala o Alembic, roda `alembic upgrade head` e termina (status `Exited (0)`).
3. `web` serve o front em **http://localhost:8080**.

### Verificar
```bash
docker compose ps
docker compose logs migrate         # deve terminar com "Running upgrade -> 0001"
docker compose exec db psql -U odonto -d odonto -c "\dt"
```

### Parar e limpar
```bash
docker compose down        # para (mantém o banco)
docker compose down -v     # para e APAGA o volume do banco
```

## 5. Variáveis (.env)

| Variável | Padrão | Uso |
|---|---|---|
| `POSTGRES_DB` | `odonto` | nome do banco |
| `POSTGRES_USER` | `odonto` | usuário |
| `POSTGRES_PASSWORD` | **obrigatória** | senha (o compose não sobe sem ela) |

O `.env` está no `.gitignore`. Nunca versione senhas.

## 6. Adicionar o back-end Java depois

No `docker-compose.yml` já existe o serviço `api` comentado. Ao criar o back-end:
1. Descomente o serviço `api` e ajuste o caminho do `build`.
2. Descomente o bloco `location /api/` no `docker/nginx.conf`.
3. No front, troque as chamadas do `DataContext.jsx` por `fetch('/api/...')`.

## 7. Problemas comuns

| Erro | Solução |
|---|---|
| `Cannot connect to the Docker daemon` | Abra o Docker Desktop. |
| `defina POSTGRES_PASSWORD no .env` | Crie o `.env` a partir do `.env.example`. |
| `port is already allocated` (8080 ou 5432) | Pare o que usa a porta ou troque o lado esquerdo do mapeamento (`"8081:8080"`). |
| `migrate` com erro de conexão | Veja `docker compose logs db`; o banco precisa estar healthy. |
| Rota `/agenda` dá 404 após F5 | Confira se o `nginx.conf` foi copiado (fallback `try_files`). |
