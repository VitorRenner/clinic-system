import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Plus, Pencil, Trash2, Search, ClipboardList, CheckCircle2, XCircle, CalendarCheck, Ban, Download } from 'lucide-react'
import { useData } from '../context/DataContext.jsx'
import { useToast } from '../context/ToastContext.jsx'
import AppointmentModal from '../components/AppointmentModal.jsx'
import { Confirm } from '../components/Modal.jsx'
import { StatusBadge, Empty, listItem } from '../components/UI.jsx'
import { fmtDate, money, STATUS, todayISO, addDays, weekStart } from '../utils.js'

export default function Agendamentos() {
  const { agendamentos, dentistas, byId, agendamentosApi } = useData()
  const toast = useToast()
  const [params] = useSearchParams()
  const [busca, setBusca] = useState('')
  const [status, setStatus] = useState(params.get('status') || 'todos')
  const [dentista, setDentista] = useState('todos')
  const [periodo, setPeriodo] = useState(params.get('data') || 'todos')
  const [sort, setSort] = useState({ key: 'data', asc: true })
  const [modal, setModal] = useState({ open: false, editing: null })
  const [del, setDel] = useState(null)
  const hoje = todayISO()

  const lista = useMemo(() => {
    const q = busca.toLowerCase()
    const ws = weekStart(hoje)
    return agendamentos
      .map((a) => ({
        ...a,
        p: byId('pacientes', a.pacienteId),
        d: byId('dentistas', a.dentistaId),
        pr: byId('procedimentos', a.procedimentoId),
      }))
      .filter((a) => status === 'todos' || a.status === status)
      .filter((a) => dentista === 'todos' || a.dentistaId === dentista)
      .filter((a) => {
        if (periodo === 'hoje') return a.data === hoje
        if (periodo === 'semana') return a.data >= ws && a.data <= addDays(ws, 6)
        if (periodo === 'mes') return a.data.startsWith(hoje.slice(0, 7))
        if (periodo === 'futuros') return a.data >= hoje
        return true
      })
      .filter((a) => !q || a.p?.nome.toLowerCase().includes(q) || a.pr?.nome.toLowerCase().includes(q) || a.d?.nome.toLowerCase().includes(q))
      .sort((x, y) => {
        const k = sort.key
        let va, vb
        if (k === 'data') { va = x.data + x.hora; vb = y.data + y.hora }
        else if (k === 'paciente') { va = x.p?.nome || ''; vb = y.p?.nome || '' }
        else if (k === 'valor') { va = x.pr?.valor || 0; vb = y.pr?.valor || 0 }
        else { va = x[k]; vb = y[k] }
        return (va > vb ? 1 : va < vb ? -1 : 0) * (sort.asc ? 1 : -1)
      })
  }, [agendamentos, busca, status, dentista, periodo, sort, byId, hoje])

  const total = lista.filter((a) => a.status !== 'cancelado').reduce((s, a) => s + (a.pr?.valor || 0), 0)

  const th = (key, label) => (
    <th className="sortable" onClick={() => setSort((s) => ({ key, asc: s.key === key ? !s.asc : true }))}>
      {label} {sort.key === key && (sort.asc ? '↑' : '↓')}
    </th>
  )

  const setSt = (a, st) => {
    agendamentosApi.update(a.id, { status: st })
    toast(`Status alterado para "${STATUS[st].label}"`, 'info')
  }

  const exportCSV = () => {
    const rows = [['Data', 'Hora', 'Paciente', 'Telefone', 'Dentista', 'Procedimento', 'Valor', 'Status']]
    lista.forEach((a) => rows.push([fmtDate(a.data), a.hora, a.p?.nome, a.p?.telefone, a.d?.nome, a.pr?.nome, a.pr?.valor, STATUS[a.status].label]))
    const csv = rows.map((r) => r.map((c) => `"${String(c ?? '').replace(/"/g, '""')}"`).join(';')).join('\n')
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const el = document.createElement('a')
    el.href = url
    el.download = `agendamentos-${hoje}.csv`
    el.click()
    URL.revokeObjectURL(url)
    toast('CSV exportado')
  }

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h2>Agendamentos</h2>
          <p className="muted">{lista.length} registro(s) · previsto {money(total)}</p>
        </div>
        <div className="head-actions">
          <button className="btn ghost" onClick={exportCSV}><Download size={17} /> CSV</button>
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.96 }} className="btn primary" onClick={() => setModal({ open: true, editing: null })}>
            <Plus size={18} /> Novo
          </motion.button>
        </div>
      </div>

      <div className="filters card">
        <label className="input-icon grow">
          <Search size={16} />
          <input placeholder="Buscar por paciente, dentista ou procedimento..." value={busca} onChange={(e) => setBusca(e.target.value)} />
        </label>
        <select className="input" value={periodo} onChange={(e) => setPeriodo(e.target.value)}>
          <option value="todos">Todo período</option>
          <option value="hoje">Hoje</option>
          <option value="semana">Esta semana</option>
          <option value="mes">Este mês</option>
          <option value="futuros">Futuros</option>
        </select>
        <select className="input" value={dentista} onChange={(e) => setDentista(e.target.value)}>
          <option value="todos">Todos dentistas</option>
          {dentistas.map((d) => <option key={d.id} value={d.id}>{d.nome}</option>)}
        </select>
      </div>

      <div className="chips">
        {['todos', ...Object.keys(STATUS)].map((s) => (
          <button key={s} className={`chip ${status === s ? 'on' : ''}`} onClick={() => setStatus(s)}>
            {status === s && <motion.span layoutId="chip-bg" className="chip-bg" />}
            <span>{s === 'todos' ? 'Todos' : STATUS[s].label}</span>
            <em>{s === 'todos' ? agendamentos.length : agendamentos.filter((a) => a.status === s).length}</em>
          </button>
        ))}
      </div>

      <div className="card table-card">
        {lista.length === 0 ? (
          <Empty icon={ClipboardList} title="Nenhum agendamento encontrado" text="Ajuste os filtros ou crie um novo agendamento." />
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  {th('data', 'Data / Hora')}
                  {th('paciente', 'Paciente')}
                  <th>Dentista</th>
                  <th>Procedimento</th>
                  {th('valor', 'Valor')}
                  {th('status', 'Status')}
                  <th className="right">Ações</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence initial={false}>
                  {lista.map((a, i) => (
                    <motion.tr key={a.id} variants={listItem} initial="hidden" animate="show" exit="exit" custom={i} layout className={a.data === hoje ? 'row-today' : ''}>
                      <td><b>{fmtDate(a.data)}</b><br /><small className="muted">{a.hora}</small></td>
                      <td>{a.p?.nome || <i className="muted">removido</i>}<br /><small className="muted">{a.p?.telefone}</small></td>
                      <td><span className="dot" style={{ background: a.d?.cor }} />{a.d?.nome}</td>
                      <td>{a.pr?.nome}<br /><small className="muted">{a.pr?.duracao} min</small></td>
                      <td>{money(a.pr?.valor)}</td>
                      <td><StatusBadge status={a.status} /></td>
                      <td className="right">
                        <div className="row-actions">
                          {a.status === 'agendado' && <button className="icon-btn sm" title="Confirmar" onClick={() => setSt(a, 'confirmado')}><CalendarCheck size={16} /></button>}
                          {['agendado', 'confirmado'].includes(a.status) && (
                            <>
                              <button className="icon-btn sm ok" title="Concluir" onClick={() => setSt(a, 'concluido')}><CheckCircle2 size={16} /></button>
                              <button className="icon-btn sm bad" title="Faltou" onClick={() => setSt(a, 'faltou')}><XCircle size={16} /></button>
                              <button className="icon-btn sm" title="Cancelar" onClick={() => setSt(a, 'cancelado')}><Ban size={16} /></button>
                            </>
                          )}
                          <button className="icon-btn sm" title="Editar" onClick={() => setModal({ open: true, editing: a })}><Pencil size={16} /></button>
                          <button className="icon-btn sm bad" title="Excluir" onClick={() => setDel(a)}><Trash2 size={16} /></button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AppointmentModal
        open={modal.open}
        editing={modal.editing && agendamentos.find((x) => x.id === modal.editing.id)}
        onClose={() => setModal({ open: false, editing: null })}
      />
      <Confirm
        open={!!del}
        onClose={() => setDel(null)}
        text={del && `Excluir o agendamento de ${del.p?.nome} em ${fmtDate(del.data)} às ${del.hora}?`}
        onConfirm={() => { agendamentosApi.remove(del.id); toast('Agendamento excluído', 'info') }}
      />
    </div>
  )
}
