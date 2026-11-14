import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, Plus, CalendarDays } from 'lucide-react'
import { useData } from '../context/DataContext.jsx'
import AppointmentModal from '../components/AppointmentModal.jsx'
import { todayISO, addDays, weekStart, parseISO, toMin, fromMin, fmtDate } from '../utils.js'

const PX_PER_MIN = 1.6

export default function Agenda() {
  const { agendamentos, dentistas, config, byId } = useData()
  // fim de semana sem expediente → abre na próxima semana
  const [ref, setRef] = useState(() => {
    const t = todayISO()
    const dow = parseISO(t).getDay()
    if (dow === 0) return addDays(t, 1)
    if (dow === 6 && !config.sabado) return addDays(t, 2)
    return t
  })
  const [dir, setDir] = useState(0)
  const [filtro, setFiltro] = useState('todos')
  const [modal, setModal] = useState({ open: false, editing: null, preset: null })
  const hoje = todayISO()

  const ws = weekStart(ref)
  const nDias = config.sabado ? 6 : 5
  const dias = Array.from({ length: nDias }, (_, i) => addDays(ws, i))

  const ini = toMin(config.abertura)
  const fim = toMin(config.fechamento)
  const step = Number(config.intervalo) || 30
  const linhas = []
  for (let m = ini; m < fim; m += step) linhas.push(m)

  const eventos = useMemo(
    () =>
      agendamentos.filter(
        (a) => dias.includes(a.data) && a.status !== 'cancelado' && (filtro === 'todos' || a.dentistaId === filtro)
      ),
    [agendamentos, dias.join(), filtro]
  )

  const go = (n) => {
    setDir(n)
    setRef(addDays(ws, n * 7))
  }

  const nowMin = new Date().getHours() * 60 + new Date().getMinutes()

  const openNew = (data, hora) => {
    if (data < hoje) return
    setModal({ open: true, editing: null, preset: { data, hora, dentistaId: filtro !== 'todos' ? filtro : '' } })
  }

  return (
    <div className="page">
      <div className="page-head">
        <div className="week-nav">
          <motion.button whileTap={{ scale: 0.9 }} className="icon-btn" onClick={() => go(-1)}><ChevronLeft size={20} /></motion.button>
          <button className="btn ghost sm" onClick={() => { setDir(0); setRef(hoje) }}>Hoje</button>
          <motion.button whileTap={{ scale: 0.9 }} className="icon-btn" onClick={() => go(1)}><ChevronRight size={20} /></motion.button>
          <h2 className="week-title">{fmtDate(dias[0])} — {fmtDate(dias[dias.length - 1])}</h2>
        </div>
        <div className="head-actions">
          <input type="date" className="input" value={ref} onChange={(e) => e.target.value && setRef(e.target.value)} />
          <select className="input" value={filtro} onChange={(e) => setFiltro(e.target.value)}>
            <option value="todos">Todos os dentistas</option>
            {dentistas.map((d) => <option key={d.id} value={d.id}>{d.nome}</option>)}
          </select>
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.96 }} className="btn primary" onClick={() => setModal({ open: true, editing: null, preset: { dentistaId: filtro !== 'todos' ? filtro : '' } })}>
            <Plus size={18} /> Agendar
          </motion.button>
        </div>
      </div>

      <div className="legend">
        {dentistas.map((d) => (
          <button key={d.id} className={`legend-item ${filtro === d.id ? 'on' : ''}`} onClick={() => setFiltro(filtro === d.id ? 'todos' : d.id)}>
            <i style={{ background: d.cor }} /> {d.nome}
          </button>
        ))}
      </div>

      <div className="card calendar-card">
        <AnimatePresence mode="wait" custom={dir}>
          <motion.div
            key={ws}
            custom={dir}
            initial={{ opacity: 0, x: dir * 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: dir * -60 }}
            transition={{ duration: 0.25 }}
            className="calendar"
            style={{ '--cols': nDias }}
          >
            <div className="cal-head">
              <div className="cal-corner"><CalendarDays size={16} /></div>
              {dias.map((d) => {
                const dt = parseISO(d)
                return (
                  <div key={d} className={`cal-day-head ${d === hoje ? 'today' : ''}`}>
                    <small>{dt.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '')}</small>
                    <strong>{dt.getDate()}</strong>
                  </div>
                )
              })}
            </div>

            <div className="cal-body">
              <div className="cal-times">
                {linhas.map((m) => (
                  <div key={m} className="cal-time" style={{ height: step * PX_PER_MIN }}>{fromMin(m)}</div>
                ))}
              </div>
              {dias.map((d) => (
                <div key={d} className={`cal-col ${d < hoje ? 'past' : ''}`}>
                  {linhas.map((m) => (
                    <div key={m} className="cal-cell" style={{ height: step * PX_PER_MIN }} onClick={() => openNew(d, fromMin(m))} title={d < hoje ? '' : `Agendar ${fromMin(m)}`} />
                  ))}
                  {d === hoje && nowMin >= ini && nowMin <= fim && (
                    <div className="now-line" style={{ top: (nowMin - ini) * PX_PER_MIN }}><span /></div>
                  )}
                  {eventos
                    .filter((a) => a.data === d)
                    .map((a, i) => {
                      const p = byId('pacientes', a.pacienteId)
                      const dent = byId('dentistas', a.dentistaId)
                      const pr = byId('procedimentos', a.procedimentoId)
                      const top = (toMin(a.hora) - ini) * PX_PER_MIN
                      const h = (pr?.duracao || 30) * PX_PER_MIN
                      // colunas paralelas quando há sobreposição de dentistas diferentes
                      const overlaps = eventos.filter((b) => b.data === d && Math.abs(toMin(b.hora) - toMin(a.hora)) < (pr?.duracao || 30))
                      const idx = overlaps.findIndex((b) => b.id === a.id)
                      const w = 100 / overlaps.length
                      return (
                        <motion.button
                          key={a.id}
                          className={`event st-${a.status}`}
                          style={{ top, height: h - 3, left: `calc(${idx * w}% + 3px)`, width: `calc(${w}% - 6px)`, '--c': dent?.cor || '#0ea5e9' }}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: i * 0.03 }}
                          whileHover={{ scale: 1.03, zIndex: 5 }}
                          onClick={(e) => { e.stopPropagation(); setModal({ open: true, editing: a, preset: null }) }}
                        >
                          <b>{a.hora} · {p?.nome?.split(' ')[0]}</b>
                          {h > 40 && <small>{pr?.nome}</small>}
                        </motion.button>
                      )
                    })}
                </div>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <AppointmentModal open={modal.open} editing={modal.editing} preset={modal.preset} onClose={() => setModal({ open: false, editing: null, preset: null })} />
    </div>
  )
}
