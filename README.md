# OdontoCare — Front-end (React + Vite)

Sistema de agendamento para clínica odontológica. Front-end 100% funcional, dados salvos no navegador (localStorage).

## Rodar

```bash
npm install
npm run dev
```

Abre em http://localhost:5173

**Login demo:** `admin@odonto.com` / `123456`

## Funcionalidades

- Login com validação e animação
- Sidebar animada (recolhível no desktop, gaveta no mobile), tema claro/escuro
- **Dashboard:** cards com contadores animados, consultas do dia com ações rápidas, gráfico semanal, atendimentos por dentista
- **Agenda semanal:** grade por horário, cor por dentista, filtro, clique no horário vazio para agendar, clique no evento para editar, linha do "agora"
- **Agendamentos:** CRUD, filtros (período, dentista, status), busca, ordenação, mudança rápida de status, exportar CSV
- **Pacientes:** CRUD com máscara e validação de CPF/telefone, histórico de consultas, agendar direto do card
- **Dentistas:** CRUD, cor na agenda, ativar/desativar
- **Procedimentos:** CRUD com duração e valor
- **Configurações:** horário de funcionamento, intervalo, sábado, backup/restauração JSON
- Validação de conflito de horário (mesmo dentista ou mesmo paciente), horário de funcionamento, domingo/sábado e datas passadas

## Estrutura

```
src/
  context/     Auth, Data (estado + localStorage), Toast
  components/  Layout (sidebar/topbar), Modal, AppointmentModal, UI
  pages/       Login, Dashboard, Agenda, Agendamentos, Pacientes, Dentistas, Procedimentos, Configuracoes
  utils.js     datas, máscaras, formatação
```

Para ligar num back-end depois, troque as funções de `src/context/DataContext.jsx` por chamadas à API.
