# ✅ Testes Funcionais

Roteiro de testes manuais do front-end. Cada caso tem pré-condição, passos e resultado esperado.
Antes de começar: **Configurações → Restaurar dados de exemplo**, para partir da mesma base.

**Legenda:** ✅ passou · ❌ falhou · ⏭️ não testado

| Ambiente | Valor |
|---|---|
| URL | http://localhost:5173 |
| Navegador | Chrome / Safari (última versão) |
| Login | `admin@odonto.com` / `123456` |

---

## 1. Autenticação

| ID | Caso | Passos | Resultado esperado | Status |
|---|---|---|---|---|
| AUT-01 | Login válido | Preencher e-mail e senha de demo → Entrar | Vai para o Dashboard; toast "Bem-vindo(a) de volta!" | ✅ |
| AUT-02 | Login inválido | Senha `000000` → Entrar | Cartão treme; toast vermelho "E-mail ou senha inválidos" | ✅ |
| AUT-03 | Preencher demo | Clicar na caixa "Acesso demo" | Campos preenchidos | ✅ |
| AUT-04 | Mostrar senha | Clicar no 👁 | Senha fica visível / oculta | ✅ |
| AUT-05 | Sessão mantida | Logar → F5 | Continua logado | ✅ |
| AUT-06 | Rota protegida | Sair → abrir `/agenda` | Redireciona para `/login` | ✅ |
| AUT-07 | Logout | Sidebar → Sair | Volta para o login | ✅ |

## 2. Layout e navegação

| ID | Caso | Passos | Resultado esperado | Status |
|---|---|---|---|---|
| LAY-01 | Navegar pelo menu | Clicar em cada item da sidebar | Página muda com animação; destaque desliza até o item | ✅ |
| LAY-02 | Recolher sidebar | Clicar « no rodapé | Sidebar só com ícones; após F5 continua recolhida | ✅ |
| LAY-03 | Tema escuro | Clicar 🌙 na topbar | Tema escuro; após F5 continua escuro | ✅ |
| LAY-04 | Busca global | Digitar "Juliana" na topbar → Enter | Abre Pacientes filtrado | ⏭️ |
| LAY-05 | Sino | Com consulta "agendada" hoje, clicar 🔔 | Abre Agendamentos filtrado (hoje + agendado) | ⏭️ |
| LAY-06 | Mobile | Reduzir janela < 860 px → ☰ | Sidebar abre como gaveta; fecha ao tocar fora | ⏭️ |
| LAY-07 | Toast | Qualquer ação de salvar | Toast aparece e some em ~3,5 s | ✅ |

## 3. Dashboard

| ID | Caso | Passos | Resultado esperado | Status |
|---|---|---|---|---|
| DSH-01 | Indicadores | Abrir Dashboard | 4 cards com contagem animada | ✅ |
| DSH-02 | Faturamento | Concluir uma consulta de R$ 180 | Faturamento do mês aumenta R$ 180 | ⏭️ |
| DSH-03 | Comparecimento | Marcar "Faltou" numa consulta | Percentual diminui | ⏭️ |
| DSH-04 | Ações rápidas | Numa consulta de hoje: Confirmar → Concluir | Status muda; botões somem ao concluir | ⏭️ |
| DSH-05 | Gráfico semanal | Abrir Dashboard | Barras animadas; dia atual em roxo | ✅ |
| DSH-06 | Card clicável | Clicar em "Pacientes" | Vai para Pacientes | ⏭️ |

## 4. Agenda

| ID | Caso | Passos | Resultado esperado | Status |
|---|---|---|---|---|
| AGE-01 | Exibir semana | Abrir Agenda | Grade com dias e horários; consultas coloridas por dentista | ✅ |
| AGE-02 | Navegar semanas | ▶ / ◀ / Hoje | Semana muda deslizando | ⏭️ |
| AGE-03 | Agendar pelo horário vazio | Clicar num horário livre de dia futuro | Modal abre com data e hora preenchidas | ⏭️ |
| AGE-04 | Editar pelo bloco | Clicar numa consulta | Modal de edição abre | ⏭️ |
| AGE-05 | Dia passado | Clicar num horário de dia passado | Nada acontece | ⏭️ |
| AGE-06 | Filtro por dentista | Clicar no nome na legenda | Só as consultas daquele dentista | ⏭️ |
| AGE-07 | Linha do agora | Em dia útil, no expediente | Linha vermelha no horário atual | ⏭️ |
| AGE-08 | Duração | Ver consulta de Canal (90 min) | Bloco 3× maior que um de 30 min | ✅ |

## 5. Agendamento (formulário) — regras de negócio

| ID | Caso | Passos | Resultado esperado | Status |
|---|---|---|---|---|
| AGD-01 | Criar válido | Paciente + dentista + procedimento + dia útil futuro + horário livre → Agendar | Toast de sucesso; aparece na lista e na agenda | ✅ |
| AGD-02 | Campos obrigatórios | Agendar sem preencher | Erros em vermelho em cada campo | ✅ |
| AGD-03 | Horário não escolhido | Preencher tudo menos horário | "Selecione um horário" | ✅ |
| AGD-04 | Domingo | Escolher um domingo | "A clínica não abre aos domingos" | ⏭️ |
| AGD-05 | Sábado fechado | Sábado com "Atende aos sábados" desligado | "A clínica não abre aos sábados" | ✅ |
| AGD-06 | Data passada | Escolher ontem (novo agendamento) | "Não é possível agendar no passado" | ⏭️ |
| AGD-07 | Conflito do dentista | Mesmo dentista, mesmo horário de outra consulta | Horário aparece riscado/bloqueado | ⏭️ |
| AGD-08 | Conflito do paciente | Mesmo paciente com outro dentista no mesmo horário | Horário bloqueado | ⏭️ |
| AGD-09 | Sobreposição pela duração | Canal (90 min) às 09:00 e tentar 10:00 com o mesmo dentista | 10:00 bloqueado | ⏭️ |
| AGD-10 | Fim do expediente | Procedimento de 90 min | Horários que passariam das 18:00 não aparecem | ⏭️ |
| AGD-11 | Cancelado libera horário | Cancelar uma consulta → novo agendamento no mesmo horário | Horário disponível | ⏭️ |
| AGD-12 | Resumo | Escolher procedimento + horário | Mostra início, fim e valor | ✅ |
| AGD-13 | Dentista inativo | Desativar dentista → novo agendamento | Dentista não aparece na lista | ⏭️ |

## 6. Lista de agendamentos

| ID | Caso | Passos | Resultado esperado | Status |
|---|---|---|---|---|
| LIS-01 | Busca | Digitar "Canal" | Só consultas de Canal | ⏭️ |
| LIS-02 | Filtro período | "Hoje", "Esta semana", "Futuros" | Lista filtra corretamente | ⏭️ |
| LIS-03 | Chips de status | Clicar "Concluído" | Só concluídas; contador bate | ⏭️ |
| LIS-04 | Ordenar | Clicar em "Valor" duas vezes | Ordena crescente e depois decrescente | ⏭️ |
| LIS-05 | Mudar status | Linha "agendado" → ✅ | Vira "Concluído" | ⏭️ |
| LIS-06 | Excluir | 🗑 → Excluir | Confirmação; linha some com animação | ⏭️ |
| LIS-07 | CSV | Clicar CSV | Baixa `agendamentos-AAAA-MM-DD.csv`; abre no Excel com acentos | ⏭️ |
| LIS-08 | Total previsto | Filtrar um dentista | Total soma só não-cancelados do filtro | ⏭️ |

## 7. Pacientes

| ID | Caso | Passos | Resultado esperado | Status |
|---|---|---|---|---|
| PAC-01 | Cadastrar válido | Nome, CPF `529.982.247-25`… (CPF novo válido), telefone | Card aparece | ⏭️ |
| PAC-02 | Máscaras | Digitar `52998224725` e `47999999999` | Vira `529.982.247-25` e `(47) 99999-9999` | ⏭️ |
| PAC-03 | CPF inválido | `111.111.111-11` | "CPF inválido" | ⏭️ |
| PAC-04 | CPF duplicado | CPF de paciente existente | "CPF já cadastrado" | ⏭️ |
| PAC-05 | E-mail inválido | `abc@` | "E-mail inválido" | ⏭️ |
| PAC-06 | Nascimento futuro | Data de amanhã | "Data futura" | ⏭️ |
| PAC-07 | Editar | ✏️ → mudar telefone → Salvar | Card atualizado | ⏭️ |
| PAC-08 | Histórico | 🕘 num paciente | Linha do tempo com as consultas | ⏭️ |
| PAC-09 | Agendar pelo card | "Agendar" | Modal com o paciente já selecionado | ⏭️ |
| PAC-10 | Excluir em cascata | Excluir paciente com consultas | Consultas dele somem da lista | ⏭️ |
| PAC-11 | Busca por CPF | Digitar só números do CPF | Paciente encontrado | ⏭️ |

## 8. Dentistas

| ID | Caso | Passos | Resultado esperado | Status |
|---|---|---|---|---|
| DEN-01 | Cadastrar | Nome, CRO novo, especialidade, cor | Card com a cor escolhida | ⏭️ |
| DEN-02 | CRO duplicado | CRO existente | "CRO já cadastrado" | ⏭️ |
| DEN-03 | Desativar | Botão Desativar | Card acinzentado; toast | ⏭️ |
| DEN-04 | Cor na agenda | Mudar a cor → abrir Agenda | Consultas com a nova cor | ⏭️ |
| DEN-05 | Excluir | Excluir dentista | Consultas dele removidas | ⏭️ |

## 9. Procedimentos

| ID | Caso | Passos | Resultado esperado | Status |
|---|---|---|---|---|
| PRO-01 | Cadastrar | Nome, 45 min, R$ 200 | Linha na tabela | ⏭️ |
| PRO-02 | Valor vazio | Salvar sem valor | "Valor inválido" | ⏭️ |
| PRO-03 | Excluir em uso | Excluir "Avaliação" | Toast "Há agendamentos usando este procedimento" | ⏭️ |
| PRO-04 | Excluir livre | Excluir o recém-criado | Removido | ⏭️ |

## 10. Configurações

| ID | Caso | Passos | Resultado esperado | Status |
|---|---|---|---|---|
| CFG-01 | Nome da clínica | Trocar → Salvar | Sidebar mostra o novo nome | ⏭️ |
| CFG-02 | Horário inválido | Abertura 18:00, fechamento 08:00 | Erro "Abertura deve ser antes do fechamento" | ⏭️ |
| CFG-03 | Sábado | Ligar "Atende aos sábados" | Agenda mostra sábado; agendamento no sábado permitido | ⏭️ |
| CFG-04 | Intervalo | Mudar para 15 min | Agenda e botões de horário de 15 em 15 | ⏭️ |
| CFG-05 | Exportar backup | Exportar | Baixa `backup-odonto-AAAA-MM-DD.json` | ⏭️ |
| CFG-06 | Importar backup | Alterar dados → Importar o arquivo exportado | Dados voltam ao estado do backup | ⏭️ |
| CFG-07 | Importar inválido | Importar um .json qualquer | "Arquivo de backup inválido" | ⏭️ |
| CFG-08 | Restaurar exemplo | Restaurar → confirmar | Base de demonstração volta | ⏭️ |

## 11. Persistência

| ID | Caso | Passos | Resultado esperado | Status |
|---|---|---|---|---|
| PER-01 | Recarregar | Criar paciente → F5 | Paciente continua lá | ⏭️ |
| PER-02 | Fechar navegador | Fechar e abrir de novo | Dados mantidos | ⏭️ |

## 12. Build e infraestrutura

| ID | Caso | Comando | Resultado esperado | Status |
|---|---|---|---|---|
| INF-01 | Build de produção | `npm run build` | Sem erros; pasta `dist/` gerada | ✅ |
| INF-02 | Migração sobe | `alembic upgrade head` | 6 tabelas criadas | ✅ |
| INF-03 | Migração desce | `alembic downgrade base` | Tabelas removidas | ✅ |
| INF-04 | SQL Postgres | `alembic upgrade head --sql` | SQL gerado sem erro | ✅ |
| INF-05 | Imagem Docker | `docker build -t odontocare-web .` | Imagem criada | ⏭️ |
| INF-06 | Compose | `docker compose up -d --build` | `web` em 8080, `migrate` Exited (0) | ⏭️ |
| INF-07 | Rota SPA no nginx | Abrir `localhost:8080/agenda` e dar F5 | Página carrega (sem 404) | ⏭️ |
| INF-08 | Cloud Run | `gcloud builds submit --config cloudbuild.yaml` | URL pública funcionando | ⏭️ |

---

## Resumo da execução

| Módulo | Casos | ✅ | ❌ | ⏭️ |
|---|---|---|---|---|
| Autenticação | 7 | 7 | 0 | 0 |
| Layout | 7 | 4 | 0 | 3 |
| Dashboard | 6 | 2 | 0 | 4 |
| Agenda | 8 | 2 | 0 | 6 |
| Agendamento | 13 | 5 | 0 | 8 |
| Lista | 8 | 0 | 0 | 8 |
| Pacientes | 11 | 0 | 0 | 11 |
| Dentistas | 5 | 0 | 0 | 5 |
| Procedimentos | 4 | 0 | 0 | 4 |
| Configurações | 8 | 0 | 0 | 8 |
| Persistência | 2 | 0 | 0 | 2 |
| Infraestrutura | 8 | 4 | 0 | 4 |
| **Total** | **87** | **24** | **0** | **63** |

> Atualize a coluna **Status** conforme for executando os casos. Para apresentar, vale anexar prints dos principais (AGD-01, AGD-07, PAC-03, LIS-07).
