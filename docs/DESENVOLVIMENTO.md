# 🛠️ Como o projeto foi desenvolvido

**Autor:** Vitor Renner — Engenharia de Software, UNIVILLE
**Disciplina:** Projeto Integrador IV — Vivências
**Período:** novembro de 2026

Este documento conta como montei o OdontoCare, em que ordem os arquivos foram criados e por que cada decisão foi tomada.

---

## 1. Objetivo

Construir o front-end de um **sistema de agendamento para clínica odontológica** que fosse:
- **100% funcional** sem depender de back-end (para ser apresentado e testado desde já);
- **bonito e moderno**, com animações e sidebar;
- **fácil de ligar a um back-end Java** depois.

## 2. Decisões técnicas

| Decisão | Motivo |
|---|---|
| **React + Vite** | Vite liga em menos de 1 s e atualiza a página ao salvar (hot reload). |
| **React Router** | Cada tela tem sua URL (`/agenda`, `/pacientes`…). |
| **Context API** em vez de Redux | O estado é pequeno; Context resolve sem biblioteca extra. |
| **localStorage** como "banco" | Deixa o front funcional e testável antes da API existir. |
| **Toda a regra de dados num só arquivo** (`DataContext.jsx`) | Na integração com o back-end só esse arquivo muda; as telas continuam iguais. |
| **Framer Motion** | Animações declarativas (entrada/saída de componentes, layout animado). |
| **CSS puro com variáveis** | Tema claro/escuro trocando só as variáveis; sem configurar Tailwind. |
| **Alembic** para a migração inicial | Migração versionada, com `upgrade` e `downgrade`, independente do back-end. |
| **SQL gerado para Flyway** | O back-end Java (Spring Boot) usa Flyway; o mesmo schema serve aos dois. |
| **Docker multi-stage + nginx** | Imagem final pequena, só com os arquivos estáticos. |
| **Cloud Run** | Roda o container com URL pública e escala a zero (custo baixo). |

## 3. Ordem de construção dos arquivos

Segui a ordem "de baixo para cima": primeiro a base e os dados, depois os componentes reutilizáveis, depois as telas, e por último infraestrutura e documentação.

### Etapa 1 — Base do projeto
| # | Arquivo | O que faz |
|---|---|---|
| 1 | `package.json` | Dependências e scripts (`dev`, `build`, `preview`) |
| 2 | `vite.config.js` | Configuração do Vite com o plugin React |
| 3 | `index.html` | Página única, fonte Plus Jakarta Sans, ícone 🦷 |
| 4 | `src/main.jsx` | Liga React + Router + os três providers |
| 5 | `src/App.jsx` | Rotas, rota protegida e transição entre páginas |
| 6 | `src/utils.js` | Funções puras: datas, máscaras, validação de CPF, moeda, status |

### Etapa 2 — Estado global (contexts)
| # | Arquivo | O que faz |
|---|---|---|
| 7 | `src/context/AuthContext.jsx` | Login, logout e sessão salva |
| 8 | `src/context/ToastContext.jsx` | Notificações animadas |
| 9 | `src/context/DataContext.jsx` | Dados de exemplo, CRUD genérico, **detecção de conflito de horário**, backup e persistência |

### Etapa 3 — Componentes reutilizáveis
| # | Arquivo | O que faz |
|---|---|---|
| 10 | `src/components/Layout.jsx` | Sidebar animada/recolhível, gaveta mobile, topbar, busca, sino, tema |
| 11 | `src/components/Modal.jsx` | Modal com animação de mola + diálogo de confirmação |
| 12 | `src/components/UI.jsx` | Badge de status, campo de formulário, contador animado, estado vazio |
| 13 | `src/components/AppointmentModal.jsx` | Formulário de agendamento com grade de horários livres e todas as validações |

### Etapa 4 — Telas
| # | Arquivo | O que faz |
|---|---|---|
| 14 | `src/pages/Login.jsx` | Tela de entrada |
| 15 | `src/pages/Dashboard.jsx` | Indicadores, consultas do dia, gráficos |
| 16 | `src/pages/Agenda.jsx` | Calendário semanal |
| 17 | `src/pages/Agendamentos.jsx` | Lista com filtros e exportação CSV |
| 18 | `src/pages/Pacientes.jsx` | Cadastro e histórico |
| 19 | `src/pages/Dentistas.jsx` | Cadastro e cor na agenda |
| 20 | `src/pages/Procedimentos.jsx` | Tabela de serviços |
| 21 | `src/pages/Configuracoes.jsx` | Expediente e backup |

### Etapa 5 — Visual
| # | Arquivo | O que faz |
|---|---|---|
| 22 | `src/styles.css` | Todo o estilo: variáveis de tema, layout, calendário, responsivo |

### Etapa 6 — Banco de dados
| # | Arquivo | O que faz |
|---|---|---|
| 23 | `database/alembic.ini` | Configuração do Alembic (sem credenciais) |
| 24 | `database/migrations/env.py` | Lê `DATABASE_URL` do ambiente ou do `.env` |
| 25 | `database/migrations/versions/20261114_0001_schema_inicial.py` | Cria as 6 tabelas + dados iniciais |
| 26 | `database/sql/V1__schema_inicial.sql` | Mesmo schema em SQL para o Flyway |
| 27 | `database/requirements.txt` / `.env.example` | Dependências e modelo de conexão |

### Etapa 7 — Infraestrutura
| # | Arquivo | O que faz |
|---|---|---|
| 28 | `Dockerfile` | Build com Node e entrega com nginx |
| 29 | `docker/nginx.conf` | Porta 8080, fallback de SPA, cache, gzip |
| 30 | `.dockerignore` | O que não entra na imagem |
| 31 | `docker-compose.yml` | Front + PostgreSQL + migração automática |
| 32 | `cloudbuild.yaml` | Build e deploy no Google Cloud Run |
| 33 | `.gitignore` / `.env.example` | Proteção de dados sensíveis |

### Etapa 8 — Documentação
| # | Arquivo |
|---|---|
| 34 | `README.md` (raiz, página do GitHub) |
| 35 | `docs/COMO_RODAR.md` |
| 36 | `docs/FUNCIONALIDADES.md` |
| 37 | `docs/ARQUITETURA.md` |
| 38 | `docs/BANCO_DE_DADOS.md` |
| 39 | `docs/DOCKER.md` |
| 40 | `docs/DEPLOY_GCP.md` |
| 41 | `docs/TESTES.md` |
| 42 | `docs/DESENVOLVIMENTO.md` (este arquivo) |

## 4. Problemas encontrados e soluções

| Problema | Solução |
|---|---|
| Página em branco ao rodar pelo IntelliJ | Estava rodando `preview` (porta 4173), que exige build. O certo é `dev` (porta 5173). |
| Texto digitado por engano no `package.json` quebrou o JSON | Corrigido e validado com `JSON.parse`. |
| Consultas de dentistas diferentes no mesmo horário se sobrepondo na agenda | Os blocos são divididos em colunas lado a lado. |
| Agenda abrindo numa semana já passada no fim de semana | No sábado/domingo sem expediente, a agenda abre na semana seguinte. |
| Primeiro horário cortado no topo do calendário | Ajuste de posição só no primeiro rótulo. |
| `git push` sem destino | Criado o repositório `VitorRenner/clinic-system` e configurado o `origin`. |
| Cloud Run exige a porta 8080 | O nginx passou a escutar na 8080. |

## 5. Como validei

- Build de produção (`npm run build`) sem erros nem avisos.
- Navegação por todas as telas sem erros no console.
- Fluxo de criar agendamento testado de ponta a ponta, incluindo as validações (sábado, horário vazio, conflito).
- Migração Alembic testada com `upgrade` e `downgrade` e geração de SQL para PostgreSQL.
- Roteiro completo de testes manuais em [TESTES.md](TESTES.md).

## 6. Próximos passos

1. Back-end Java (Spring Boot + Spring Data JPA + Flyway) usando o schema de `database/`.
2. Trocar as funções do `DataContext.jsx` por chamadas `fetch` à API.
3. Autenticação real com JWT e senha em BCrypt.
4. Testes automatizados (Vitest + Testing Library no front; JUnit no back).
5. Lembretes de consulta por WhatsApp/e-mail.
