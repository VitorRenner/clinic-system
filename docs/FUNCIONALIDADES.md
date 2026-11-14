# 📋 Funcionalidades do Front-end — OdontoCare

Documento das funcionalidades implementadas no front-end do sistema de agendamento.
Todas as telas estão funcionando; os dados ficam salvos no navegador (`localStorage`) até a integração com o back-end.

---

## 1. Visão geral

| Item | Descrição |
|---|---|
| Tipo | SPA (Single Page Application) |
| Telas | Login, Dashboard, Agenda, Agendamentos, Pacientes, Dentistas, Procedimentos, Configurações |
| Persistência | `localStorage` do navegador (chave `odonto:data:v1`) |
| Responsivo | Desktop, tablet e celular |
| Tema | Claro e escuro (lembra a escolha) |
| Animações | Transição entre páginas, sidebar, modais, toasts, contadores, gráficos, listas |

---

## 2. Login

- Formulário com e-mail e senha, com ícones e botão de mostrar/ocultar senha.
- Usuário de demonstração: `admin@odonto.com` / `123456`. Clicar na caixa "Acesso demo" preenche os campos.
- Login errado: o cartão **treme** e aparece um aviso vermelho.
- Spinner de carregamento ao entrar.
- Fundo com bolhas coloridas animadas.
- A sessão fica salva: ao recarregar a página continua logado.
- Rotas internas são protegidas: sem login, qualquer endereço volta para `/login`.

## 3. Layout geral

### Sidebar
- Menu com 7 itens e ícones.
- O item ativo tem um destaque com gradiente que **desliza** até o item clicado.
- **Recolhível** no desktop (botão « no rodapé): vira uma barra só de ícones. A escolha fica salva.
- No celular vira uma **gaveta** que abre pelo botão ☰ e fecha ao tocar fora.
- Badge vermelho em "Agendamentos" com o número de consultas de hoje ainda não confirmadas.
- Rodapé com o usuário logado e o botão **Sair**.

### Topbar
- Título da página atual (animado ao trocar).
- **Busca de paciente**: digite e aperte Enter para abrir Pacientes já filtrado.
- **Sino**: mostra quantas consultas de hoje estão pendentes e abre a lista filtrada.
- **Botão de tema** (lua/sol) com animação de rotação.

### Notificações (toasts)
- Aparecem no canto inferior direito após cada ação (salvar, excluir, erro).
- Cores por tipo: sucesso (verde), erro (vermelho), informação (azul).
- Barra de tempo e fechamento automático em 3,5 s, ou pelo ✕.

## 4. Dashboard

- Saudação conforme o horário ("Bom dia / Boa tarde / Boa noite") e a data por extenso.
- **4 indicadores** com número animado (conta de 0 até o valor):
  - Consultas hoje (clicável → Agenda)
  - Total de pacientes (clicável → Pacientes)
  - Faturamento do mês (soma das consultas **concluídas**)
  - Taxa de comparecimento (concluídas ÷ concluídas + faltas)
- **Consultas de hoje**: lista por horário com paciente, procedimento, dentista e status. Botões rápidos:
  - 📅 Confirmar presença
  - ✅ Concluir
  - ❌ Marcar falta
- **Gráfico de barras** das consultas da semana (o dia atual em destaque).
- **Atendimentos por dentista** no mês, com barras de progresso na cor de cada dentista.
- Botão **Novo agendamento**.

## 5. Agenda (calendário semanal)

- Grade com os dias da semana (segunda a sexta, ou até sábado se a clínica atender) e os horários de funcionamento.
- Navegação: ◀ semana anterior, **Hoje**, ▶ próxima semana, ou escolher uma data. A troca de semana desliza para o lado.
- Num fim de semana sem expediente, a agenda já abre na semana seguinte.
- Cada consulta é um bloco:
  - na **cor do dentista**;
  - com **altura proporcional à duração** do procedimento;
  - lado a lado quando dois dentistas atendem no mesmo horário;
  - ✓ quando confirmada, riscada quando o paciente faltou.
- **Clicar num horário vazio** abre o agendamento já com dia e hora preenchidos.
- **Clicar numa consulta** abre a edição.
- Linha vermelha marcando **o horário atual** no dia de hoje.
- Dias passados aparecem hachurados e não aceitam novos agendamentos.
- Legenda com os dentistas: clicar filtra a agenda por dentista.

## 6. Agendamentos (lista)

- Tabela com data/hora, paciente (com telefone), dentista, procedimento (com duração), valor e status.
- **Busca** por paciente, dentista ou procedimento.
- **Filtros**: período (hoje, semana, mês, futuros, todos) e dentista.
- **Chips de status** com contador: Todos, Agendado, Confirmado, Concluído, Cancelado, Faltou.
- **Ordenação** clicando no cabeçalho: data, paciente, valor, status (↑/↓).
- Total previsto do filtro atual (sem contar cancelados).
- Ações por linha: confirmar, concluir, faltou, cancelar, editar, excluir (com confirmação).
- Consultas de hoje ficam destacadas com uma barra azul.
- **Exportar CSV** do resultado filtrado (abre no Excel com acentos corretos).

## 7. Formulário de agendamento

Usado no Dashboard, na Agenda, em Agendamentos e em Pacientes.

- Campos: paciente, dentista, procedimento (mostra duração e valor), data, horário, observações e status (na edição).
- **Horários em botões**: só aparecem os do expediente. Os ocupados ficam riscados e bloqueados.
- Resumo ao final: "Restauração das 09:00 às 10:00 — R$ 250,00".
- **Validações**:
  - todos os campos obrigatórios;
  - não deixa agendar no passado;
  - não deixa agendar domingo, nem sábado se a clínica não atender;
  - não deixa passar do horário de fechamento (considera a duração);
  - **conflito de horário**: bloqueia se o dentista **ou** o paciente já tiver consulta sobreposta, e mostra com quem.
- Dentistas desativados não aparecem para novos agendamentos.

## 8. Pacientes

- Cards com avatar de iniciais, CPF, idade, telefone, e-mail, convênio e total de consultas.
- Observações (ex.: alergia) em destaque amarelo ⚠.
- Busca por nome, CPF, telefone ou e-mail.
- **Cadastro/edição** com:
  - máscara de **CPF** (000.000.000-00) e **telefone** ((47) 99999-9999);
  - **validação real do CPF** (dígitos verificadores);
  - CPF duplicado bloqueado;
  - validação de e-mail e de data de nascimento.
- **Histórico** de consultas do paciente em linha do tempo.
- Botão **Agendar** direto do card (o paciente já vem selecionado).
- Excluir paciente (com confirmação) também remove os agendamentos dele.

## 9. Dentistas

- Cards com faixa na cor do dentista, CRO, especialidade, telefone e contadores (agendados e concluídos).
- Cadastro/edição: nome, CRO (único), telefone, especialidade (lista) e **cor na agenda** (8 opções).
- **Ativar/desativar**: o desativado fica acinzentado e não recebe novos agendamentos.
- Excluir (com confirmação) remove os agendamentos dele.

## 10. Procedimentos

- Tabela com nome, duração, valor e quantas vezes já foi realizado.
- Cadastro/edição com duração de 15 a 180 min e valor em R$.
- Não deixa excluir um procedimento que já tem agendamentos.

## 11. Configurações

- Nome da clínica (aparece na sidebar).
- Horário de **abertura** e **fechamento**.
- **Intervalo da agenda**: 15, 30 ou 60 min.
- **Atende aos sábados?** (interruptor animado).
- Nome do usuário logado.
- **Exportar backup** (.json) e **importar backup**.
- **Restaurar dados de exemplo** (apaga tudo e recarrega a base de demonstração).

## 12. Dados de exemplo

O sistema já vem com dados para demonstração:
- 3 dentistas (Ortodontia, Implantodontia, Clínico Geral)
- 6 pacientes com CPFs válidos
- 7 procedimentos (Avaliação, Limpeza, Restauração, Canal, Clareamento, Manutenção de Aparelho, Extração)
- 13 agendamentos distribuídos na semana atual e na próxima, com status variados

## 13. Regras de negócio (resumo)

| Regra | Onde |
|---|---|
| Sem conflito de horário por dentista e por paciente | `DataContext.findConflict` |
| Horário dentro do expediente, considerando a duração | `AppointmentModal` |
| Sem agendamento no passado, domingo ou sábado (se fechado) | `AppointmentModal` |
| CPF válido e único | `Pacientes` + `utils.validCPF` |
| CRO único | `Dentistas` |
| Procedimento em uso não pode ser excluído | `Procedimentos` |
| Excluir paciente/dentista remove os agendamentos ligados | `DataContext` |
| Faturamento = só consultas concluídas | `Dashboard` |
| Cancelados não ocupam horário | `DataContext.findConflict` |

## 14. Status de um agendamento

```
agendado ──► confirmado ──► concluido
    │             │
    ├──► cancelado (libera o horário)
    └──► faltou
```
