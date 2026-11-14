# 🦷 OdontoCare — Sistema de Agendamento para Clínica Odontológica

Projeto Integrador IV — Engenharia de Software (UNIVILLE)
Autor: **Vitor Renner**

Front-end completo de um sistema de agendamento para clínica odontológica, feito em **React + Vite**, com animações (Framer Motion), sidebar recolhível, tema claro/escuro e todas as telas funcionando. O banco de dados já tem a **migração inicial** pronta (Alembic + SQL para Flyway), preparando a ligação com um futuro back-end em **Java**.

![React](https://img.shields.io/badge/React-18-61dafb) ![Vite](https://img.shields.io/badge/Vite-5-646cff) ![Docker](https://img.shields.io/badge/Docker-ready-2496ed) ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791)

---

## ✨ Principais funcionalidades

| Tela | O que faz |
|---|---|
| **Login** | Acesso com validação e animação de erro |
| **Dashboard** | Indicadores do dia/mês, consultas de hoje com ações rápidas, gráficos |
| **Agenda** | Grade semanal por horário, cor por dentista, clique para agendar/editar |
| **Agendamentos** | Lista completa com filtros, busca, ordenação, status e exportação CSV |
| **Pacientes** | Cadastro com máscara/validação de CPF, histórico de consultas |
| **Dentistas** | Cadastro com CRO, especialidade, cor na agenda, ativar/desativar |
| **Procedimentos** | Tabela de serviços com duração e valor |
| **Configurações** | Horário de funcionamento, sábado, backup/restauração |

Detalhes completos em **[docs/FUNCIONALIDADES.md](docs/FUNCIONALIDADES.md)**.

---

## 🚀 Rodar rápido

```bash
npm install
npm run dev
```

Abra **http://localhost:5173** e entre com `admin@odonto.com` / `123456`.

Outras formas (Docker, banco, migrações): **[docs/COMO_RODAR.md](docs/COMO_RODAR.md)**.

---

## 🧱 Tecnologias

- **React 18** + **Vite 5** — interface e servidor de desenvolvimento
- **React Router 6** — navegação entre telas
- **Framer Motion** — animações (transições, sidebar, modais, toasts, contadores)
- **Lucide React** — ícones
- **CSS puro** com variáveis (tema claro/escuro, responsivo)
- **Docker + nginx** — imagem de produção do front
- **PostgreSQL 16** + **Alembic** — banco e migrações (SQL compatível com Flyway/Java)

---

## 📁 Estrutura

```
Sistema-clinica/
├── src/
│   ├── main.jsx              # ponto de entrada (providers + router)
│   ├── App.jsx               # rotas e transições de página
│   ├── utils.js              # datas, máscaras, CPF, formatação
│   ├── styles.css            # estilo global, tema claro/escuro
│   ├── context/              # estado global
│   │   ├── AuthContext.jsx   # login/logout
│   │   ├── DataContext.jsx   # dados + regras (conflito de horário) + localStorage
│   │   └── ToastContext.jsx  # notificações
│   ├── components/
│   │   ├── Layout.jsx        # sidebar + topbar
│   │   ├── Modal.jsx         # modal e confirmação
│   │   ├── AppointmentModal.jsx  # formulário de agendamento
│   │   └── UI.jsx            # badge, campo, contador, estado vazio
│   └── pages/                # uma tela por arquivo
├── database/
│   ├── alembic.ini
│   ├── migrations/versions/  # migração inicial (0001)
│   └── sql/V1__schema_inicial.sql   # mesmo schema em SQL (Flyway)
├── docker/nginx.conf
├── Dockerfile
├── docker-compose.yml
├── cloudbuild.yaml           # deploy no Google Cloud Run
└── docs/                     # toda a documentação
```

---

## 🗺️ Próximos passos

- [ ] Back-end em Java (Spring Boot) usando o schema em `database/`
- [ ] Trocar o `localStorage` por chamadas à API (só o `DataContext.jsx` muda)
- [ ] Login real com JWT e senha em BCrypt
- [ ] Lembrete de consulta por WhatsApp/e-mail

---

## 📄 Documentação

Toda a documentação está na pasta **[docs/](docs/)**:

| Documento | Conteúdo |
|---|---|
| [COMO_RODAR.md](docs/COMO_RODAR.md) | Passo a passo para rodar (npm, IntelliJ, Docker, Alembic) |
| [FUNCIONALIDADES.md](docs/FUNCIONALIDADES.md) | Todas as funcionalidades do front |
| [TESTES.md](docs/TESTES.md) | Roteiro de testes funcionais (87 casos) |
| [ARQUITETURA.md](docs/ARQUITETURA.md) | Camadas, fluxo de dados e API planejada |
| [BANCO_DE_DADOS.md](docs/BANCO_DE_DADOS.md) | Diagrama, tabelas e regras do banco |
| [DOCKER.md](docs/DOCKER.md) | Imagem, compose e variáveis |
| [DEPLOY_GCP.md](docs/DEPLOY_GCP.md) | Publicação no Google Cloud Run |
| [DESENVOLVIMENTO.md](docs/DESENVOLVIMENTO.md) | Como o projeto foi feito e a ordem dos arquivos |
