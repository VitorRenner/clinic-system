import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { uid, todayISO, addDays, toMin, weekStart } from '../utils.js'

const DataContext = createContext(null)
const KEY = 'odonto:data:v1'

function seed() {
  const t = todayISO()
  const ws = weekStart(t)
  const dentistas = [
    { id: 'd1', nome: 'Dra. Ana Souza', cro: 'CRO-SC 12345', especialidade: 'Ortodontia', telefone: '(47) 99911-2233', cor: '#0ea5e9', ativo: true },
    { id: 'd2', nome: 'Dr. Bruno Lima', cro: 'CRO-SC 23456', especialidade: 'Implantodontia', telefone: '(47) 99922-3344', cor: '#8b5cf6', ativo: true },
    { id: 'd3', nome: 'Dra. Carla Mendes', cro: 'CRO-SC 34567', especialidade: 'Clínico Geral', telefone: '(47) 99933-4455', cor: '#10b981', ativo: true },
  ]
  const procedimentos = [
    { id: 'p1', nome: 'Avaliação', duracao: 30, valor: 120 },
    { id: 'p2', nome: 'Limpeza (Profilaxia)', duracao: 45, valor: 180 },
    { id: 'p3', nome: 'Restauração', duracao: 60, valor: 250 },
    { id: 'p4', nome: 'Canal (Endodontia)', duracao: 90, valor: 900 },
    { id: 'p5', nome: 'Clareamento', duracao: 60, valor: 700 },
    { id: 'p6', nome: 'Manutenção Aparelho', duracao: 30, valor: 150 },
    { id: 'p7', nome: 'Extração', duracao: 60, valor: 350 },
  ]
  const pacientes = [
    { id: 'c1', nome: 'Marcos Pereira', cpf: '529.982.247-25', telefone: '(47) 98811-1111', email: 'marcos@email.com', nascimento: '1990-04-12', convenio: 'Particular', obs: '' },
    { id: 'c2', nome: 'Juliana Costa', cpf: '111.444.777-35', telefone: '(47) 98822-2222', email: 'juliana@email.com', nascimento: '1985-09-30', convenio: 'OdontoPrev', obs: 'Alergia a penicilina' },
    { id: 'c3', nome: 'Rafael Oliveira', cpf: '390.533.447-05', telefone: '(47) 98833-3333', email: 'rafael@email.com', nascimento: '2001-01-20', convenio: 'Amil Dental', obs: '' },
    { id: 'c4', nome: 'Beatriz Santos', cpf: '853.513.468-93', telefone: '(47) 98844-4444', email: 'bia@email.com', nascimento: '1998-07-05', convenio: 'Particular', obs: 'Usa aparelho fixo' },
    { id: 'c5', nome: 'Pedro Almeida', cpf: '275.484.389-23', telefone: '(47) 98855-5555', email: 'pedro@email.com', nascimento: '1975-12-15', convenio: 'Bradesco Dental', obs: '' },
    { id: 'c6', nome: 'Larissa Ferreira', cpf: '714.602.380-01', telefone: '(47) 98866-6666', email: 'larissa@email.com', nascimento: '1993-03-22', convenio: 'Particular', obs: '' },
  ]
  const mk = (dayOffset, hora, c, d, p, status) => ({
    id: uid(), pacienteId: c, dentistaId: d, procedimentoId: p,
    data: addDays(ws, dayOffset), hora, status, obs: '', criadoEm: new Date().toISOString(),
  })
  const agendamentos = [
    mk(0, '08:00', 'c1', 'd1', 'p6', 'concluido'),
    mk(0, '09:00', 'c2', 'd3', 'p2', 'concluido'),
    mk(0, '14:00', 'c5', 'd2', 'p1', 'faltou'),
    mk(1, '10:00', 'c3', 'd3', 'p3', 'concluido'),
    mk(1, '15:30', 'c4', 'd1', 'p6', 'confirmado'),
    mk(2, '08:30', 'c6', 'd2', 'p4', 'confirmado'),
    mk(2, '11:00', 'c1', 'd3', 'p2', 'agendado'),
    mk(3, '09:00', 'c2', 'd1', 'p1', 'agendado'),
    mk(3, '13:30', 'c5', 'd2', 'p7', 'agendado'),
    mk(4, '10:00', 'c3', 'd3', 'p5', 'agendado'),
    mk(4, '16:00', 'c6', 'd1', 'p6', 'cancelado'),
    mk(7, '09:00', 'c4', 'd3', 'p2', 'agendado'),
    mk(8, '14:00', 'c1', 'd2', 'p3', 'agendado'),
  ]
  return {
    dentistas,
    procedimentos,
    pacientes,
    agendamentos,
    config: { clinica: 'OdontoCare', abertura: '08:00', fechamento: '18:00', intervalo: 30, sabado: false },
  }
}

function load() {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return JSON.parse(raw)
  } catch {}
  return seed()
}

export function DataProvider({ children }) {
  const [db, setDb] = useState(load)

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(db))
  }, [db])

  const api = useMemo(() => {
    const crud = (col) => ({
      add: (item) => {
        const novo = { ...item, id: uid() }
        setDb((s) => ({ ...s, [col]: [...s[col], novo] }))
        return novo
      },
      update: (id, data) => setDb((s) => ({ ...s, [col]: s[col].map((x) => (x.id === id ? { ...x, ...data } : x)) })),
      remove: (id) => setDb((s) => ({ ...s, [col]: s[col].filter((x) => x.id !== id) })),
    })

    const byId = (col, id) => db[col].find((x) => x.id === id)

    /** retorna o agendamento em conflito (mesmo dentista ou mesmo paciente com horário sobreposto) */
    const findConflict = ({ id, data, hora, dentistaId, pacienteId, procedimentoId }) => {
      const proc = byId('procedimentos', procedimentoId)
      const ini = toMin(hora)
      const fim = ini + (proc?.duracao || 30)
      return db.agendamentos.find((a) => {
        if (a.id === id || a.data !== data || a.status === 'cancelado') return false
        if (a.dentistaId !== dentistaId && a.pacienteId !== pacienteId) return false
        const p = byId('procedimentos', a.procedimentoId)
        const aIni = toMin(a.hora)
        const aFim = aIni + (p?.duracao || 30)
        return ini < aFim && aIni < fim
      })
    }

    return {
      ...db,
      pacientesApi: crud('pacientes'),
      dentistasApi: crud('dentistas'),
      procedimentosApi: crud('procedimentos'),
      agendamentosApi: crud('agendamentos'),
      byId,
      findConflict,
      setConfig: (c) => setDb((s) => ({ ...s, config: { ...s.config, ...c } })),
      removePaciente: (id) =>
        setDb((s) => ({ ...s, pacientes: s.pacientes.filter((x) => x.id !== id), agendamentos: s.agendamentos.filter((a) => a.pacienteId !== id) })),
      removeDentista: (id) =>
        setDb((s) => ({ ...s, dentistas: s.dentistas.filter((x) => x.id !== id), agendamentos: s.agendamentos.filter((a) => a.dentistaId !== id) })),
      resetAll: () => setDb(seed()),
      exportJSON: () => JSON.stringify(db, null, 2),
      importJSON: (txt) => {
        const d = JSON.parse(txt)
        if (!d.pacientes || !d.dentistas || !d.procedimentos || !d.agendamentos) throw new Error('Arquivo inválido')
        setDb({ ...seed(), ...d })
      },
    }
  }, [db])

  return <DataContext.Provider value={api}>{children}</DataContext.Provider>
}

export const useData = () => useContext(DataContext)
