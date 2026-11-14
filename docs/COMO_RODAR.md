# ▶️ Como rodar o OdontoCare

> Comandos executados na **raiz do projeto** (pasta `Sistema-clinica`).

Existem 3 jeitos. Para testar o front, o **jeito 1** basta.

---

## Jeito 1 — Só o front (desenvolvimento)

**Precisa ter:** Node.js 18 ou mais novo (`node -v` para conferir).

```bash
npm install      # instala as dependências (só na primeira vez)
npm run dev      # liga o servidor
```

Abra **http://localhost:5173**.

**Login:** `admin@odonto.com` / `123456` (ou clique na caixa "Acesso demo" na tela de login).

> O servidor do Vite funciona como um *live server*: ao salvar qualquer arquivo, a página atualiza sozinha.
> Para parar: `Ctrl + C` no terminal.

### Pelo IntelliJ
1. Abra o `package.json`.
2. Clique na setinha verde ▶ da linha `"dev": "vite"` → **Run 'dev'**.
3. ⌘ + clique no link `http://localhost:5173/` que aparece no painel de baixo.

> ⚠️ Não use a setinha do `"preview"`: ela só serve a versão compilada (`npm run build`) e abre em branco se o build não existir.

### Outros comandos
| Comando | O que faz |
|---|---|
| `npm run build` | gera a versão de produção em `dist/` |
| `npm run preview` | serve a pasta `dist/` em http://localhost:4173 |

---

## Jeito 2 — Docker (front + banco PostgreSQL)

**Precisa ter:** Docker Desktop aberto.

```bash
cp .env.example .env          # depois edite o .env e troque a senha
docker compose up -d --build
```

| Serviço | Endereço | O que é |
|---|---|---|
| `web` | http://localhost:8080 | front compilado servido pelo nginx |
| `db` | localhost:5432 | PostgreSQL 16 |
| `migrate` | — | roda `alembic upgrade head` uma vez e termina |

Comandos úteis:
```bash
docker compose ps             # ver o que está rodando
docker compose logs migrate   # ver se a migração passou
docker compose down           # parar tudo
docker compose down -v        # parar e APAGAR o banco
```

---

## Jeito 3 — Só as migrações do banco (Alembic)

Para aplicar o schema num PostgreSQL que você já tem:

```bash
cd database
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env          # ajuste DATABASE_URL
alembic upgrade head          # cria as tabelas
```

| Comando | O que faz |
|---|---|
| `alembic current` | mostra a versão aplicada |
| `alembic history` | lista as migrações |
| `alembic downgrade -1` | desfaz a última |
| `alembic upgrade head --sql` | só mostra o SQL, sem executar |
| `alembic revision -m "descricao"` | cria uma nova migração |

### Para o back-end em Java
O arquivo `database/sql/V1__schema_inicial.sql` tem o mesmo schema em SQL puro. Copie para
`src/main/resources/db/migration/` do projeto Spring Boot e o **Flyway** aplica sozinho.

---

## Jeito 4 — Google Cloud

Veja [DEPLOY_GCP.md](DEPLOY_GCP.md).

---

## 🔒 Dados sensíveis

- Senhas e URLs de banco ficam **só** no `.env` (que está no `.gitignore`).
- Os arquivos `.env.example` são modelos sem senha real — esses vão para o git.
- Backups exportados pelo sistema (`backup-odonto-*.json`) e CSVs de agendamentos contêm dados de pacientes e também são ignorados pelo git.

---

## 🧯 Problemas comuns

| Sintoma | Solução |
|---|---|
| Página em branco em `localhost:4173` | Você rodou `preview`. Pare (■) e rode `dev`. |
| `command not found: npm` | Instale o Node.js (nodejs.org). |
| Porta 5173 ocupada | O Vite usa a próxima livre (5174…). Veja o link no terminal. |
| Dados "sumiram" | Ficam no navegador. Em outro navegador/aba anônima começam do zero. Use **Configurações → Exportar backup**. |
| Quero os dados de exemplo de volta | **Configurações → Restaurar dados de exemplo**. |
| `DATABASE_URL` não definida | Crie `database/.env` a partir do `.env.example`. |
