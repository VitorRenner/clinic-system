import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { CalendarCheck, Users, Wallet, TrendingUp, Plus, CheckCircle2, XCircle, Clock } from 'lucide-react'
import { useData } from '../context/DataContext.jsx'
import { useToast } from '../context/ToastContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { Counter, StatusBadge, Empty, listItem } from '../components/UI.jsx'
import AppointmentModal from '../components/AppointmentModal.jsx'
import { todayISO, addDays, weekStart, money, fmtDateLong, parseISO, initials } from '../utils.js'

export default function Dashboard() {
  const { agendamentos, pacientes, byId, agendamentosApi, dentistas } = useData()
  const { user } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const [modal, setModal] = useState(false)
  const hoje = todayISO()

  const stats = useMemo(() => {
    const doDia = agendamentos.filter((a) => a.data === hoje && a.status !== 'cancelado')
    const ym = hoje.slice(0, 7)
    const doMes = agendamentos.filter((a) => a.data.startsWith(ym))
    const faturamento = doMes.filter((a) => a.status === 'concluido').reduce((s, a) => s + (byId('procedimentos', a.procedimentoId)?.valor || 0), 0)
    const validos = doMes.filter((a) => ['concluido', 'faltou'].includes(a.status))
    const comparecimento = validos.length ? (validos.filter((a) => a.status === 'concluido').length / validos.length) * 100 : 100
    return { doDia: doDia.length, pacientes: pacientes.length, faturamento, comparecimento }
  }, [agendamentos, pacientes, hoje, byId])

  const semana = useMemo(() => {
    const ws = weekStart(hoje)
    return Array.from({ length: 6 }, (_, i) => {
      const d = addDays(ws, i)
      const n = agendamentos.filter((a) => a.data === d && a.status !== 'cancelado').length
      return { d, n, label: parseISO(d).toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '') }
    })
  }, [agendamentos, hoje])
  const maxN = Math.max(1, ...semana.map((s) => s.n))

  const proximos = agendamentos
    .filter((a) => a.data === hoje && a.status !== 'cancelado')
    .sort((a, b) => a.hora.localeCompare(b.hora))

  const porDentista = dentistas.map((d) => ({
    ...d,
    n: agendamentos.filter((a) => a.dentistaId === d.id && a.data.startsWith(hoje.slice(0, 7)) && a.status !== 'cancelado').length,
  }))
  const maxD = Math.max(1, ...porDentista.map((d) => d.n))

  const cards = [
    { label: 'Consultas hoje', value: stats.doDia, icon: CalendarCheck, color: 'blue', to: '/agenda' },
    { label: 'Pacientes', value: stats.pacientes, icon: Users, color: 'violet', to: '/pacientes' },
    { label: 'Faturamento do mês', value: stats.faturamento, icon: Wallet, color: 'green', fmt: (v) => money(v) },
    { label: 'Comparecimento', value: stats.comparecimento, icon: TrendingUp, color: 'amber', fmt: (v) => `${Math.round(v)}%` },
  ]

  const quick = (a, status) => {
    agendamentosApi.update(a.id, { status })
    toast(status === 'concluido' ? 'Consulta concluída' : status === 'confirmado' ? 'Presença confirmada' : 'Marcado como falta', 'info')
  }

  const hora = new Date().getHours()
  const saud = hora < 12 ? 'Bom dia' : hora < 18 ? 'Boa tarde' : 'Boa noite'

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h2>{saud}, {user?.nome} 👋</h2>
          <p className="muted cap">{fmtDateLong(hoje)}</p>
        </div>
        <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.96 }} className="btn primary" onClick={() => setModal(true)}>
          <Plus size={18} /> Novo agendamento
        </motion.button>
      </div>

      <div className="stats">
        {cards.map((c, i) => (
          <motion.div
            key={c.label}
            className={`stat-card ${c.color} ${c.to ? 'clickable' : ''}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            whileHover={{ y: -4 }}
            onClick={() => c.to && navigate(c.to)}
          >
            <div className="stat-icon"><c.icon size={22} /></div>
            <div>
              <small>{c.label}</small>
              <strong><Counter value={c.value} format={c.fmt} /></strong>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid-2">
        <motion.section className="card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <div className="card-head">
            <h3>Consultas de hoje</h3>
            <button className="link" onClick={() => navigate('/agenda')}>Ver agenda →</button>
          </div>
          {proximos.length === 0 ? (
            <Empty icon={Clock} title="Nenhuma consulta hoje" text="Aproveite para organizar a agenda." />
          ) : (
            <ul className="appt-list">
              {proximos.map((a, i) => {
                const p = byId('pacientes', a.pacienteId)
                const d = byId('dentistas', a.dentistaId)
                const pr = byId('procedimentos', a.procedimentoId)
                return (
                  <motion.li key={a.id} variants={listItem} initial="hidden" animate="show" custom={i} className="appt-item">
                    <div className="appt-time" style={{ borderColor: d?.cor }}>{a.hora}</div>
                    <div className="appt-info">
                      <strong>{p?.nome || '—'}</strong>
                      <small>{pr?.nome} · {d?.nome}</small>
                    </div>
                    <StatusBadge status={a.status} />
                    {['agendado', 'confirmado'].includes(a.status) && (
                      <div className="row-actions">
                        {a.status === 'agendado' && (
                          <button className="icon-btn sm" title="Confirmar" onClick={() => quick(a, 'confirmado')}><CalendarCheck size={16} /></button>
                        )}
                        <button className="icon-btn sm ok" title="Concluir" onClick={() => quick(a, 'concluido')}><CheckCircle2 size={16} /></button>
                        <button className="icon-btn sm bad" title="Faltou" onClick={() => quick(a, 'faltou')}><XCircle size={16} /></button>
                      </div>
                    )}
                  </motion.li>
                )
              })}
            </ul>
          )}
        </motion.section>

        <div className="stack">
          <motion.section className="card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <div className="card-head"><h3>Consultas na semana</h3></div>
            <div className="bars">
              {semana.map((s, i) => (
                <div key={s.d} className={`bar-col ${s.d === hoje ? 'today' : ''}`}>
                  <span className="bar-n">{s.n}</span>
                  <div className="bar-track">
                    <motion.div className="bar" initial={{ height: 0 }} animate={{ height: `${(s.n / maxN) * 100}%` }} transition={{ delay: 0.5 + i * 0.07, type: 'spring', stiffness: 120 }} />
                  </div>
                  <span className="bar-l">{s.label}</span>
                </div>
              ))}
            </div>
          </motion.section>

          <motion.section className="card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
            <div className="card-head"><h3>Atendimentos por dentista (mês)</h3></div>
            <ul className="dent-list">
              {porDentista.map((d, i) => (
                <li key={d.id}>
                  <div className="avatar sm" style={{ background: d.cor }}>{initials(d.nome.replace(/^Dr[a]?\.\s*/, ''))}</div>
                  <div className="dent-bar">
                    <div className="dent-top"><span>{d.nome}</span><b>{d.n}</b></div>
                    <div className="progress">
                      <motion.div style={{ background: d.cor }} initial={{ width: 0 }} animate={{ width: `${(d.n / maxD) * 100}%` }} transition={{ delay: 0.6 + i * 0.1, duration: 0.7 }} />
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </motion.section>
        </div>
      </div>

      <AppointmentModal open={modal} onClose={() => setModal(false)} />
    </div>
  )
}
